"use client";

import { useEffect, useState } from "react";
import { useOrganisationsStore } from "@/stores/organisations.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Key,
  Loader2,
  Plus,
  Copy,
  Check,
  Edit,
  ChevronDown,
  Webhook,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type {
  UpdateOrganisationDto,
  GenerateApiKeyOrganisationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
} from "@/types/api";

interface ApiKeyData {
  key: string;
  secret: string;
}

export default function SettingsPage() {
  const {
    organisation,
    apiKeys,
    webhooks,
    isLoading,
    fetchMyOrganisations,
    updateOrganisation,
    generateApiKey,
    fetchApiKeys,
    createWebhook,
    fetchWebhooks,
    updateWebhook,
    deleteWebhook,
    generateSecretKey,
    deleteApiKey,
  } = useOrganisationsStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateApiKeyDialogOpen, setIsCreateApiKeyDialogOpen] = useState(false);
  const [isShowApiKeyDialogOpen, setIsShowApiKeyDialogOpen] = useState(false);
  const [isCreateWebhookDialogOpen, setIsCreateWebhookDialogOpen] = useState(false);
  const [isDeleteWebhookDialogOpen, setIsDeleteWebhookDialogOpen] = useState(false);
  const [isGenerateSecretConfirmOpen, setIsGenerateSecretConfirmOpen] = useState(false);
  const [isShowSecretDialogOpen, setIsShowSecretDialogOpen] = useState(false);
  const [isDeleteApiKeyDialogOpen, setIsDeleteApiKeyDialogOpen] = useState(false);
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);
  const [isDeletingApiKey, setIsDeletingApiKey] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState<ApiKeyData | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [apiKeyForSecretGeneration, setApiKeyForSecretGeneration] = useState<string | null>(null);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null);
  const [expandedApiKeys, setExpandedApiKeys] = useState<Set<string>>(new Set());
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<{
    id: string;
    title?: string;
  } | null>(null);
  const [apiKeyWebhooks, setApiKeyWebhooks] = useState<Record<string, typeof webhooks>>({});

  // Form states
  const [description, setDescription] = useState("");
  const [apiKeyTitle, setApiKeyTitle] = useState("");
  const [apiKeyDescription, setApiKeyDescription] = useState("");
  const [webhookLink, setWebhookLink] = useState("");
  const [webhookTitle, setWebhookTitle] = useState("");

  useEffect(() => {
    fetchMyOrganisations();
  }, [fetchMyOrganisations]);

  useEffect(() => {
    if (organisation?.id) {
      fetchApiKeys(organisation.id);
      setDescription(organisation.description || "");
    }
  }, [organisation?.id, fetchApiKeys]);

  // Fetch webhooks for all API keys when they're loaded
  useEffect(() => {
    const fetchAllWebhooks = async () => {
      if (apiKeys.length > 0) {
        for (const apiKey of apiKeys) {
          try {
            setSelectedApiKeyId(apiKey.id);
            await fetchWebhooks(apiKey.id);
            // The second useEffect will update apiKeyWebhooks when webhooks state changes
          } catch (error) {
            console.error(`Failed to fetch webhooks for API key ${apiKey.id}:`, error);
          }
        }
      }
    };
    fetchAllWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeys.length]); // Only fetch when API keys count changes

  // Update webhooks when store webhooks change for the selected API key
  useEffect(() => {
    if (selectedApiKeyId) {
      setApiKeyWebhooks((prev) => ({
        ...prev,
        [selectedApiKeyId]: webhooks,
      }));
    }
  }, [webhooks, selectedApiKeyId]);

  const handleUpdateOrganisation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organisation?.id) {
      toast.error("No organization selected");
      return;
    }

    try {
      const updateData: UpdateOrganisationDto = {
        description: description.trim() || undefined,
      };

      await updateOrganisation(organisation.id, updateData);
      toast.success("Organization information updated successfully");
      setIsEditDialogOpen(false);
      await fetchMyOrganisations();
    } catch (error) {
      console.error("Failed to update organization:", error);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organisation?.id) {
      toast.error("No organization selected");
      return;
    }

    if (!apiKeyTitle.trim()) {
      toast.error("API key title is required");
      return;
    }

    try {
      const apiKeyData: GenerateApiKeyOrganisationDto = {
        title: apiKeyTitle.trim(),
        description: apiKeyDescription.trim() || undefined,
      };

      const response = await generateApiKey(organisation.id, apiKeyData);

      // Extract key and secret from response.data
      let apiKeyValue: string | null = null;
      let apiSecretValue: string | null = null;

      if (response && typeof response === "object") {
        // Check for response.data structure
        if ("data" in response) {
          const data = (response as { data?: ApiKeyData }).data;
          if (data) {
            apiKeyValue = data.key || null;
            apiSecretValue = data.secret || null;
          }
        }
        // Fallback to direct key/secret
        else if ("key" in response && typeof response.key === "string") {
          apiKeyValue = response.key;
        }
        if ("secret" in response && typeof response.secret === "string") {
          apiSecretValue = response.secret;
        }
      }

      setIsCreateApiKeyDialogOpen(false);
      setApiKeyTitle("");
      setApiKeyDescription("");

      if (apiKeyValue && apiSecretValue) {
        setNewApiKeyData({ key: apiKeyValue, secret: apiSecretValue });
        setIsShowApiKeyDialogOpen(true);
        toast.success("API key created successfully");
      } else {
        toast.success("API key created successfully");
        await fetchApiKeys(organisation.id);
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
    }
  };

  const handleCopyApiKey = (key: string, keyId: string, type: "key" | "secret") => {
    navigator.clipboard.writeText(key);
    if (type === "key") {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } else {
      setCopiedSecretId(keyId);
      setTimeout(() => setCopiedSecretId(null), 2000);
    }
    toast.success(`${type === "key" ? "API key" : "Secret"} copied to clipboard`);
  };

  const handleToggleApiKey = async (apiKeyId: string) => {
    // This function is kept for backward compatibility but is no longer used
    // since we're using cards instead of collapsible
    setSelectedApiKeyId(apiKeyId);
    try {
      await fetchWebhooks(apiKeyId);
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    }
  };

  const handleOpenCreateWebhookDialog = (apiKeyId: string) => {
    setSelectedApiKeyId(apiKeyId);
    setWebhookLink("");
    setWebhookTitle("");
    setIsCreateWebhookDialogOpen(true);
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedApiKeyId) {
      toast.error("No API key selected");
      return;
    }

    if (!webhookLink.trim()) {
      toast.error("Webhook URL is required");
      return;
    }

    try {
      const webhookData: CreateWebhookDto = {
        link: webhookLink.trim(),
        title: webhookTitle.trim() || undefined,
      };

      await createWebhook(selectedApiKeyId, webhookData);
      toast.success("Webhook created successfully");
      setIsCreateWebhookDialogOpen(false);
      setWebhookLink("");
      setWebhookTitle("");
      await fetchWebhooks(selectedApiKeyId);
    } catch (error) {
      console.error("Failed to create webhook:", error);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!selectedApiKeyId || !webhookToDelete) {
      return;
    }

    try {
      await deleteWebhook(selectedApiKeyId, webhookToDelete.id);
      toast.success("Webhook deleted successfully");
      setIsDeleteWebhookDialogOpen(false);
      setWebhookToDelete(null);
      await fetchWebhooks(selectedApiKeyId);
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  };

  const handleGenerateSecretClick = (apiKeyId: string) => {
    setApiKeyForSecretGeneration(apiKeyId);
    setIsGenerateSecretConfirmOpen(true);
  };

  const handleGenerateSecret = async () => {
    if (!apiKeyForSecretGeneration) {
      return;
    }

    setIsGeneratingSecret(true);
    setIsGenerateSecretConfirmOpen(false);

    try {
      const response = await generateSecretKey(apiKeyForSecretGeneration);

      // Extract secret from response
      let secretValue: string | null = null;

      if (response && typeof response === "object") {
        if ("data" in response) {
          const data = (response as { data?: { secret?: string } }).data;
          if (data?.secret) {
            secretValue = data.secret;
          }
        } else if ("secret" in response && typeof response.secret === "string") {
          secretValue = response.secret;
        }
      }

      if (secretValue) {
        setGeneratedSecret(secretValue);
        setIsShowSecretDialogOpen(true);
        toast.success("Secret key generated successfully");
        // Refresh API keys to update the list
        if (organisation?.id) {
          await fetchApiKeys(organisation.id);
        }
      } else {
        toast.error("Failed to extract secret key from response");
      }
    } catch (error) {
      console.error("Failed to generate secret key:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate secret key. Please try again."
      );
    } finally {
      setIsGeneratingSecret(false);
    }
  };

  const handleDeleteApiKeyClick = (apiKey: { id: string; title: string }) => {
    setApiKeyToDelete(apiKey);
    setDeleteConfirmationText("");
    setIsDeleteApiKeyDialogOpen(true);
  };

  const handleDeleteApiKey = async () => {
    if (!apiKeyToDelete) {
      return;
    }

    if (deleteConfirmationText.trim().toLowerCase() !== "delete") {
      toast.error("Please type 'delete' to confirm");
      return;
    }

    setIsDeletingApiKey(true);

    try {
      await deleteApiKey(apiKeyToDelete.id);
      toast.success("API key deleted successfully");
      setIsDeleteApiKeyDialogOpen(false);
      setApiKeyToDelete(null);
      setDeleteConfirmationText("");
      // Refresh API keys
      if (organisation?.id) {
        await fetchApiKeys(organisation.id);
      }
    } catch (error) {
      console.error("Failed to delete API key:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete API key. Please try again."
      );
    } finally {
      setIsDeletingApiKey(false);
    }
  };

  const handleCopyWebhook = (webhookLink: string, webhookId: string) => {
    navigator.clipboard.writeText(webhookLink);
    setCopiedWebhookId(webhookId);
    setTimeout(() => setCopiedWebhookId(null), 2000);
    toast.success("Webhook link copied to clipboard");
  };

  if (!organisation) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your organization settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No organization found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <Tabs defaultValue="company" className="w-full">
        <TabsList>
          <TabsTrigger value="company">
            <Building2 className="mr-2 h-4 w-4" />
            Company Information
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    View and update your organization details
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Organization Name</Label>
                  <p className="mt-1 text-sm font-medium">{organisation.libelle}</p>
                </div>
                {organisation.web_site && (
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <p className="mt-1 text-sm font-medium">{organisation.web_site}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm font-medium">
                    {organisation.description || "No description provided"}
                  </p>
                </div>
                {organisation.createdAt && (
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="mt-1 text-sm font-medium">
                      {new Date(organisation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage your API keys for programmatic access
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsCreateApiKeyDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && apiKeys.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Key className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No API keys found</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first API key to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {apiKeys.map((apiKey) => (
                    <Card key={apiKey.id} className="relative">
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
                            onClick={() => handleDeleteApiKeyClick({ id: apiKey.id, title: apiKey.title })}
                            disabled={isLoading || isDeletingApiKey}
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
                                    onClick={() =>
                                      handleCopyApiKey(apiKey.key!, apiKey.id, "key")
                                    }
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
                              <div className="flex items-center justify-between">
                                <Label>Secret Key</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleGenerateSecretClick(apiKey.id)}
                                  disabled={isLoading || isGeneratingSecret}
                                  className="h-8"
                                >
                                  {isGeneratingSecret &&
                                  apiKeyForSecretGeneration === apiKey.id ? (
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
                                    onClick={() =>
                                      handleCopyApiKey(apiKey.secret!, apiKey.id, "secret")
                                    }
                                    className="shrink-0"
                                  >
                                    {copiedSecretId === apiKey.id ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No secret key available. Generate one to get started.
                                </p>
                              )}
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
                              onClick={() => handleOpenCreateWebhookDialog(apiKey.id)}
                              disabled={isLoading}
                              className="h-7 text-xs"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add
                            </Button>
                          </div>

                          {(apiKeyWebhooks[apiKey.id] || []).length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              No webhooks configured
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {(apiKeyWebhooks[apiKey.id] || [])
                                .filter((w) => w.id)
                                .map((webhook) => (
                                  <div
                                    key={webhook.id}
                                    className="flex items-center justify-between rounded-md border p-2 gap-2"
                                  >
                                    <div className="flex-1 min-w-0">
                                      {webhook.title && (
                                        <p className="font-medium text-xs truncate mb-0.5">
                                          {webhook.title}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground truncate">
                                        {webhook.link}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopyWebhook(webhook.link, webhook.id)}
                                        className="h-7 w-7 p-0"
                                        title="Copy webhook link"
                                      >
                                        {copiedWebhookId === webhook.id ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedApiKeyId(apiKey.id);
                                          setWebhookToDelete({
                                            id: webhook.id,
                                            title: webhook.title,
                                          });
                                          setIsDeleteWebhookDialogOpen(true);
                                        }}
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Delete webhook"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Edit Company Information</DialogTitle>
            <DialogDescription className="text-base">
              Update your organization details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateOrganisation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={organisation.libelle}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Organization name cannot be changed
              </p>
            </div>

            {organisation.web_site && (
              <div className="space-y-2">
                <Label htmlFor="org-website">Website</Label>
                <Input
                  id="org-website"
                  value={organisation.web_site}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Website cannot be changed
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="org-description">Description</Label>
              <Textarea
                id="org-description"
                placeholder="Enter organization description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create API Key Dialog */}
      <Dialog
        open={isCreateApiKeyDialogOpen}
        onOpenChange={setIsCreateApiKeyDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Create API Key</DialogTitle>
            <DialogDescription className="text-base">
              Generate a new API key for programmatic access to your organization
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateApiKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="api-key-title"
                placeholder="e.g., Production API Key"
                value={apiKeyTitle}
                onChange={(e) => setApiKeyTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key-description">Description (Optional)</Label>
              <Textarea
                id="api-key-description"
                placeholder="Enter a description for this API key"
                value={apiKeyDescription}
                onChange={(e) => setApiKeyDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateApiKeyDialogOpen(false);
                  setApiKeyTitle("");
                  setApiKeyDescription("");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !apiKeyTitle.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create API Key"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show New API Key Dialog */}
      <Dialog
        open={isShowApiKeyDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsShowApiKeyDialogOpen(false);
            setNewApiKeyData(null);
            if (organisation?.id) {
              fetchApiKeys(organisation.id);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <Key className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl">API Key Created</DialogTitle>
            <DialogDescription className="text-base">
              Your API key and secret have been generated. Please copy them now as
              they will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                  {newApiKeyData?.key}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newApiKeyData?.key) {
                      navigator.clipboard.writeText(newApiKeyData.key);
                      toast.success("API key copied to clipboard");
                    }
                  }}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                  {newApiKeyData?.secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newApiKeyData?.secret) {
                      navigator.clipboard.writeText(newApiKeyData.secret);
                      toast.success("Secret key copied to clipboard");
                    }
                  }}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Store both the API key and secret securely.
                You will not be able to view the secret again. If you lose it, you'll
                need to generate a new API key, which will discard the previous one.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setIsShowApiKeyDialogOpen(false);
                setNewApiKeyData(null);
                if (organisation?.id) {
                  fetchApiKeys(organisation.id);
                }
              }}
            >
              I've copied both keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog
        open={isCreateWebhookDialogOpen}
        onOpenChange={setIsCreateWebhookDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Webhook className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Create Webhook</DialogTitle>
            <DialogDescription className="text-base">
              Add a webhook endpoint for this API key
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWebhook} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-link">
                Webhook URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="webhook-link"
                type="url"
                placeholder="https://example.com/webhook"
                value={webhookLink}
                onChange={(e) => setWebhookLink(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-title">Title (Optional)</Label>
              <Input
                id="webhook-title"
                placeholder="e.g., Payment Notifications"
                value={webhookTitle}
                onChange={(e) => setWebhookTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateWebhookDialogOpen(false);
                  setWebhookLink("");
                  setWebhookTitle("");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !webhookLink.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Webhook"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Alert Dialog */}
      <AlertDialog
        open={isDeleteWebhookDialogOpen}
        onOpenChange={(open) => {
          if (!isLoading) {
            setIsDeleteWebhookDialogOpen(open);
            if (!open) {
              setWebhookToDelete(null);
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook
              {webhookToDelete?.title && (
                <> ({webhookToDelete.title})</>
              )}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWebhook}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Secret Key Confirmation Dialog */}
      <AlertDialog
        open={isGenerateSecretConfirmOpen}
        onOpenChange={(open) => {
          if (!isGeneratingSecret) {
            setIsGenerateSecretConfirmOpen(open);
            if (!open) {
              setApiKeyForSecretGeneration(null);
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <Key className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <AlertDialogTitle className="text-xl">Generate New Secret Key</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Generating a new secret key will override the previous one. The old secret key
              will no longer be valid and cannot be recovered. Make sure you have saved your
              current secret key before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isGeneratingSecret}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerateSecret}
              disabled={isGeneratingSecret}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isGeneratingSecret ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Secret Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete API Key Confirmation Dialog */}
      <AlertDialog
        open={isDeleteApiKeyDialogOpen}
        onOpenChange={(open) => {
          if (!isDeletingApiKey) {
            setIsDeleteApiKeyDialogOpen(open);
            if (!open) {
              setApiKeyToDelete(null);
              setDeleteConfirmationText("");
            }
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl">Delete API Key</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. This will permanently delete the API key
              <strong className="font-semibold"> "{apiKeyToDelete?.title}"</strong> and its
              associated secret key. All webhooks linked to this API key will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                Type <span className="font-mono text-destructive">delete</span> to confirm:
              </Label>
              <Input
                id="delete-confirmation"
                placeholder="Type 'delete' to confirm"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                disabled={isDeletingApiKey}
                className="font-mono"
                autoFocus
              />
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> This action will immediately invalidate the API key
                and secret. Any applications using this key will stop working.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingApiKey}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApiKey}
              disabled={isDeletingApiKey || deleteConfirmationText.trim().toLowerCase() !== "delete"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingApiKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete API Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Show Generated Secret Key Dialog */}
      <Dialog
        open={isShowSecretDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsShowSecretDialogOpen(false);
            setGeneratedSecret(null);
            setApiKeyForSecretGeneration(null);
            if (organisation?.id) {
              fetchApiKeys(organisation.id);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <Key className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl">Secret Key Generated</DialogTitle>
            <DialogDescription className="text-base">
              Your new secret key has been generated. Please copy it now as it will not be
              shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                  {generatedSecret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (generatedSecret) {
                      navigator.clipboard.writeText(generatedSecret);
                      toast.success("Secret key copied to clipboard");
                    }
                  }}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Store this secret key securely. You will not be
                able to view it again. If you lose it, you'll need to generate a new secret
                key, which will override this one.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setIsShowSecretDialogOpen(false);
                setGeneratedSecret(null);
                setApiKeyForSecretGeneration(null);
                if (organisation?.id) {
                  fetchApiKeys(organisation.id);
                }
              }}
            >
              I've copied the secret key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
