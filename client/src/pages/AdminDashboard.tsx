import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Eye, Edit, Package, BarChart3, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import UpdateOrderStatusModal from "@/components/UpdateOrderStatusModal";
import AddProductModal from "@/components/AddProductModal";
import EditProductModal from "@/components/EditProductModal";
import DeleteProductDialog from "@/components/DeleteProductDialog";
import { useAdminTabs, type AdminTab } from "@/hooks/useAdminTabs";
import { formatDate } from "@/lib/formatters";
import { type Order, type Product } from "@shared/schema";

const AdminDashboard = () => {
  const { activeTab, isTabActive, switchTab } = useAdminTabs('orders');
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Selected order/product for modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Modal states
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);

  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (orderFilter !== "all" && order.status.toLowerCase().replace(" ", "-") !== orderFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !(
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    return true;
  });

  // Handle view order
  const handleViewOrder = (order: Order) => {
    window.open(`/track-order?orderNumber=${order.orderNumber}`, '_blank');
  };

  // Handle update order status
  const handleUpdateOrderStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowUpdateStatusModal(true);
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteProductDialog(true);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-neutral-100">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-neutral-800">Admin Dashboard</h1>
        <p className="text-neutral-600 mt-2">Manage orders, products, and inventory</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="bg-white shadow-md rounded-lg p-4 h-min sticky top-4 lg:col-span-1">
          <h2 className="font-heading font-semibold text-lg text-neutral-800 mb-4">Dashboard</h2>
          <nav className="space-y-1">
            <Button
              variant={isTabActive("orders") ? "default" : "ghost"}
              className={`w-full justify-start ${isTabActive("orders") ? "bg-primary text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
              onClick={() => switchTab("orders")}
            >
              <Package className="mr-3 h-5 w-5" />
              <span>Orders</span>
            </Button>
            <Button
              variant={isTabActive("products") ? "default" : "ghost"}
              className={`w-full justify-start ${isTabActive("products") ? "bg-primary text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
              onClick={() => switchTab("products")}
            >
              <Package className="mr-3 h-5 w-5" />
              <span>Products</span>
            </Button>
            <Button
              variant={isTabActive("analytics") ? "default" : "ghost"}
              className={`w-full justify-start ${isTabActive("analytics") ? "bg-primary text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
              onClick={() => switchTab("analytics")}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              <span>Analytics</span>
            </Button>
            <Button
              variant={isTabActive("settings") ? "default" : "ghost"}
              className={`w-full justify-start ${isTabActive("settings") ? "bg-primary text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
              onClick={() => switchTab("settings")}
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </Button>
          </nav>
        </Card>
        
        {/* Main Content */}
        <Card className="bg-white shadow-md rounded-lg p-6 overflow-hidden lg:col-span-3">
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              {/* Orders Filter */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="flex gap-2">
                  <Button
                    variant={orderFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={orderFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderFilter("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={orderFilter === "in-progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderFilter("in-progress")}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={orderFilter === "delivered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderFilter("delivered")}
                  >
                    Delivered
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
                  <Input
                    type="text"
                    className="pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Orders Table */}
              <div className="border border-neutral-200 rounded-md overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-neutral-200">
                    {isLoadingOrders ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                          <p className="mt-2 text-sm text-neutral-500">Loading orders...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-neutral-500">No orders found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-800">{order.orderNumber}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-800">{order.customerName}</div>
                            <div className="text-sm text-neutral-500">{order.customerPhone}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-neutral-600">
                              {(order.items as any[]).length} items
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-800">₹{order.totalAmount.toString()}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-neutral-600">{formatDate(order.createdAt)}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <OrderStatusBadge status={order.status as any} size="sm" />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary hover:text-primary-dark"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-secondary hover:text-secondary-dark"
                                onClick={() => handleUpdateOrderStatus(order)}
                                disabled={order.status === "Delivered"}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-neutral-600">
                  {filteredOrders.length > 0 ? (
                    <>
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">{filteredOrders.length}</span> of{" "}
                      <span className="font-medium">{orders.length}</span> orders
                    </>
                  ) : (
                    "No orders found"
                  )}
                </div>
                {orders.length > 10 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === "products" && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-neutral-800">Product Inventory</h2>
                <Button 
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center"
                  onClick={() => setShowAddProductModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </div>
              
              {/* Products Table */}
              <div className="border border-neutral-200 rounded-md overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</TableHead>
                      <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-neutral-200">
                    {isLoadingProducts ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                          <p className="mt-2 text-sm text-neutral-500">Loading products...</p>
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-neutral-500">No products found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={product.imageUrl || "https://via.placeholder.com/40?text=No+Image"}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-800">{product.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-neutral-600">{product.category}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-neutral-800">₹{product.price}/{product.unit}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-secondary hover:text-secondary-dark"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Analytics Tab (Placeholder) */}
          {activeTab === "analytics" && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700">Analytics Coming Soon</h3>
              <p className="text-neutral-500 mt-2 max-w-md mx-auto">
                Sales and inventory analytics will be available in a future update.
              </p>
            </div>
          )}
          
          {/* Settings Tab (Placeholder) */}
          {activeTab === "settings" && (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700">Settings Coming Soon</h3>
              <p className="text-neutral-500 mt-2 max-w-md mx-auto">
                Account and application settings will be available in a future update.
              </p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Modals */}
      <UpdateOrderStatusModal
        open={showUpdateStatusModal}
        onOpenChange={setShowUpdateStatusModal}
        order={selectedOrder}
      />
      
      <AddProductModal
        open={showAddProductModal}
        onOpenChange={setShowAddProductModal}
      />
      
      <EditProductModal
        open={showEditProductModal}
        onOpenChange={setShowEditProductModal}
        product={selectedProduct}
      />
      
      <DeleteProductDialog
        open={showDeleteProductDialog}
        onOpenChange={setShowDeleteProductDialog}
        product={selectedProduct}
      />
    </section>
  );
};

export default AdminDashboard;
