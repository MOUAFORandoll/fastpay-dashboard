"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface WebhookItemProps {
  webhook: {
    id: string;
    link: string;
    title?: string;
  };
  onDelete: () => void;
  onUpdate: (data: { link: string; title?: string }) => void;
}

export const WebhookItem = ({ webhook, onDelete, onUpdate }: WebhookItemProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [link, setLink] = useState(webhook.link);
  const [title, setTitle] = useState(webhook.title || "");

  const handleCopy = () => {
    navigator.clipboard.writeText(webhook.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Webhook link copied to clipboard");
  };

  const handleSave = () => {
    if (!link.trim()) {
      toast.error("Webhook URL is required");
      return;
    }
    onUpdate({ link: link.trim(), title: title.trim() || undefined });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLink(webhook.link);
    setTitle(webhook.title || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-md border p-2 space-y-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Webhook URL</Label>
          <Input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="h-7 text-xs"
            placeholder="https://example.com/webhook"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Title (Optional)</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 text-xs"
            placeholder="e.g., Payment Notifications"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="h-7 text-xs flex-1"
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-7 text-xs flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border p-2 gap-2">
      <div className="flex-1 min-w-0">
        {webhook.title && (
          <p className="font-medium text-xs truncate mb-0.5">{webhook.title}</p>
        )}
        <p className="text-xs text-muted-foreground truncate">{webhook.link}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0"
          title="Copy webhook link"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-7 w-7 p-0"
          title="Edit webhook"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Delete webhook"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

