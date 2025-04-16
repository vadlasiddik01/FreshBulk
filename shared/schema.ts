import { pgTable, text, serial, numeric, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: numeric("price").notNull(),
  unit: text("unit").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Order model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryPincode: text("delivery_pincode").notNull(),
  status: text("status").notNull().default("Pending"),
  notes: text("notes"),
  totalAmount: numeric("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  items: json("items").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
});

export const orderItemSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  unit: z.string(),
  total: z.number(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order status types
export const OrderStatus = {
  Pending: "Pending",
  InProgress: "In Progress",
  Delivered: "Delivered",
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

// Product categories
export const ProductCategory = {
  Vegetables: "Vegetables",
  Fruits: "Fruits",
  LeafyGreens: "Leafy Greens",
} as const;

export type ProductCategoryType = typeof ProductCategory[keyof typeof ProductCategory];
