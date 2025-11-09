"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  CreditCard,
  ArrowRight,
  Zap,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Receipt,
} from "lucide-react";
import Link from "next/link";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

export default function MerchantPage() {
  const { overview, isLoading, fetchOverview } = useAnalyticsStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOverview();
    }
  }, [isAuthenticated, fetchOverview]);

  const analyticsCards = [
    {
      title: "Total Transactions",
      value: overview?.totalTransactions ?? 0,
      description: "All transactions processed",
      icon: Receipt,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      format: formatNumber,
    },
    {
      title: "Total Amount",
      value: overview?.totalAmount ?? 0,
      description: "Total revenue generated",
      icon: DollarSign,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      format: formatCurrency,
    },
    {
      title: "Successful Transactions",
      value: overview?.successfulTransactions ?? 0,
      description: "Completed transactions",
      icon: CheckCircle2,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      format: formatNumber,
    },
    {
      title: "Failed Transactions",
      value: overview?.failedTransactions ?? 0,
      description: "Transactions that failed",
      icon: XCircle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/20",
      format: formatNumber,
    },
    {
      title: "Commissions",
      value: overview?.commissions ?? 0,
      description: "Total commissions earned",
      icon: TrendingUp,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      format: formatCurrency,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <div className="flex flex-col gap-2 animate-slide-up">
        <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
        <p className="text-muted-foreground">
          Manage payments, transfers, and quick links
        </p>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="animate-slide-up"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: "both",
              }}
            >
              <CardHeader>
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded ${card.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <CardDescription>{card.title}</CardDescription>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {card.format(card.value)}
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Cards Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          className="animate-slide-up"
          style={{
            animationDelay: "0.05s",
            animationFillMode: "both",
          }}
        >
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/20">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>
              Create payment links and manage transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/merchant/payments">
                Manage Payments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card
          className="animate-slide-up"
          style={{
            animationDelay: "0.1s",
            animationFillMode: "both",
          }}
        >
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Transfers</CardTitle>
            <CardDescription>
              Transfer funds to bank or mobile money accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/merchant/transfers">
                Manage Transfers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card
          className="animate-slide-up"
          style={{
            animationDelay: "0.15s",
            animationFillMode: "both",
          }}
        >
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Create shareable payment links in seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/merchant/quick">
                Create Quick Links
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

