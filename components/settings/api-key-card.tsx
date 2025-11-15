"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Copy, Check, Trash2, RefreshCw, Loader2, Plus, Webhook } from "lucide-react";
import { WebhookItem } from "./webhook-item";
import { useSettingsStore } from "@/stores/settings.store";
import { toast } from "sonner";
import type { UpdateWebhookDto } from "@/types/api";

interface ApiKeyCardProps {
  apiKey: {
    id: string;
    title: string;
    description?: string;
    key?: string;
    secret?: string;
    createdAt?: string;
  };
  onDelete: () => void;
  onGenerateSecret: () => void;
  onCreateWebhook: () => void;
  isGeneratingSecret: boolean;
  copiedKeyId: string | null;
  copiedSecretId: string | null;
  onCopyKey: (key: string, apiKeyId: string, type: "key" | "secret") => void;
}

export const ApiKeyCard = ({
  apiKey,
  onDelete,
  onGenerateSecret,
  onCreateWebhook,
  isGeneratingSecret,
  copiedKeyId,
  copiedSecretId,
  onCopyKey,
}: ApiKeyCardProps) => {
  const { webhooks, deleteWebhook, updateWebhook, isLoading } = useSettingsStore();
  const apiKeyWebhooks = webhooks[apiKey.id] || [];

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhook(apiKey.id, webhookId);
      toast.success("Webhook deleted successfully");
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  };

  const handleUpdateWebhook = async (webhookId: string, data: UpdateWebhookDto) => {
    try {
      await updateWebhook(apiKey.id, webhookId, data);
      toast.success("Webhook updated successfully");
    } catch (error) {
      console.error("Failed to update webhook:", error);
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2 mb-1">
              <Key className="h-4 w-4 text-primary" />
              <span className="truncate">{apiKey.title}</span>
            </CardTitle>
            {apiKey.description && (
              <CardDescription className="text-xs line-clamp-2">
                {apiKey.description}
              </CardDescription>
            )}
            {apiKey.createdAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Created {new Date(apiKey.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* API Key Display */}
        {apiKey.key ? (
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded break-all">
                {apiKey.key}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyKey(apiKey.key!, apiKey.id, "key")}
                className="shrink-0"
              >
                {copiedKeyId === apiKey.id ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            API key is hidden for security reasons
          </p>
        )}

        {/* Secret Key Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateSecret}
              disabled={isLoading || isGeneratingSecret}
              className="h-8"
            >
              {isGeneratingSecret ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Generate Secret
                </>
              )}
            </Button>
          </div>
          {apiKey.secret ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded break-all">
                {apiKey.secret}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyKey(apiKey.secret!, apiKey.id, "secret")}
                className="shrink-0"
              >
                {copiedSecretId === apiKey.id ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Webhooks Section */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Webhook className="h-4 w-4" />
              Webhooks
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateWebhook}
              disabled={isLoading}
              className="h-7 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>

          {apiKeyWebhooks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No webhooks configured</p>
          ) : (
            <div className="space-y-2">
              {apiKeyWebhooks
                .filter((w) => w.id)
                .map((webhook) => (
                  <WebhookItem
                    key={webhook.id}
                    webhook={webhook}
                    onDelete={() => handleDeleteWebhook(webhook.id)}
                    onUpdate={(data) => handleUpdateWebhook(webhook.id, data)}
                  />
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

