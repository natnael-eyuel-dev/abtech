import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get payment history
    const payments = await db.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        type: true,
        phone: true,
        createdAt: true,
        metadata: true
      }
    });

    return NextResponse.json({ 
      payments: payments.map(payment => {
        const metadata = JSON.parse(payment.metadata || '{}');
        return {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.method,
          type: payment.type,
          phone: payment.phone,
          createdAt: payment.createdAt,
          description: metadata.description || (
            payment.method === 'STRIPE' 
              ? 'Stripe payment' 
              : `Telebirr payment - ${payment.phone}`
          )
        };
      })
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payment history' 
    }, { status: 500 });
  }
}