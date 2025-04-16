import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, MapPin } from "lucide-react";
import OrderItemsTable from "@/components/OrderItemsTable";
import AddItemModal from "@/components/AddItemModal";
import AddressSelector from "@/components/AddressSelector";
import { useOrderCart } from "@/hooks/useOrderCart";
import { useAddresses } from "@/hooks/useAddresses";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type OrderItem } from "@shared/schema";

// Form validation schema
const orderFormSchema = z.object({
  customerName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  customerEmail: z.string().email({ message: "Please enter a valid email address." }),
  customerPhone: z.string().min(10, { message: "Please enter a valid phone number." }),
  deliveryAddress: z.string().min(5, { message: "Address must be at least 5 characters." }),
  deliveryCity: z.string().min(2, { message: "City is required." }),
  deliveryPincode: z.string().min(5, { message: "Please enter a valid pincode." }),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const PlaceOrder = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useOrderCart();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  
  // Custom hook to manage addresses
  const {
    addresses,
    selectedAddress,
    isLoading: isLoadingAddresses,
    selectAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    setAsDefaultAddress,
    isCreating,
    isUpdating,
    isDeleting,
    isSettingDefault
  } = useAddresses(customerEmail);

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      deliveryAddress: "",
      deliveryCity: "",
      deliveryPincode: "",
      notes: "",
    },
  });
  
  // Handle email change to fetch addresses
  const watchEmail = form.watch("customerEmail");
  
  useEffect(() => {
    if (watchEmail && watchEmail.includes('@')) {
      setCustomerEmail(watchEmail);
    }
  }, [watchEmail]);

  // Update form when a saved address is selected
  useEffect(() => {
    if (selectedAddress && useExistingAddress) {
      form.setValue("customerName", selectedAddress.customerName);
      form.setValue("customerEmail", selectedAddress.customerEmail);
      form.setValue("customerPhone", selectedAddress.customerPhone);
      form.setValue("deliveryAddress", selectedAddress.addressLine);
      form.setValue("deliveryCity", selectedAddress.city);
      form.setValue("deliveryPincode", selectedAddress.pincode);
    }
  }, [selectedAddress, form, useExistingAddress]);

  // Handle the address form submission
  const handleAddressFormSubmit = (data: any) => {
    createAddress(data);
  };

  // Handle form submission
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const orderData = {
        ...data,
        items,
        totalAmount,
        status: "Pending"
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order number is ${data.orderNumber}. You can track its status anytime.`,
      });
      clearCart();
      navigate(`/track-order?orderNumber=${data.orderNumber}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to place order: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    if (items.length === 0) {
      toast({
        title: "No Items in Order",
        description: "Please add at least one item to your order before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate(data);
  };

  const handleAddItem = (item: OrderItem) => {
    // This adds the item to the cart via our custom hook
    updateQuantity(items.length, item.quantity);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-neutral-100">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-neutral-800">Place Bulk Order</h1>
        <p className="text-neutral-600 mt-2">Fill in the details below to submit your bulk order request</p>
      </div>
      
      <Card className="bg-white shadow-md rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-heading font-semibold text-neutral-800 pb-2 border-b border-neutral-200 mb-4">Customer Information</h2>
              </div>
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Delivery Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-heading font-semibold text-neutral-800 pb-2 border-b border-neutral-200 mb-4 mt-4">Delivery Information</h2>
              </div>
              
              {customerEmail && (
                <div className="md:col-span-2 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Delivery Address</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant={useExistingAddress ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseExistingAddress(true)}
                      >
                        Use Saved Address
                      </Button>
                      <Button
                        type="button"
                        variant={!useExistingAddress ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseExistingAddress(false)}
                      >
                        Enter New Address
                      </Button>
                    </div>
                  </div>
                  
                  {useExistingAddress ? (
                    <div className="border border-neutral-200 rounded-md p-4">
                      {isLoadingAddresses ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <AddressSelector
                          addresses={addresses}
                          selectedAddress={selectedAddress}
                          onSelectAddress={selectAddress}
                          onCreateAddress={createAddress}
                          onUpdateAddress={(id, data) => updateAddress({ id, addressData: data })}
                          onDeleteAddress={deleteAddress}
                          onSetDefaultAddress={setAsDefaultAddress}
                          isLoading={isCreating || isUpdating || isDeleting || isSettingDefault}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="deliveryAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Address*</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter your delivery address" rows={3} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="deliveryCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City*</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="deliveryPincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode*</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your pincode" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const formValues = form.getValues();
                            const addressData = {
                              customerName: formValues.customerName,
                              customerEmail: formValues.customerEmail,
                              customerPhone: formValues.customerPhone,
                              addressLine: formValues.deliveryAddress,
                              city: formValues.deliveryCity,
                              pincode: formValues.deliveryPincode,
                              isDefault: addresses.length === 0, // Make default if first address
                            };
                            
                            if (addressData.customerEmail && 
                                addressData.addressLine && 
                                addressData.city && 
                                addressData.pincode) {
                              createAddress(addressData);
                              setUseExistingAddress(true);
                            } else {
                              toast({
                                title: "Incomplete Information",
                                description: "Please fill out all the required address fields to save this address.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Save This Address
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {!customerEmail && (
                <>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address*</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter your delivery address" rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="deliveryCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliveryPincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {/* Order Items */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-heading font-semibold text-neutral-800 pb-2 border-b border-neutral-200 mb-4 mt-4">Order Items</h2>
              </div>
              
              <div className="md:col-span-2">
                <OrderItemsTable 
                  items={items} 
                  editable={true}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  totalAmount={totalAmount}
                />
                
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="inline-flex items-center px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md transition-colors"
                    onClick={() => setIsAddItemModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add More Items
                  </Button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special instructions for your order or delivery" 
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button 
                type="button" 
                variant="outline"
                className="mr-3"
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createOrderMutation.isPending || items.length === 0}
              >
                {createOrderMutation.isPending ? "Submitting..." : "Submit Order"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
      
      <AddItemModal 
        open={isAddItemModalOpen} 
        onOpenChange={setIsAddItemModalOpen} 
        onAddItem={handleAddItem}
      />
    </section>
  );
};

export default PlaceOrder;
