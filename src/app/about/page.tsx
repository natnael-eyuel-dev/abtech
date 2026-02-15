import { Metadata } from "next";
export const metadata: Metadata = {
  title: "About Us – AB TECH",
  description: "Learn about AB TECH’s mission, values, and the team crafting clear, trustworthy technology journalism.",
  openGraph: {
    title: "About Us – AB TECH",
    description: "Learn about AB TECH’s mission, values, and the team crafting clear, trustworthy technology journalism.",
    type: "website",
  },
};

import AboutClient from "./AboutClient";

export default function AboutPage() {  
  return <AboutClient />
}