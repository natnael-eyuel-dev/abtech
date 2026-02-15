"use client"

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Search,
  BookOpen,
  Globe,
  Tag,
  Mail,
  Briefcase,
  ArrowRight,
  Handshake,
  GitPullRequest
} from "lucide-react";
import { Background } from "@/components/shared/Background";

export default function FeaturesClient() {
  const features = [
    {
      icon: Globe,
      title: "News & Analysis",
      description: "Clear reporting on tech trends with practical context."
    },
    {
      icon: BookOpen,
      title: "Guides & Playbooks",
      description: "Step-by-step tutorials and patterns for real projects."
    },
    {
      icon: Search,
      title: "Search",
      description: "Find articles by title, topic, category, or tag."
    },
    {
      icon: Mail,
      title: "Newsletter",
      description: "Get email updates with new posts and highlights."
    },
    {
      icon: Users,
      title: "Community",
      description: "Join discussions and share knowledge with peers."
    },
    {
      icon: Briefcase,
      title: "Careers",
      description: "Discover roles and opportunities curated for builders."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <Background>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge variant="secondary" className="mb-4">
                Features
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                What you can do on AB TECH
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore articles, learn from guides, search by topic, join the community, and find roles.
              </p>
              <Button size="lg" asChild>
                <a href="#features">
                  Explore features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>
        </Background>
      </section>

      <div className="max-w-4xl mx-auto grid gap-6">
        {/* Features Grid */}
        <section id="features" className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Core features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Practical tools you can use today.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mb-4 flex items-center justify-center mx-auto">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-center">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground text-center">
                      <p>{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-12 pb-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-12">
                  <GitPullRequest className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-6">Questions or feature requests?</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Tell us what would help you build better.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <a href="/contact">Contact Us</a>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <a href="/community">Join the Community</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}