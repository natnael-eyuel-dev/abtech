import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { telebirrService } from '@/lib/telebirr';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json({ 
        error: 'Transaction ID is required' 
      }, { status: 400 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find payment record by telebirrOrderId or metadata containing the transaction id
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { telebirrOrderId: transactionId },
          { metadata: { contains: transactionId } }
        ],
        userId: user.id
      }
    });

    if (!payment) {
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // If payment is already completed or failed, return the current status
    if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          metadata: payment.metadata ? JSON.parse(payment.metadata) : null
        }
      });
    }

    // If payment is still pending, check with Telebirr API
    const verificationResult = await telebirrService.verifyPayment(transactionId);

    if (!verificationResult.success) {
      return NextResponse.json({ 
        error: verificationResult.error || 'Failed to verify payment status' 
      }, { status: 400 });
    }

    // Update payment record with the verified status
    const newMetadata = {
      ...JSON.parse(payment.metadata || '{}'),
      verifiedAt: new Date().toISOString(),
      verificationStatus: verificationResult.status
    };

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: verificationResult.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
        metadata: JSON.stringify(newMetadata)
      }
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        createdAt: updatedPayment.createdAt,
        updatedAt: updatedPayment.updatedAt,
        metadata: updatedPayment.metadata ? JSON.parse(updatedPayment.metadata) : null
      }
    });

  } catch (error) {
    console.error('Error checking Telebirr payment status:', error);
    return NextResponse.json({ 
      error: 'Failed to check payment status' 
    }, { status: 500 });
  }
}