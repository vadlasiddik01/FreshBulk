import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  orderItemSchema,
  insertAddressSchema,
  OrderStatusType
} from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { 
  initializeEmailService, 
  sendOrderConfirmation, 
  sendOrderStatusUpdate 
} from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Initialize email service
  initializeEmailService();
  // Product routes - Public access for viewing
  app.get("/api/products", async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });

  // Admin-only product management
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const success = await storage.deleteProduct(productId);
    
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(204).end();
  });

  // Order routes
  // Admin can view all orders
  app.get("/api/orders", isAdmin, async (req, res) => {
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  // Admin can view any order by ID
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user is admin or the order belongs to them
    if (req.user.role !== 'admin' && req.user.email !== order.customerEmail) {
      return res.status(403).json({ message: "You don't have permission to view this order" });
    }
    
    res.json(order);
  });

  // Public tracking of orders by number
  app.get("/api/orders/track/:orderNumber", async (req, res) => {
    const orderNumber = req.params.orderNumber;
    const order = await storage.getOrderByOrderNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  });

  // Anyone can place an order, authentication is optional
  app.post("/api/orders", async (req, res) => {
    try {
      // Validate the items array separately
      const itemsSchema = z.array(orderItemSchema);
      const items = itemsSchema.parse(req.body.items);
      
      // Process the order with validated items
      const orderData = insertOrderSchema.parse(req.body);
      const newOrder = await storage.createOrder(orderData);
      
      // Send order confirmation email
      sendOrderConfirmation(newOrder)
        .then(sent => {
          if (sent) {
            console.log(`Order confirmation email sent to ${newOrder.customerEmail} for order ${newOrder.orderNumber}`);
          } else {
            console.warn(`Failed to send order confirmation email for order ${newOrder.orderNumber}`);
          }
        })
        .catch(error => {
          console.error(`Error sending order confirmation email: ${error}`);
        });
      
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        console.error("Order creation error:", error);
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Only admin can update order status
  app.patch("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const statusSchema = z.object({ status: z.string() });
      const { status } = statusSchema.parse(req.body);
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send order status update email
      sendOrderStatusUpdate(updatedOrder, status as OrderStatusType)
        .then(sent => {
          if (sent) {
            console.log(`Order status update email sent to ${updatedOrder.customerEmail} for order ${updatedOrder.orderNumber}`);
          } else {
            console.warn(`Failed to send order status update email for order ${updatedOrder.orderNumber}`);
          }
        })
        .catch(error => {
          console.error(`Error sending order status update email: ${error}`);
        });
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update order status" });
      }
    }
  });

  // Address routes
  app.get("/api/addresses", isAuthenticated, async (req, res) => {
    const email = req.query.email as string;
    
    // If email is provided, ensure the user is either admin or requesting their own addresses
    if (email) {
      if (req.user.role !== 'admin' && req.user.email !== email) {
        return res.status(403).json({ message: "You don't have permission to view these addresses" });
      }
      
      const addresses = await storage.getAddressesByEmail(email);
      return res.json(addresses);
    }
    
    // Only admins can view all addresses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const addresses = await storage.getAllAddresses();
    res.json(addresses);
  });

  app.get("/api/addresses/:id", isAuthenticated, async (req, res) => {
    const addressId = parseInt(req.params.id);
    
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    
    const address = await storage.getAddressById(addressId);
    
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Ensure the user is either admin or requesting their own address
    if (req.user.role !== 'admin' && req.user.email !== address.customerEmail) {
      return res.status(403).json({ message: "You don't have permission to view this address" });
    }
    
    res.json(address);
  });

  app.post("/api/addresses", isAuthenticated, async (req, res) => {
    try {
      const addressData = insertAddressSchema.parse(req.body);
      
      // Ensure the user is either admin or creating their own address
      if (req.user.role !== 'admin' && req.user.email !== addressData.customerEmail) {
        return res.status(403).json({ message: "You can only create addresses for your own account" });
      }
      
      const newAddress = await storage.createAddress(addressData);
      res.status(201).json(newAddress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid address data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create address" });
      }
    }
  });

  app.put("/api/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      
      if (isNaN(addressId)) {
        return res.status(400).json({ message: "Invalid address ID" });
      }
      
      const address = await storage.getAddressById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      
      // Ensure the user is either admin or updating their own address
      if (req.user.role !== 'admin' && req.user.email !== address.customerEmail) {
        return res.status(403).json({ message: "You don't have permission to update this address" });
      }
      
      const addressData = insertAddressSchema.partial().parse(req.body);
      const updatedAddress = await storage.updateAddress(addressId, addressData);
      
      res.json(updatedAddress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid address data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update address" });
      }
    }
  });

  app.delete("/api/addresses/:id", isAuthenticated, async (req, res) => {
    const addressId = parseInt(req.params.id);
    
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    
    const address = await storage.getAddressById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Ensure the user is either admin or deleting their own address
    if (req.user.role !== 'admin' && req.user.email !== address.customerEmail) {
      return res.status(403).json({ message: "You don't have permission to delete this address" });
    }
    
    const success = await storage.deleteAddress(addressId);
    
    res.status(204).end();
  });

  app.patch("/api/addresses/:id/set-default", isAuthenticated, async (req, res) => {
    const addressId = parseInt(req.params.id);
    
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    
    const address = await storage.getAddressById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Ensure the user is either admin or setting default for their own address
    if (req.user.role !== 'admin' && req.user.email !== address.customerEmail) {
      return res.status(403).json({ message: "You don't have permission to modify this address" });
    }
    
    const success = await storage.setDefaultAddress(addressId);
    
    const updatedAddress = await storage.getAddressById(addressId);
    res.json(updatedAddress);
  });

  const httpServer = createServer(app);
  return httpServer;
}
