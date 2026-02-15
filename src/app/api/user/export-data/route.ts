import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's articles
    const articles = await db.article.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        published: true,
        featured: true,
        trending: true,
        premium: true,
        readTime: true,
        views: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get user's comments
    const comments = await db.comment.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    // Get user's likes
    const likes = await db.like.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        createdAt: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    // Get user's payments
    const payments = await db.payment.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        amount: true,
        currency: true,
        method: true,
        phone: true,
        status: true,
        type: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get user's newsletter subscription
    const newsletter = await db.newsletterSubscription.findUnique({
      where: { userId: user.id },
      select: {
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Compile user data export
    const userData = {
      profile: user,
      articles,
      comments,
      likes,
      payments,
      newsletter,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0'
    };

    // Create JSON response with download headers
    const response = new NextResponse(JSON.stringify(userData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${user.id}-${Date.now()}.json"`
      }
    });

    return response;
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json({ 
      error: 'Failed to export user data' 
    }, { status: 500 });
  }
}