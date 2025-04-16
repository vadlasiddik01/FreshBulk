import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Address } from "@shared/schema";
import { useToast } from "./use-toast";

export const useAddresses = (email: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Fetch addresses by email
  const { 
    data: addresses = [], 
    isLoading, 
    error 
  } = useQuery<Address[]>({
    queryKey: ["/api/addresses", email],
    queryFn: async () => {
      if (!email) return [];
      const response = await fetch(`/api/addresses?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      return response.json();
    },
    enabled: !!email,
  });

  // Get the currently selected address (default or manually selected)
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId) || 
                          addresses.find(addr => addr.isDefault) || 
                          addresses[0] || 
                          null;

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<Address, "id" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/addresses", addressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses", email] });
      toast({
        title: "Address Saved",
        description: "Your address has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save address: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ 
      id, 
      addressData 
    }: { 
      id: number; 
      addressData: Partial<Omit<Address, "id" | "createdAt">> 
    }) => {
      const response = await apiRequest("PUT", `/api/addresses/${id}`, addressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses", email] });
      toast({
        title: "Address Updated",
        description: "Your address has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update address: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/addresses/${id}`);
      return { success: response.ok };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses", email] });
      toast({
        title: "Address Deleted",
        description: "Your address has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete address: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Set address as default
  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/addresses/${id}/set-default`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses", email] });
      toast({
        title: "Default Address Updated",
        description: "Your default delivery address has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update default address: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Manually select an address
  const selectAddress = (id: number) => {
    setSelectedAddressId(id);
  };

  return {
    addresses,
    selectedAddress,
    isLoading,
    error,
    selectAddress,
    createAddress: createAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    setAsDefaultAddress: setDefaultAddressMutation.mutate,
    isCreating: createAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
    isSettingDefault: setDefaultAddressMutation.isPending,
  };
};