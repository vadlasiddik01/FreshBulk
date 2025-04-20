import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import {
  users, products, orders, addresses,
  InsertUser, InsertProduct, InsertOrder, InsertAddress
} from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export class PostgresStorage {
  // ------------------- Users -------------------

  async getAllUsers() {
    return await db.select().from(users);
  }

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user;
  }

  // ------------------- Products -------------------

  async getAllProducts() {
    return await db.select().from(products);
  }

  async getProductById(id: number) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(data: InsertProduct) {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>) {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number) {
    const [product] = await db.delete(products).where(eq(products.id, id)).returning();
    return product;
  }

  // ------------------- Orders -------------------

  async getAllOrders() {
    return await db.select().from(orders);
  }

  async getOrderById(id: number) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByOrderNumber(orderNumber: string) {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async getOrdersByEmail(email: string) {
    return await db.select().from(orders).where(eq(orders.customerEmail, email));
  }

  async createOrder(data: InsertOrder) {
    const orderNumber = `ORD-${Date.now()}`;
    const [order] = await db
      .insert(orders)
      .values({ ...data, orderNumber })
      .returning();
    return order;
  }

  async updateOrderStatus(orderNumber: string, status: string) {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.orderNumber, orderNumber))
      .returning();
    return order;
  }

  // ------------------- Addresses -------------------

  async getAllAddresses() {
    return await db.select().from(addresses);
  }

  async getAddressById(id: number) {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address;
  }

  async getAddressesByEmail(email: string) {
    return await db.select().from(addresses).where(eq(addresses.customerEmail, email));
  }

  async getDefaultAddress(email: string) {
    const [address] = await db
      .select()
      .from(addresses)
      .where(and(
        eq(addresses.customerEmail, email),
        eq(addresses.isDefault, true)
      ));
    return address;
  }

  async createAddress(data: InsertAddress) {
    const [address] = await db.insert(addresses).values(data).returning();
    return address;
  }

  async updateAddress(id: number, data: Partial<InsertAddress>) {
    const [address] = await db.update(addresses).set(data).where(eq(addresses.id, id)).returning();
    return address;
  }

  async deleteAddress(id: number) {
    const [address] = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return address;
  }

  async setDefaultAddress(addressId: number) {
    // Get the target address first
    const [target] = await db.select().from(addresses).where(eq(addresses.id, addressId));
    if (!target) return null;

    // Unset all default addresses for the user
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.customerEmail, target.customerEmail));

    // Set the new default
    const [updated] = await db.update(addresses)
      .set({ isDefault: true })
      .where(eq(addresses.id, addressId))
      .returning();

    return updated;
  }
}

export const storage = new PostgresStorage();
