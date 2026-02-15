import { NextResponse } from "next/server";
import redis from "@/lib/redis";

const PLANS_KEY = "pricing:plans";
const FAQ_KEY = "pricing:faqs";

type Plan = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  cta?: string;
  stripePriceId?: string;
  paymentType?: 'subscription' | 'payment';
  amount?: number;
  currency?: string;
};

type FAQ = { question: string; answer: string };

const defaultData = {
  plans: [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Read articles and join the community",
      features: ["All public articles", "Basic search", "Newsletter"],
      cta: "Get Started",
      popular: false,
    },
  ] as Plan[],
  faqs: [
    {
      question: "Is AB TECH free to use?",
      answer: "Yes. You can read public articles, use search, and join the community for free.",
    },
  ] as FAQ[],
};

export async function GET() {
  try {
    const plansRaw = await redis.get(PLANS_KEY);
    const faqsRaw = await redis.get(FAQ_KEY);
    const plans: Plan[] = plansRaw ? JSON.parse(plansRaw) : defaultData.plans;
    const faqs: FAQ[] = faqsRaw ? JSON.parse(faqsRaw) : defaultData.faqs;
    return NextResponse.json({ plans, faqs });
  } catch (e) {
    return NextResponse.json(defaultData, { status: 200 });
  }
}
