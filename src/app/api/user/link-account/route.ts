import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, providerAccountId, accessToken, refreshToken, expiresAt, idToken } = await request.json();

    if (!provider || !providerAccountId) {
      return NextResponse.json({ error: 'Provider and providerAccountId are required' }, { status: 400 });
    }

    // Check if the account is already linked to another user
    const existingAccount = await db.account.findFirst({
      where: {
        provider,
        providerAccountId,
      },
    });

    if (existingAccount) {
      if (existingAccount.userId === session.user.id) {
        return NextResponse.json({ error: 'Account is already linked to your profile' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Account is already linked to another user' }, { status: 400 });
    }

    // Link the account to the current user
    const newAccount = await db.account.create({
      data: {
        userId: session.user.id,
        provider,
        providerAccountId,
        type: 'oauth',
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        id_token: idToken,
      },
    });

    return NextResponse.json({ 
      message: 'Account linked successfully',
      account: {
        id: newAccount.id,
        provider: newAccount.provider,
      }
    });

  } catch (error) {
    console.error('Error linking account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    // Check if the account exists and belongs to the current user
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Don't allow unlinking if it's the only account
    const accountCount = await db.account.count({
      where: {
        userId: session.user.id,
      },
    });

    if (accountCount <= 1) {
      return NextResponse.json({ error: 'Cannot unlink the last account' }, { status: 400 });
    }

    // Unlink the account
    await db.account.delete({
      where: {
        id: account.id,
      },
    });

    return NextResponse.json({ 
      message: 'Account unlinked successfully',
      provider,
    });

  } catch (error) {
    console.error('Error unlinking account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all linked accounts for the user
    const accounts = await db.account.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        provider: true,
        type: true,
      },
    });

    return NextResponse.json({ accounts });

  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}