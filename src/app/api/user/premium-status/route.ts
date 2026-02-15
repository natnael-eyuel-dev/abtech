import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { getPremiumStatus } from '@/lib/utils/premium';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        isPremium: false,
        role: 'GUEST',
        premiumExpires: null,
        hasActiveSubscription: false,
        daysRemaining: 0
      });
    }

    const premiumStatus = await getPremiumStatus();
    
    return NextResponse.json(premiumStatus);
  } catch (error) {
    console.error('Error fetching premium status:', error);
    return NextResponse.json({ 
      isPremium: false,
      role: 'ERROR',
      premiumExpires: null,
      hasActiveSubscription: false,
      daysRemaining: 0
    }, { status: 500 });
  }
}