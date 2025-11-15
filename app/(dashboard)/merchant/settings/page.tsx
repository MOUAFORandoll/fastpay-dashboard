"use client";

import { useEffect, useState } from "react";
import { useOrganisationsStore } from "@/stores/organisations.store";
import { useSettingsStore } from "@/stores/settings.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Key,
  Edit,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ApiKeyCard } from "@/components/settings/api-key-card";
import { EditOrganisationDialog } from "@/components/settings/modals/edit-organisation-dialog";
import { CreateApiKeyDialog } from "@/components/settings/modals/create-api-key-dialog";
import { ShowApiKeyDialog } from "@/components/settings/modals/show-api-key-dialog";
import { CreateWebhookDialog } from "@/components/settings/modals/create-webhook-dialog";
import { GenerateSecretConfirmDialog } from "@/components/settings/modals/generate-secret-confirm-dialog";
import { DeleteApiKeyDialog } from "@/components/settings/modals/delete-api-key-dialog";
import { ShowSecretDialog } from "@/components/settings/modals/show-secret-dialog";
import { DeleteWebhookDialog } from "@/components/settings/modals/delete-webhook-dialog";
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
    isLoading: orgLoading,
    fetchMyOrganisations,
    updateOrganisation,
  } = useOrganisationsStore();

  const {
    apiKeys,
    isLoading: settingsLoading,
    fetchApiKeys,
    generateApiKey,
    regenerateApiKeySecret,
    deleteApiKey,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    fetchWebhooks,
  } = useSettingsStore();

  const isLoading = orgLoading || settingsLoading;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateApiKeyDialogOpen, setIsCreateApiKeyDialogOpen] = useState(false);
  const [isShowApiKeyDialogOpen, setIsShowApiKeyDialogOpen] = useState(false);
  const [isCreateWebhookDialogOpen, setIsCreateWebhookDialogOpen] = useState(false);
  const [isGenerateSecretConfirmOpen, setIsGenerateSecretConfirmOpen] = useState(false);
  const [isShowSecretDialogOpen, setIsShowSecretDialogOpen] = useState(false);
  const [isDeleteApiKeyDialogOpen, setIsDeleteApiKeyDialogOpen] = useState(false);
  const [isDeleteWebhookDialogOpen, setIsDeleteWebhookDialogOpen] = useState(false);
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);
  const [isDeletingApiKey, setIsDeletingApiKey] = useState(false);
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState<ApiKeyData | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [apiKeyForSecretGeneration, setApiKeyForSecretGeneration] = useState<string | null>(null);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<{
    apiKeyId: string;
    webhook: {
      id: string;
      link: string;
      title?: string;
    };
  } | null>(null);
  const [webhookToUpdate, setWebhookToUpdate] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(null);

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
            await fetchWebhooks(apiKey.id);
          } catch (error) {
            console.error(`Failed to fetch webhooks for API key ${apiKey.id}:`, error);
          }
        }
      }
    };
    fetchAllWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeys.length]);

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

  const handleCopyApiKey = (key: string, apiKeyId: string, type: "key" | "secret") => {
    navigator.clipboard.writeText(key);
    if (type === "key") {
      setCopiedKeyId(apiKeyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } else {
      setCopiedSecretId(apiKeyId);
      setTimeout(() => setCopiedSecretId(null), 2000);
    }
    toast.success(`${type === "key" ? "API key" : "Secret"} copied to clipboard`);
  };

  const handleOpenCreateWebhookDialog = (apiKeyId: string) => {
    const { webhooks } = useSettingsStore.getState();
    const existingWebhooks = webhooks[apiKeyId] || [];
    
    // If webhook exists, open in update mode
    if (existingWebhooks.length > 0) {
      const existingWebhook = existingWebhooks[0];
      setSelectedApiKeyId(apiKeyId);
      setWebhookLink(existingWebhook.link);
      setWebhookTitle(existingWebhook.title || "");
      setWebhookToUpdate(existingWebhook.id);
      setIsCreateWebhookDialogOpen(true);
    } else {
      // No webhook exists, open in create mode
      setSelectedApiKeyId(apiKeyId);
      setWebhookLink("");
      setWebhookTitle("");
      setWebhookToUpdate(null);
      setIsCreateWebhookDialogOpen(true);
    }
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

      // If webhook exists, update it instead of creating
      if (webhookToUpdate) {
        await updateWebhook(selectedApiKeyId, webhookToUpdate, webhookData);
        toast.success("Webhook updated successfully");
      } else {
        // Check if webhook already exists
        const { webhooks } = useSettingsStore.getState();
        const existingWebhooks = webhooks[selectedApiKeyId] || [];
        
        if (existingWebhooks.length > 0) {
          toast.error("Only one webhook is allowed per API key. Please update or delete the existing webhook.");
          return;
        }
        
        await createWebhook(selectedApiKeyId, webhookData);
        toast.success("Webhook created successfully");
      }
      
      setIsCreateWebhookDialogOpen(false);
      setWebhookLink("");
      setWebhookTitle("");
      setWebhookToUpdate(null);
      await fetchWebhooks(selectedApiKeyId);
    } catch (error) {
      console.error("Failed to create/update webhook:", error);
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
      const response = await regenerateApiKeySecret(apiKeyForSecretGeneration);

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
    setIsDeleteApiKeyDialogOpen(true);
  };

  const handleDeleteApiKey = async () => {
    if (!apiKeyToDelete) {
      return;
    }

    setIsDeletingApiKey(true);

    try {
      await deleteApiKey(apiKeyToDelete.id);
      toast.success("API key deleted successfully");
      setIsDeleteApiKeyDialogOpen(false);
      setApiKeyToDelete(null);
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

  const handleDeleteWebhookClick = (apiKeyId: string, webhook: { id: string; link: string; title?: string }) => {
    setWebhookToDelete({
      apiKeyId,
      webhook,
    });
    setIsDeleteWebhookDialogOpen(true);
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) {
      return;
    }

    setIsDeletingWebhook(true);

    try {
      await deleteWebhook(webhookToDelete.apiKeyId, webhookToDelete.webhook.id);
      toast.success("Webhook deleted successfully");
      setIsDeleteWebhookDialogOpen(false);
      setWebhookToDelete(null);
      // Refresh webhooks
      await fetchWebhooks(webhookToDelete.apiKeyId);
    } catch (error) {
      console.error("Failed to delete webhook:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete webhook. Please try again."
      );
    } finally {
      setIsDeletingWebhook(false);
    }
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
                    <ApiKeyCard
                      key={apiKey.id}
                      apiKey={apiKey}
                      onDelete={() => handleDeleteApiKeyClick({ id: apiKey.id, title: apiKey.title })}
                      onGenerateSecret={() => handleGenerateSecretClick(apiKey.id)}
                      onCreateWebhook={() => handleOpenCreateWebhookDialog(apiKey.id)}
                      onDeleteWebhook={handleDeleteWebhookClick}
                      isGeneratingSecret={isGeneratingSecret && apiKeyForSecretGeneration === apiKey.id}
                      copiedKeyId={copiedKeyId}
                      copiedSecretId={copiedSecretId}
                      onCopyKey={(key, apiKeyId, type) => handleCopyApiKey(key, apiKeyId, type)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Organization Dialog */}
      <EditOrganisationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        organisation={organisation}
        description={description}
        onDescriptionChange={setDescription}
        onSubmit={handleUpdateOrganisation}
        isLoading={isLoading}
      />

      {/* Create API Key Dialog */}
      <CreateApiKeyDialog
        open={isCreateApiKeyDialogOpen}
        onOpenChange={(open) => {
          setIsCreateApiKeyDialogOpen(open);
          if (!open) {
            setApiKeyTitle("");
            setApiKeyDescription("");
          }
        }}
        title={apiKeyTitle}
        onTitleChange={setApiKeyTitle}
        description={apiKeyDescription}
        onDescriptionChange={setApiKeyDescription}
        onSubmit={handleCreateApiKey}
        isLoading={isLoading}
      />

      {/* Show New API Key Dialog */}
      <ShowApiKeyDialog
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
        apiKeyData={newApiKeyData}
        onConfirm={() => {
          setIsShowApiKeyDialogOpen(false);
          setNewApiKeyData(null);
          if (organisation?.id) {
            fetchApiKeys(organisation.id);
          }
        }}
      />

      {/* Create/Update Webhook Dialog */}
      <CreateWebhookDialog
        open={isCreateWebhookDialogOpen}
        onOpenChange={(open) => {
          setIsCreateWebhookDialogOpen(open);
          if (!open) {
            setWebhookLink("");
            setWebhookTitle("");
            setWebhookToUpdate(null);
          }
        }}
        link={webhookLink}
        onLinkChange={setWebhookLink}
        title={webhookTitle}
        onTitleChange={setWebhookTitle}
        onSubmit={handleCreateWebhook}
        isLoading={isLoading}
        isUpdateMode={!!webhookToUpdate}
      />


      {/* Generate Secret Key Confirmation Dialog */}
      <GenerateSecretConfirmDialog
        open={isGenerateSecretConfirmOpen}
        onOpenChange={(open) => {
          if (!isGeneratingSecret) {
            setIsGenerateSecretConfirmOpen(open);
            if (!open) {
              setApiKeyForSecretGeneration(null);
            }
          }
        }}
        onConfirm={handleGenerateSecret}
        isGenerating={isGeneratingSecret}
      />

      {/* Delete API Key Confirmation Dialog */}
      <DeleteApiKeyDialog
        open={isDeleteApiKeyDialogOpen}
        onOpenChange={(open) => {
          if (!isDeletingApiKey) {
            setIsDeleteApiKeyDialogOpen(open);
            if (!open) {
              setApiKeyToDelete(null);
            }
          }
        }}
        apiKey={apiKeyToDelete}
        onConfirm={handleDeleteApiKey}
        isDeleting={isDeletingApiKey}
      />

      {/* Show Generated Secret Key Dialog */}
      <ShowSecretDialog
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
        secret={generatedSecret}
        onConfirm={() => {
          setIsShowSecretDialogOpen(false);
          setGeneratedSecret(null);
          setApiKeyForSecretGeneration(null);
          if (organisation?.id) {
            fetchApiKeys(organisation.id);
          }
        }}
      />

      {/* Delete Webhook Dialog */}
      <DeleteWebhookDialog
        open={isDeleteWebhookDialogOpen}
        onOpenChange={(open) => {
          if (!isDeletingWebhook) {
            setIsDeleteWebhookDialogOpen(open);
            if (!open) {
              setWebhookToDelete(null);
            }
          }
        }}
        webhook={webhookToDelete?.webhook || null}
        onConfirm={handleDeleteWebhook}
        isDeleting={isDeletingWebhook}
      />
    </div>
  );
}
