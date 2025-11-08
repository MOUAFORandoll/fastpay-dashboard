"use client";

import { useEffect } from "react";
import { useCountriesStore } from "@/stores/countries.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCountriesPage() {
  const {
    countries,
    isLoading,
    fetchCountries,
    enableTransactions,
    disableTransactions,
    deleteCountry,
  } = useCountriesStore();

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleToggleTransactions = async (
    id: string,
    enabled: boolean
  ) => {
    try {
      if (enabled) {
        await enableTransactions(id);
        toast.success("Transactions enabled");
      } else {
        await disableTransactions(id);
        toast.success("Transactions disabled");
      }
    } catch (error) {
      toast.error("Failed to update country");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this country?")) {
      try {
        await deleteCountry(id);
        toast.success("Country deleted successfully");
      } catch (error) {
        toast.error("Failed to delete country");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Country Management</CardTitle>
          <CardDescription>
            Manage countries and their transaction settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading countries...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{country.libelle}</h3>
                      <Badge variant="outline">{country.codeIso2}</Badge>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Transactions:</span>
                        <Switch
                          checked={country.transactionsEnabled}
                          onCheckedChange={(checked) =>
                            handleToggleTransactions(country.id, checked)
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Auth:</span>
                        <Badge
                          variant={country.authEnabled ? "default" : "secondary"}
                        >
                          {country.authEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(country.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

