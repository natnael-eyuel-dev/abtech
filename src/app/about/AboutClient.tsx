'use client'
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Target, 
  Award, 
  Globe,
  ArrowRight,
  BookOpen,
  Briefcase,
  Handshake
} from "lucide-react";
import { Background } from "@/components/shared/Background";

export default function AboutClient() {

  const values = [
    {
      icon: Target,
      title: "Accuracy First",
      description: "We verify every piece of information to ensure our content is reliable and trustworthy."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Our content is shaped by the needs and interests of our tech community."
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description: "We cover technology trends and innovations from around the world."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in every article we publish and every story we tell."
    },
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
                About AB TECH
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                A hub for builders in technology
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                AB TECH is more than journalism. It’s a hub for clear reporting, practical guides,
                an active community, and career opportunities, all in one place.
              </p>
              <Button size="lg" asChild>
                <a href="#team">
                  Meet our team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>
        </Background>
      </section>

      {/* What we do */}
      <section className="pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What we do</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We connect news, learning, community, and careers to help builders get results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mb-4 flex items-center justify-center mx-auto">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">News & Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground text-center">
                  Clear reporting on trends that matter, with context you can use. <a className="underline" href="/blog">Explore the blog</a>.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mb-4 flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Guides</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground text-center">
                  Practical tutorials, patterns, and checklists for real projects. <a className="underline" href="/help">Browse guides</a>.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mb-4 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Community</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground text-center">
                A supportive network of makers and experts. Share, ask, and grow together. <a className="underline" href="/community">Join in</a>.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mb-4 flex items-center justify-center mx-auto">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Careers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground text-center">
                  A curated jobs board for tech roles and a place to hire great talent. <a className="underline" href="/careers">See roles</a>.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
          
      {/* Mission Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We help builders deliver with confidence through clear guidance and useful connections.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <value.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{value.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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
                <Handshake className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-6">Partner with AB TECH</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Media inquiries, partnerships, or contributor pitches are welcome. We’d love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="/contact">
                      Contact Us
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/community">
                      Join the Community
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}