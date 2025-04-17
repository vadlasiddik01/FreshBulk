import { 
  Product, 
  InsertProduct, 
  Order, 
  InsertOrder, 
  OrderItem, 
  OrderStatus,
  Address,
  InsertAddress,
  User,
  InsertUser
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
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
  
  // Address methods
  getAllAddresses(): Promise<Address[]>;
  getAddressById(id: number): Promise<Address | undefined>;
  getAddressesByEmail(email: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<boolean>;
  setDefaultAddress(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private addresses: Map<number, Address>;
  private currentUserId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentAddressId: number;
  private orderNumberPrefix: string;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.addresses = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentAddressId = 1;
    this.orderNumberPrefix = "FBO-";
    
    // Initialize with sample products
    this.seedProducts();
    // Create an admin user
    this.seedAdminUser();
  }
  
  // Create an admin user
  private seedAdminUser() {
    const adminExists = Array.from(this.users.values()).some(user => user.role === 'admin');
    if (!adminExists) {
      this.createUser({
        username: "admin",
        password: "admin123", // In a real app, this would be hashed
        email: "admin@example.com",
        role: "admin"
      });
    }
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
  
  // Address methods
  async getAllAddresses(): Promise<Address[]> {
    return Array.from(this.addresses.values());
  }

  async getAddressById(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async getAddressesByEmail(email: string): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(
      (address) => address.customerEmail.toLowerCase() === email.toLowerCase()
    );
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const id = this.currentAddressId++;
    const createdAt = new Date();
    
    // If this is the first address or marked as default, ensure it's set as default
    const isDefault = address.isDefault || this.addresses.size === 0;
    
    // If this will be the default, remove default status from other addresses
    if (isDefault) {
      Array.from(this.addresses.entries()).forEach(([addressId, existingAddress]) => {
        if (existingAddress.customerEmail === address.customerEmail) {
          const updated = { ...existingAddress, isDefault: false };
          this.addresses.set(addressId, updated);
        }
      });
    }

    const newAddress: Address = {
      ...address,
      id,
      createdAt,
      isDefault
    };
    
    this.addresses.set(id, newAddress);
    return newAddress;
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const existingAddress = this.addresses.get(id);
    if (!existingAddress) return undefined;

    // Handle default address logic
    if (address.isDefault) {
      Array.from(this.addresses.entries()).forEach(([addressId, addr]) => {
        if (addressId !== id && addr.customerEmail === existingAddress.customerEmail) {
          const updated = { ...addr, isDefault: false };
          this.addresses.set(addressId, updated);
        }
      });
    }

    const updatedAddress = { ...existingAddress, ...address };
    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<boolean> {
    const address = this.addresses.get(id);
    if (!address) return false;
    
    // If deleting a default address, set the next available one as default
    if (address.isDefault) {
      const otherAddresses = Array.from(this.addresses.values()).filter(
        addr => addr.id !== id && addr.customerEmail === address.customerEmail
      );
      
      if (otherAddresses.length > 0) {
        const newDefaultId = otherAddresses[0].id;
        await this.setDefaultAddress(newDefaultId);
      }
    }
    
    return this.addresses.delete(id);
  }

  async setDefaultAddress(id: number): Promise<boolean> {
    const address = this.addresses.get(id);
    if (!address) return false;
    
    // Set all other addresses from this user to non-default
    Array.from(this.addresses.entries()).forEach(([addressId, addr]) => {
      if (addr.customerEmail === address.customerEmail) {
        const updated = { ...addr, isDefault: addressId === id };
        this.addresses.set(addressId, updated);
      }
    });
    
    return true;
  }
  
  // User methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();

    const newUser: User = {
      ...user,
      id,
      createdAt,
    };

    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}

export const storage = new MemStorage();
