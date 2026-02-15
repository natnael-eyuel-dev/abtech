"use client"

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Background } from "@/components/shared/Background";
import { 
  FileText, 
  Shield, 
  Users, 
  Copyright,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TermsOfServiceClient() {
  const sections = [
    {
      icon: Users,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using ABTech, you accept and agree to be bound by these Terms of Service",
        "If you do not agree to these terms, please do not use our website or services",
        "We reserve the right to modify these terms at any time",
        "Continued use of our services constitutes acceptance of any changes"
      ]
    },
    {
      icon: FileText,
      title: "Use of Services",
      content: [
        "You must be at least 13 years old to use our services",
        "You are responsible for maintaining the confidentiality of your account",
        "You agree to provide accurate and complete information",
        "You may not use our services for any illegal or unauthorized purpose",
        "You agree not to reproduce, duplicate, or copy any content without permission"
      ]
    },
    {
      icon: Shield,
      title: "User Content and Conduct",
      content: [
        "You retain ownership of any content you submit to our platform",
        "By submitting content, you grant us a worldwide, non-exclusive license to use it",
        "You agree not to post content that is unlawful, defamatory, or infringing",
        "We reserve the right to remove any content that violates these terms",
        "You are solely responsible for your interactions with other users"
      ]
    },
    {
      icon: Copyright,
      title: "Intellectual Property",
      content: [
        "All content on ABTech is owned by us or our licensors",
        "Our trademarks and service marks may not be used without permission",
        "Fair use of our content is permitted with proper attribution",
        "We respect the intellectual property rights of others",
        "DMCA notices should be sent to abtechspace@gmail.com"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Disclaimer of Warranties",
      content: [
        "Our services are provided on an 'as is' and 'as available' basis",
        "We make no warranties about the accuracy or reliability of our content",
        "We do not guarantee that our services will be uninterrupted or error-free",
        "We are not responsible for any damages arising from your use of our services",
        "Your use of our services is at your own risk"
      ]
    },
    {
      icon: XCircle,
      title: "Limitation of Liability",
      content: [
        "We shall not be liable for any indirect, incidental, or consequential damages",
        "We are not responsible for the content of third-party websites",
        "We are not liable for any unauthorized access to your account",
        "These limitations apply even if we have been advised of the possibility of damages"
      ]
    },
    {
      icon: CheckCircle,
      title: "Indemnification",
      content: [
        "You agree to indemnify us against any claims arising from your use of our services",
        "You are responsible for any legal fees incurred due to your actions",
        "This includes claims related to your content or violation of these terms",
        "We reserve the right to assume the exclusive defense of any claim",
        "You agree to cooperate in our defense of such claims"
      ]
    }
  ];

  const { toast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied`,
      description: `${text} has been copied to your clipboard.`,
    });
  };

  const lastUpdated = "2025-09-19";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <Background overlayOpacity={0.6}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge variant="secondary" className="mb-4">
                Terms of Service
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Terms of
                <span className="text-primary"> Service</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Please read these terms carefully before using ABTech. Your use of our 
                services constitutes acceptance of these terms and conditions.
              </p>
            </motion.div>
          </div>
        </Background>
      </section>

      {/* Last Updated */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6">Introduction</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Welcome to ABTech. These Terms of Service ("Terms") govern your use of our 
                  website, services, and content (collectively, the "Services"). By accessing 
                  or using ABTech, you agree to be bound by these Terms.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms constitute a legally binding agreement between you and ABTech. 
                  If you do not agree to these Terms, please do not use our Services.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to update or modify these Terms at any time without prior 
                  notice. Your continued use of the Services after any such changes constitutes 
                  acceptance of the updated Terms.
                </p>
              </div>
            </motion.div>

            {/* Terms Sections */}
            <div className="space-y-12">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <section.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.content.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Governing Law */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-16"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Governing Law</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    These Terms shall be governed by and construed in accordance with the laws 
                    of the Federal Democratic Republic of Ethiopia, without regard to its conflict of law provisions.
                  </p>
                  <p className="text-muted-foreground">
                    Any disputes arising from these Terms or your use of our Services shall be 
                    resolved in the competent courts located in Addis Ababa, Ethiopia.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Termination */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold mb-6">Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to terminate or suspend your account and access to our 
                Services at any time, without prior notice or liability, for any reason whatsoever.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, your right to use the Services will cease immediately. All 
                provisions of these Terms which by their nature should survive termination 
                shall survive, including, without limitation, ownership provisions, warranty 
                disclaimers, indemnity, and limitations of liability.
              </p>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-6 p-6 bg-muted/50 rounded-xl border shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium w-20">Email:</p>
                  <button
                    className="text-primary hover:underline"
                    onClick={() => handleCopy("abtechspace@gmail.com", "Email")}
                  >
                    abtechspace@gmail.com
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium w-20">Phone:</p>
                  <button
                    className="text-primary hover:underline"
                    onClick={() => handleCopy("+251921535412", "Phone")}
                  >
                    +251 921 535 412
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}