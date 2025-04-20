import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Order, Product, OrderStatus, OrderStatusType, ProductCategory } from "@shared/schema";
import { formatOrderNumber, formatPrice, formatDate } from "@/lib/formatters";
import { 
  Plus, 
  PencilIcon, 
  Trash2Icon,
  ShoppingBasket, 
  Package 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type AdminTab = 'orders' | 'products';

const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  unit: z.string().min(1, "Please specify a unit (e.g., kg, pieces)"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Please provide a valid image URL")
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const { toast } = useToast();

  // Redirect if user is not an admin
  if (!user || user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  // Query for fetching orders
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
  });

  // Query for fetching products
  const {
    data: products = [],
    isLoading: isProductsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({orderId, status}: {orderId: number, status: string}) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsUpdateStatusOpen(false);
      toast({
        title: "Order status updated",
        description: "The order status has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for adding a new product
  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddProductOpen(false);
      toast({
        title: "Product added",
        description: "The product has been successfully added to the catalog.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating a product
  const updateProductMutation = useMutation({
    mutationFn: async ({id, data}: {id: number, data: ProductFormValues}) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditProductOpen(false);
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a product
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDeleteProductOpen(false);
      toast({
        title: "Product deleted",
        description: "The product has been successfully removed from the catalog.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for adding a new product
  const addProductForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      unit: "",
      description: "",
      imageUrl: "",
    },
  });

  // Form for editing a product
  const editProductForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      unit: "",
      description: "",
      imageUrl: "",
    },
  });

  const handleAddProduct = (data: ProductFormValues) => {
    addProductMutation.mutate(data);
  };

  const handleEditProduct = (data: ProductFormValues) => {
    if (selectedProduct) {
      updateProductMutation.mutate({
        id: selectedProduct.id,
        data,
      });
    }
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  const handleUpdateOrderStatus = (status: OrderStatusType) => {
    if (selectedOrder) {
      updateOrderStatusMutation.mutate({
        orderId: selectedOrder.id,
        status,
      });
    }
  };

  const openEditProductModal = (product: Product) => {
    setSelectedProduct(product);
    editProductForm.reset({
      name: product.name ?? "",
      category: product.category ?? "",
      price: product.price ?? "",
      unit: product.unit ?? "",
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
    });
    setIsEditProductOpen(true);
  };

  const openDeleteProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteProductOpen(true);
  };

  const openUpdateStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateStatusOpen(true);
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage your products and orders from one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" onValueChange={(value) => setActiveTab(value as AdminTab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders" className="flex items-center">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>
            </TabsList>
            
            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Orders Management</CardTitle>
                  <CardDescription>
                    View and manage customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isOrdersLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="loader">Loading...</div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No orders found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order: Order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {formatOrderNumber(order.orderNumber)}
                              </TableCell>
                              <TableCell>{order.customerName}</TableCell>
                              <TableCell>{formatDate(order.createdAt)}</TableCell>
                              <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                              <TableCell>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block
                                  ${order.status === OrderStatus.Pending ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${order.status === OrderStatus.Processing ? 'bg-blue-100 text-blue-800' : ''}
                                  ${order.status === OrderStatus.Shipped ? 'bg-purple-100 text-purple-800' : ''}
                                  ${order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' : ''}
                                  ${order.status === OrderStatus.Cancelled ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                  {order.status}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openUpdateStatusModal(order)}
                                >
                                  Update Status
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Products Management</CardTitle>
                    <CardDescription>
                      Add, edit, or remove products from your catalog
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAddProductOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </CardHeader>
                <CardContent>
                  {isProductsLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="loader">Loading...</div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No products found. Add your first product.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product: Product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell>{formatPrice(product.price)}</TableCell>
                              <TableCell>{product.unit}</TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openEditProductModal(product)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openDeleteProductModal(product)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new product to your catalog
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addProductForm.handleSubmit(handleAddProduct)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  {...addProductForm.register("name")}
                />
                {addProductForm.formState.errors.name && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addProductForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select 
                  onValueChange={(value) => addProductForm.setValue("category", value)}
                  defaultValue={addProductForm.getValues("category")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductCategory.Vegetables}>Vegetables</SelectItem>
                    <SelectItem value={ProductCategory.Fruits}>Fruits</SelectItem>
                    <SelectItem value={ProductCategory.LeafyGreens}>Leafy Greens</SelectItem>
                    <SelectItem value={ProductCategory.RootVegetables}>Root Vegetables</SelectItem>
                    <SelectItem value={ProductCategory.ExoticVegetables}>Exotic Vegetables</SelectItem>
                    <SelectItem value={ProductCategory.ExoticFruits}>Exotic Fruits</SelectItem>
                    <SelectItem value={ProductCategory.Herbs}>Herbs</SelectItem>
                  </SelectContent>
                </Select>
                {addProductForm.formState.errors.category && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addProductForm.formState.errors.category.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="price"
                    type="number"
                    className="flex-1"
                    min="0"
                    step="0.01"
                    {...addProductForm.register("price")}
                  />
                  <Label htmlFor="unit" className="whitespace-nowrap">
                    Unit
                  </Label>
                  <Input
                    id="unit"
                    className="w-24"
                    placeholder="kg, bunch"
                    {...addProductForm.register("unit")}
                  />
                </div>
                {(addProductForm.formState.errors.price || addProductForm.formState.errors.unit) && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addProductForm.formState.errors.price?.message || addProductForm.formState.errors.unit?.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  {...addProductForm.register("description")}
                />
                {addProductForm.formState.errors.description && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addProductForm.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  className="col-span-3"
                  {...addProductForm.register("imageUrl")}
                />
                {addProductForm.formState.errors.imageUrl && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {addProductForm.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addProductMutation.isPending}>
                {addProductMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editProductForm.handleSubmit(handleEditProduct)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  {...editProductForm.register("name")}
                />
                {editProductForm.formState.errors.name && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editProductForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select 
                  onValueChange={(value) => editProductForm.setValue("category", value)}
                  defaultValue={editProductForm.getValues("category")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductCategory.Vegetables}>Vegetables</SelectItem>
                    <SelectItem value={ProductCategory.Fruits}>Fruits</SelectItem>
                    <SelectItem value={ProductCategory.LeafyGreens}>Leafy Greens</SelectItem>
                    <SelectItem value={ProductCategory.RootVegetables}>Root Vegetables</SelectItem>
                    <SelectItem value={ProductCategory.ExoticVegetables}>Exotic Vegetables</SelectItem>
                    <SelectItem value={ProductCategory.ExoticFruits}>Exotic Fruits</SelectItem>
                    <SelectItem value={ProductCategory.Herbs}>Herbs</SelectItem>
                  </SelectContent>
                </Select>
                {editProductForm.formState.errors.category && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editProductForm.formState.errors.category.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="edit-price"
                    type="number"
                    className="flex-1"
                    min="0"
                    step="0.01"
                    {...editProductForm.register("price")}
                  />
                  <Label htmlFor="edit-unit" className="whitespace-nowrap">
                    Unit
                  </Label>
                  <Input
                    id="edit-unit"
                    className="w-24"
                    placeholder="kg, bunch"
                    {...editProductForm.register("unit")}
                  />
                </div>
                {(editProductForm.formState.errors.price || editProductForm.formState.errors.unit) && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editProductForm.formState.errors.price?.message || editProductForm.formState.errors.unit?.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  className="col-span-3"
                  {...editProductForm.register("description")}
                />
                {editProductForm.formState.errors.description && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editProductForm.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="edit-imageUrl"
                  className="col-span-3"
                  {...editProductForm.register("imageUrl")}
                />
                {editProductForm.formState.errors.imageUrl && (
                  <p className="text-red-500 text-sm col-span-3 col-start-2">
                    {editProductForm.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProductOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? "Updating..." : "Update Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog open={isDeleteProductOpen} onOpenChange={setIsDeleteProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProduct?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProductOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder ? formatOrderNumber(selectedOrder.orderNumber) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status" className="block mb-2">New Status</Label>
            <Select 
              onValueChange={(value) => handleUpdateOrderStatus(value as OrderStatusType)}
              defaultValue={selectedOrder?.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.Pending}>Pending</SelectItem>
                <SelectItem value={OrderStatus.Processing}>Processing</SelectItem>
                <SelectItem value={OrderStatus.Shipped}>Shipped</SelectItem>
                <SelectItem value={OrderStatus.Delivered}>Delivered</SelectItem>
                <SelectItem value={OrderStatus.Cancelled}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}