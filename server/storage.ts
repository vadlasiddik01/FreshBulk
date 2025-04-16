import { 
  Product, 
  InsertProduct, 
  Order, 
  InsertOrder, 
  OrderItem, 
  OrderStatus
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private currentProductId: number;
  private currentOrderId: number;
  private orderNumberPrefix: string;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.orderNumberPrefix = "FBO-";
    
    // Initialize with sample products
    this.seedProducts();
  }

  // Seed with initial products
  private seedProducts() {
    const initialProducts: InsertProduct[] = [
      {
        name: "Tomatoes",
        category: "Vegetables",
        price: "25",
        unit: "kg",
        description: "Fresh, ripe tomatoes perfect for sauces and salads.",
        imageUrl: "https://images.unsplash.com/photo-1592924357229-86f5e9152a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
      },
      {
        name: "Apples",
        category: "Fruits",
        price: "120",
        unit: "kg",
        description: "Sweet and crunchy apples, perfect for snacking or baking.",
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
      },
      {
        name: "Spinach",
        category: "Leafy Greens",
        price: "40",
        unit: "bunch",
        description: "Nutrient-rich spinach leaves for salads and cooking.",
        imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
      },
      {
        name: "Onions",
        category: "Vegetables",
        price: "30",
        unit: "kg",
        description: "Essential kitchen staple for adding flavor to any dish.",
        imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
      }
    ];

    initialProducts.forEach(product => this.createProduct(product));
  }

  // Generate a unique order number
  private generateOrderNumber(): string {
    const num = String(10000 + this.currentOrderId).substring(1);
    return `${this.orderNumberPrefix}${num}`;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const orderNumber = this.generateOrderNumber();
    const createdAt = new Date();

    const newOrder: Order = { 
      ...order, 
      id, 
      orderNumber,
      createdAt, 
      status: order.status || OrderStatus.Pending 
    };
    
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const updatedOrder = { ...order, status };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
