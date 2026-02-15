import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - ABTech",
  description: "Read ABTech's terms of service to understand the rules and guidelines for using our website and services.",
  openGraph: {
    title: "Terms of Service - ABTech",
    description: "Read ABTech's terms of service to understand the rules and guidelines for using our website and services.",
    type: "website",
  },
};

import TermsOfServiceClient from "./TermsClient";

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />
}