"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Zap,
  CreditCard,
  Plug,
  Headphones,
  Wallet,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Globe,
  Sun,
  Moon,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }
    
    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated && user) {
      hasRedirected.current = true;
      const { getRoleRoute } = useAuthStore.getState();
      const route = getRoleRoute();
      router.push(route);
    }
  }, [isAuthenticated, user, router]);

  const toggleTheme = () => {
    if (!mounted) return;
    // Get the resolved theme (if system, check actual system preference)
    let resolvedTheme = theme;
    if (theme === "system" && typeof window !== "undefined") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    // Toggle between light and dark
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Get the current theme for display (resolve system theme to actual theme)
  const getCurrentTheme = () => {
    if (!mounted) return "light";
    if (theme === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return "light";
    }
    return theme || "light";
  };

  const currentTheme = getCurrentTheme();

  const features = [
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Receive payments immediately with real-time processing",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "End-to-end encryption and robust infrastructure",
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Methods",
      description: "Mobile Money, Cards, Bank Transfers, Digital Wallets",
    },
    {
      icon: Plug,
      title: "Easy Integration",
      description: "Simple API integration with comprehensive documentation",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Monitor transactions and track performance in real-time",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated team to support you every step of the way",
    },
  ];

  const stats = [
    { value: "20k+", label: "Companies" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <span className="text-lg font-bold text-primary-foreground">N</span>
            </div>
            <span className="text-xl font-bold">FastPay</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              aria-label="Toggle theme"
            >
              {currentTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-linear-to-b from-background to-muted/20 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              The payment solution that{" "}
              <span className="text-primary">adapts to your growth</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Accept payments from anywhere, anytime. More than 20k companies trust
              us to manage their online payments with ease and security.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to accept payments
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to help you grow your business
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t bg-primary py-20 text-primary-foreground md:py-32 overflow-hidden">
        {/* Grid Pattern Background */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Ready to get started?
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Join thousands of businesses already using FastPay to accept
              payments and grow their revenue.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <span className="text-lg font-bold text-primary-foreground">N</span>
              </div>
              <span className="text-lg font-semibold">FastPay</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/help" className="hover:text-foreground">
                Help Center
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Use
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FastPay. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
