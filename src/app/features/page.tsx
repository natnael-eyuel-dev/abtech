import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features – AB TECH",
  description: "Explore what you can do on AB TECH: articles, guides, search, tags, community, and careers.",
  openGraph: {
    title: "Features – AB TECH",
    description: "Explore what you can do on AB TECH: articles, guides, search, tags, community, and careers.",
    type: "website",
  },
};

import FeaturesClient from "./FeaturesClient";

export default function FeaturesPage() {
  return <FeaturesClient />
}