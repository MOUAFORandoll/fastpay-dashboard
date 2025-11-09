"use client";

import { useEffect } from "react";
import { useMobileServicesStore } from "@/stores/mobile-services.store";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminServicesPage() {
  const {
    services,
    isLoading,
    fetchServices,
    enableOrDisableService,
  } = useMobileServicesStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated, fetchServices]);

  // Ensure services is always an array
  const servicesList = Array.isArray(services) ? services : [];

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await enableOrDisableService(id);
      toast.success(
        `Service ${currentStatus ? "disabled" : "enabled"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Mobile Services Management</CardTitle>
          <CardDescription>
            Enable or disable mobile money services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading services...</div>
            </div>
          ) : servicesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground">No services found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {servicesList.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      <Badge variant="outline">{service.country}</Badge>
                      <Badge variant="secondary">{service.code_prefix}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div>Endpoint: {service.api_endpoint}</div>
                      <div>
                        Created: {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Status:</span>
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={() =>
                          handleToggle(service.id, service.isActive)
                        }
                      />
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

