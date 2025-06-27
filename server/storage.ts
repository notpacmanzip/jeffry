import {
  users,
  products,
  descriptions,
  analytics,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Description,
  type InsertDescription,
  type Analytics,
  type InsertAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserApiCredits(id: string, credits: number): Promise<User>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getUserProducts(userId: string): Promise<Product[]>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Description operations
  createDescription(description: InsertDescription): Promise<Description>;
  getDescription(id: number): Promise<Description | undefined>;
  getProductDescriptions(productId: number): Promise<Description[]>;
  getUserDescriptions(userId: string): Promise<Description[]>;
  updateDescription(id: number, updates: Partial<InsertDescription>): Promise<Description>;
  
  // Analytics operations
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getUserAnalytics(userId: string): Promise<Analytics[]>;
  getDashboardStats(userId: string): Promise<{
    totalProducts: number;
    generatedThisMonth: number;
    avgSeoScore: number;
    apiCredits: number;
  }>;
  getRecentProducts(userId: string, limit: number): Promise<Product[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserApiCredits(id: string, credits: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        apiCredits: credits,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getUserProducts(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt));
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Description operations
  async createDescription(description: InsertDescription): Promise<Description> {
    const [newDescription] = await db.insert(descriptions).values(description).returning();
    return newDescription;
  }

  async getDescription(id: number): Promise<Description | undefined> {
    const [description] = await db.select().from(descriptions).where(eq(descriptions.id, id));
    return description;
  }

  async getProductDescriptions(productId: number): Promise<Description[]> {
    return await db
      .select()
      .from(descriptions)
      .where(eq(descriptions.productId, productId))
      .orderBy(desc(descriptions.createdAt));
  }

  async getUserDescriptions(userId: string): Promise<Description[]> {
    return await db
      .select()
      .from(descriptions)
      .where(eq(descriptions.userId, userId))
      .orderBy(desc(descriptions.createdAt));
  }

  async updateDescription(id: number, updates: Partial<InsertDescription>): Promise<Description> {
    const [description] = await db
      .update(descriptions)
      .set(updates)
      .where(eq(descriptions.id, id))
      .returning();
    return description;
  }

  // Analytics operations
  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db.insert(analytics).values(analytics).returning();
    return newAnalytics;
  }

  async getUserAnalytics(userId: string): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(eq(analytics.userId, userId))
      .orderBy(desc(analytics.timestamp));
  }

  async getDashboardStats(userId: string): Promise<{
    totalProducts: number;
    generatedThisMonth: number;
    avgSeoScore: number;
    apiCredits: number;
  }> {
    // Get total products
    const [totalProductsResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.userId, userId));

    // Get generated this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const [generatedThisMonthResult] = await db
      .select({ count: count() })
      .from(descriptions)
      .where(
        and(
          eq(descriptions.userId, userId),
          sql`${descriptions.createdAt} >= ${oneMonthAgo}`
        )
      );

    // Get average SEO score
    const [avgSeoScoreResult] = await db
      .select({ avg: avg(descriptions.seoScore) })
      .from(descriptions)
      .where(eq(descriptions.userId, userId));

    // Get user API credits
    const user = await this.getUser(userId);

    return {
      totalProducts: totalProductsResult.count,
      generatedThisMonth: generatedThisMonthResult.count,
      avgSeoScore: parseFloat(avgSeoScoreResult.avg || "0"),
      apiCredits: user?.apiCredits || 0,
    };
  }

  async getRecentProducts(userId: string, limit: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
