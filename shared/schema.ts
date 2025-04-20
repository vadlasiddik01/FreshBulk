import { pgTable, text, serial, numeric, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Address modelnpm install drizzle-orm @neondatabase/serverless

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

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
  notes: text("notes").default(""),
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

// Export all tables
export * from './schema';
