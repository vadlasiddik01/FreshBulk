import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Truck, Package, AlertCircle } from "lucide-react";
import OrderItemsTable from "@/components/OrderItemsTable";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { type Order, OrderStatus } from "@shared/schema";

const TrackOrder = () => {
  const [location, setLocation] = useLocation();
  const [orderNumber, setOrderNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Extract order number from URL if provided
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const orderNum = params.get("orderNumber");
    if (orderNum) {
      setOrderNumber(orderNum);
      setSearchTerm(orderNum);
    }
  }, [location]);

  // Query for order tracking
  const {
    data: order,
    isLoading,
    isError,
    refetch
  } = useQuery<Order>({
    queryKey: ["/api/orders/track", orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      const response = await fetch(`/api/orders/track/${orderNumber}`);
      if (!response.ok) {
        throw new Error("Order not found");
      }
      return response.json();
    },
    enabled: !!orderNumber,
  });

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderNumber(searchTerm);
    
    // Update URL with order number
    setLocation(`/track-order?orderNumber=${searchTerm}`, { replace: true });
    
    refetch();
  };

  // Status timeline steps
  const statusSteps = [
    { status: OrderStatus.Pending, label: "Order Received", icon: <Check /> },
    { status: OrderStatus.InProgress, label: "Processing Order", icon: <Package /> },
    { status: OrderStatus.InProgress, label: "Out for Delivery", icon: <Truck /> },
    { status: OrderStatus.Delivered, label: "Delivered", icon: <Check /> },
  ];

  const getStepStatus = (stepIndex: number) => {
    if (!order) return "inactive";
    
    // Determine current step based on order status
    let currentStep = 0;
    switch (order.status) {
      case OrderStatus.Pending:
        currentStep = 0;
        break;
      case OrderStatus.InProgress:
        currentStep = 2; // 1 and 2 are both part of "In Progress"
        break;
      case OrderStatus.Delivered:
        currentStep = 3;
        break;
    }
    
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "inactive";
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-neutral-800">Track Your Order</h1>
        <p className="text-neutral-600 mt-2">Enter your order ID to check the current status</p>
      </div>
      
      <Card className="bg-white shadow-md rounded-lg p-6">
        <form className="mb-8" onSubmit={handleTrackOrder}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              type="text" 
              placeholder="Enter Order ID (e.g., FBO-12345)" 
              className="flex-grow border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              type="submit" 
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors whitespace-nowrap"
            >
              Track Order
            </Button>
          </div>
        </form>
        
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {isError && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Order Not Found</h3>
              <p className="text-red-600 text-sm mt-1">
                We couldn't find an order with that ID. Please check the order number and try again.
              </p>
            </div>
          </div>
        )}
        
        {order && (
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-neutral-800">Order #{order.orderNumber}</h2>
                  <p className="text-sm text-neutral-600">Placed on: {formatDate(order.createdAt)}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <OrderStatusBadge status={order.status as any} />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Order Timeline */}
              <div className="mb-6">
                <h3 className="text-md font-heading font-semibold text-neutral-700 mb-4">Order Status</h3>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neutral-200 z-0"></div>
                  
                  {statusSteps.map((step, index) => {
                    const status = getStepStatus(index);
                    let bgColor = "bg-neutral-300";
                    let textColor = "text-neutral-400";
                    let contentColor = "text-neutral-400";
                    
                    if (status === "completed") {
                      bgColor = "bg-status-success";
                      textColor = "text-white";
                      contentColor = "text-neutral-800";
                    } else if (status === "current") {
                      bgColor = step.status === OrderStatus.InProgress ? "bg-status-info" : "bg-status-success";
                      textColor = "text-white";
                      contentColor = "text-neutral-800";
                    }
                    
                    return (
                      <div key={index} className="relative z-10 flex items-start mb-4">
                        <div className={`${bgColor} ${textColor} flex items-center justify-center h-10 w-10 rounded-full`}>
                          {step.icon}
                        </div>
                        <div className="ml-4">
                          <h4 className={`text-sm font-semibold ${contentColor}`}>{step.label}</h4>
                          <p className={`text-sm ${status !== "inactive" ? "text-neutral-600" : "text-neutral-400"}`}>
                            {status === "inactive" ? "Pending" : formatDateTime(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-md font-heading font-semibold text-neutral-700 mb-4">Order Items</h3>
                <OrderItemsTable 
                  items={order.items as any[]} 
                  totalAmount={parseFloat(order.totalAmount.toString())} 
                />
              </div>
              
              {/* Delivery Information */}
              <div className="border-t border-neutral-200 pt-6 mt-6">
                <h3 className="text-md font-heading font-semibold text-neutral-700 mb-4">Delivery Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700">Delivery Address</h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      {order.deliveryAddress}<br />
                      {order.deliveryCity} - {order.deliveryPincode}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700">Contact Information</h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      Name: {order.customerName} <br />
                      Phone: {order.customerPhone} <br />
                      Email: {order.customerEmail}
                    </p>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-neutral-700">Additional Notes</h4>
                    <p className="text-sm text-neutral-600 mt-1 p-3 bg-neutral-50 rounded-md">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
};

export default TrackOrder;
