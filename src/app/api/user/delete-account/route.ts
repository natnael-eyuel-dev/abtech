import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signOut } from 'next-auth/react';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ 
        error: 'Password is required to delete account' 
      }, { status: 400 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: true,
        sessions: true,
        articles: true,
        comments: true,
        likes: true,
        payments: true,
        newsletter: true
      }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Incorrect password' 
      }, { status: 400 });
    }

    // Delete user data in correct order to handle foreign key constraints
    // Delete related data first
    await Promise.all([
      // Delete accounts (OAuth providers)
      db.account.deleteMany({
        where: { userId: user.id }
      }),
      
      // Delete sessions
      db.session.deleteMany({
        where: { userId: user.id }
      }),
      
      // Delete likes
      db.like.deleteMany({
        where: { userId: user.id }
      }),
      
      // Delete comments
      db.comment.deleteMany({
        where: { authorId: user.id }
      }),
      
      // Delete payments
      db.payment.deleteMany({
        where: { userId: user.id }
      }),
      
      // Delete newsletter subscription
      user.newsletter && db.newsletterSubscription.delete({
        where: { userId: user.id }
      })
    ]);

    // Handle articles: delete articles authored by the user (authorId is required in schema)
    await db.article.deleteMany({
      where: { authorId: user.id }
    });

    // Finally delete the user
    await db.user.delete({
      where: { id: user.id }
    });

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    });

    signOut()
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account' 
    }, { status: 500 });
  }
}