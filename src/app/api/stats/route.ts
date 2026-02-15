import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const articlesCount = await db.article.count();
    const authorsCount = await db.user.count();
    const viewsSum = await db.article.aggregate({
      _sum: { views: true },
    });

    return NextResponse.json({
      articles: articlesCount,
      authors: authorsCount,
      views: viewsSum._sum.views || 0,
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
