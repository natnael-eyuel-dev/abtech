import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { telebirrService } from '@/lib/telebirr';

interface TelebirrPaymentRequest {
  amount: number;
  phoneNumber: string;
  description?: string;
}

interface TelebirrResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TelebirrPaymentRequest = await request.json();
    const { amount, phoneNumber, description } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'Valid amount is required' 
      }, { status: 400 });
    }

    if (!phoneNumber || !/^2519\d{8}$/.test(phoneNumber)) {
      return NextResponse.json({ 
        error: 'Valid Ethiopian phone number (2519xxxxxxxx) is required' 
      }, { status: 400 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Production safety: require Telebirr to be configured (and have signing keys)
    if (process.env.NODE_ENV === 'production') {
      if (!telebirrService.isConfigured()) {
        return NextResponse.json({ error: 'Telebirr is not configured' }, { status: 503 });
      }
      if (!process.env.TELEBIRR_PRIVATE_KEY || !process.env.TELEBIRR_PUBLIC_KEY) {
        return NextResponse.json({ error: 'Telebirr signing keys are not configured' }, { status: 503 });
      }
    }

    // Generate unique transaction ID
    const transactionId = `TB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'ETB',
        method: 'TELEBIRR',
        phone: phoneNumber,
        status: 'PENDING',
        type: 'PAYMENT',
        telebirrOrderId: transactionId,
        metadata: JSON.stringify({
          transactionId,
          phoneNumber,
          amount,
          paymentMethod: 'TELEBIRR'
        })
      }
    });

    // Initiate Telebirr payment using the real service
    const telebirrResponse = await telebirrService.initiatePayment({
      amount,
      phoneNumber,
      transactionId,
      description: description || 'Premium subscription via Telebirr',
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/telebirr/callback`
    });

    if (!telebirrResponse.success) {
      // Update payment record as failed
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      return NextResponse.json({ 
        error: telebirrResponse.error || 'Failed to initiate Telebirr payment' 
      }, { status: 400 });
    }

    // Update payment record with Telebirr transaction details
    await db.payment.update({
      where: { id: payment.id },
      data: {
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          merchantTransactionId: telebirrResponse.merchantTransactionId,
          redirectUrl: telebirrResponse.redirectUrl
        })
      }
    });

    return NextResponse.json({
      success: true,
      transactionId,
      redirectUrl: telebirrResponse.redirectUrl,
      amount,
      currency: 'ETB'
    });

  } catch (error) {
    console.error('Error initiating Telebirr payment:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate Telebirr payment' 
    }, { status: 500 });
  }
}