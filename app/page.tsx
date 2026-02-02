import React from "react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Play,
  FileQuestion,
  MessageCircle,
  Shield,
  Clock,
  Award,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                EduLearn
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
              Learn at Your Own Pace with Expert Guidance
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Access quality education with video lessons, interactive quizzes,
              and direct communication with administrators. Your journey to
              knowledge starts here.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Start Learning Today
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign in to Continue</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and resources for effective
              learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Play}
              title="Video Lessons"
              description="Watch high-quality video content for each subject at your own pace."
            />
            <FeatureCard
              icon={FileQuestion}
              title="Interactive Quizzes"
              description="Test your knowledge with timed quizzes and instant results."
            />
            <FeatureCard
              icon={MessageCircle}
              title="Direct Support"
              description="Message administrators directly for help and guidance."
            />
            <FeatureCard
              icon={Shield}
              title="Secure Platform"
              description="Your data is protected with enterprise-grade security."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-muted-foreground mt-1">
                Access to Content
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 mx-auto mb-4">
                <Award className="w-7 h-7 text-accent-foreground" />
              </div>
              <div className="text-3xl font-bold text-foreground">100+</div>
              <div className="text-muted-foreground mt-1">Video Lessons</div>
            </div>
            <div>
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">1000+</div>
              <div className="text-muted-foreground mt-1">Happy Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Ready to Start Learning?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of students who are already advancing their education
            with EduLearn.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8"
            asChild
          >
            <Link href="/auth/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">EduLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2026 EduLearn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
