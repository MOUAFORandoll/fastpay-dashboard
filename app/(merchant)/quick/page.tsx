"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Code, Clock, CreditCard, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function QuickLinksPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-green-50 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-green-200">
            <span className="text-2xl">🔗</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold">Create Quick links in seconds</h1>
        <p className="max-w-2xl text-muted-foreground">
          Generate shareable payment links for your customers. No coding
          required, just create and share.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/quick/create">
              <Plus className="mr-2 h-4 w-4" />
              Create a link
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn more
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-gray-100">
              <Code className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle>No coding required</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Create links in a few clicks</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-gray-100">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle>Instant payments</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Get paid immediately</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-gray-100">
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle>Multiple payment methods</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Cards, mobile money, and more</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-gray-100">
              <CheckCircle className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle>Secure transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Fully encrypted payments</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <div className="flex flex-col gap-4 rounded-lg border p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quick link resources</h3>
          <p className="text-muted-foreground">
            Learn how to create and share payment links effectively.
          </p>
          <Link href="/support" className="mt-2 text-green-600 hover:underline">
            Contact support →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Payment link guide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Best practices and tips
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Payment link templates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Ready-to-use templates
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Customize payment pages</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Brand your payment experience
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Common questions about payment links
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

