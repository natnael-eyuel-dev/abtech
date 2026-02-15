import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - TechBlog",
  description: "Find answers to common questions, tutorials, and support resources for TechBlog.",
  openGraph: {
    title: "Help Center - TechBlog",
    description: "Find answers to common questions, tutorials, and support resources for TechBlog.",
    type: "website",
  },
};

import HelpCenterClient from "./HelpClient";

export default function HelpCenterPage() {
  return <HelpCenterClient />
}