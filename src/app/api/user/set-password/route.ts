import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ 
      message: 'Password set successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        hasPassword: !!updatedUser.password,
      }
    });

  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has OAuth accounts
    const oauthAccounts = await db.account.findMany({
      where: { userId: session.user.id },
    });

    if (oauthAccounts.length === 0) {
      return NextResponse.json({ 
        error: 'Cannot remove password when no OAuth accounts are linked' 
      }, { status: 400 });
    }

    // Remove the user's password
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { password: null },
    });

    return NextResponse.json({ 
      message: 'Password removed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        hasPassword: !!updatedUser.password,
      }
    });

  } catch (error) {
    console.error('Error removing password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    return NextResponse.json({ 
      hasPassword: !!user?.password 
    });

  } catch (error) {
    console.error('Error checking password status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}