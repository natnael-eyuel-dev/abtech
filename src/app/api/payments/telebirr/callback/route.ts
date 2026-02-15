import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { grantPremiumAccess } from '@/lib/utils/premium';
import { telebirrService } from '@/lib/telebirr';
import { z } from 'zod';

const CallbackSchema = z.object({
  transactionId: z.string().min(1),
  merchantTransactionId: z.string().optional(),
  status: z.string().min(1),
  amount: z.union([z.number(), z.string()]),
  phoneNumber: z.string().optional(),
  reference: z.string().optional(),
  sign: z.string().optional(),
}).passthrough();

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = CallbackSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
    }

    const body = parsed.data;
    const { 
      transactionId, 
      merchantTransactionId, 
      status, 
      amount, 
    } = body;

    const amountNum = typeof amount === 'string' ? Number(amount) : amount;
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Validate the callback signature
    if (!telebirrService.validateCallback(body)) {
      return NextResponse.json({ 
        error: 'Invalid callback signature' 
      }, { status: 400 });
    }

    // Find payment record by telebirrOrderId (stored) or by metadata containing the merchantTransactionId
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { telebirrOrderId: transactionId },
          { metadata: { contains: merchantTransactionId ?? '' } }
        ]
      },
      include: {
        user: true
      }
    });

    if (!payment) {
      console.error('Payment not found for transaction:', transactionId);
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // Idempotency: if already finalized, return current status without re-granting premium.
    if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        message: 'Callback already processed'
      });
    }

    // Basic sanity check: callback amount should match what we recorded.
    if (payment.amount !== amountNum) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: JSON.stringify({
            originalMetadata: payment.metadata ?? null,
            reason: 'amount_mismatch',
            expectedAmount: payment.amount,
            receivedAmount: amountNum,
            callbackData: body
          })
        }
      });

      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Verify the payment with Telebirr API
    const verificationResult = await telebirrService.verifyPayment(transactionId);

    if (!verificationResult.success) {
      // Update payment record as failed
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: JSON.stringify({
            originalMetadata: payment.metadata ?? null,
            verificationError: verificationResult.error,
            callbackData: body
          })
        }
      });

      return NextResponse.json({ 
        error: 'Payment verification failed' 
      }, { status: 400 });
    }

    // Update payment record
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: verificationResult.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
        telebirrOrderId: transactionId,
        metadata: JSON.stringify({
          originalMetadata: payment.metadata ?? null,
          callbackData: body,
          verifiedAt: new Date().toISOString()
        })
      }
    });

    // If payment is successful, grant premium access
    if (verificationResult.status === 'SUCCESS') {
      await grantPremiumAccess(payment.user.email, 30); // 30 days premium access
      if (process.env.NODE_ENV !== "production") {
      console.log(`Premium access granted to user ${payment.user.id} via Telebirr payment`);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: updatedPayment.status,
      message: verificationResult.status === 'SUCCESS' ? 'Payment completed successfully' : 'Payment failed'
    });

  } catch (error) {
    console.error('Error handling Telebirr callback:', error);
    return NextResponse.json({ 
      error: 'Callback processing failed' 
    }, { status: 500 });
  }
}