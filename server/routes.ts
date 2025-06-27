import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  generateProductDescription, 
  suggestKeywords, 
  calculateSEOScore,
  type ProductDescriptionRequest 
} from "./openai";
import { insertProductSchema, insertDescriptionSchema, insertAnalyticsSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/recent-products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 5;
      const products = await storage.getRecentProducts(userId, limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching recent products:", error);
      res.status(500).json({ message: "Failed to fetch recent products" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const products = await storage.getUserProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productData = insertProductSchema.parse({ ...req.body, userId });
      const product = await storage.createProduct(productData);
      
      // Track analytics
      await storage.createAnalytics({
        userId,
        productId: product.id,
        eventType: 'product_created',
        eventData: { productName: product.name, category: product.category },
      });

      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if user owns the product
      if (product.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, updates);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // AI Generation routes
  app.post('/api/generate/description', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.apiCredits !== null && user.apiCredits <= 0)) {
        return res.status(400).json({ message: "Insufficient API credits" });
      }

      const requestSchema = z.object({
        productName: z.string().min(1),
        features: z.array(z.string()),
        category: z.string().min(1),
        keywords: z.array(z.string()),
        tone: z.enum(['professional', 'casual', 'enthusiastic']),
        length: z.enum(['short', 'medium', 'long']),
        productId: z.number().optional(),
      });

      const requestData = requestSchema.parse(req.body);
      const generatedDescription = await generateProductDescription(requestData);

      // Create description record
      const descriptionData = {
        productId: requestData.productId || 0,
        userId,
        content: generatedDescription.content,
        seoScore: generatedDescription.seoScore.toString(),
        wordCount: generatedDescription.wordCount,
        keywordDensity: generatedDescription.keywordDensity.toString(),
        tone: requestData.tone,
        length: requestData.length,
      };

      const description = await storage.createDescription(descriptionData);

      // Deduct API credit
      const currentCredits = user.apiCredits || 0;
      await storage.updateUserApiCredits(userId, Math.max(0, currentCredits - 1));

      // Track analytics
      await storage.createAnalytics({
        userId,
        productId: requestData.productId || null,
        descriptionId: description.id,
        eventType: 'description_generated',
        eventData: { 
          seoScore: generatedDescription.seoScore,
          wordCount: generatedDescription.wordCount,
          tone: requestData.tone,
          length: requestData.length,
        },
      });

      res.json({
        description,
        generatedDescription,
        remainingCredits: Math.max(0, (user.apiCredits || 0) - 1),
      });
    } catch (error: any) {
      console.error("Error generating description:", error);
      
      // Handle OpenAI quota exceeded error with demo content
      if (error.message.includes('OpenAI API quota exceeded')) {
        const requestSchema = z.object({
          productName: z.string().min(1),
          features: z.array(z.string()),
          category: z.string().min(1),
          keywords: z.array(z.string()),
          tone: z.enum(['professional', 'casual', 'enthusiastic']),
          length: z.enum(['short', 'medium', 'long']),
          productId: z.number().optional(),
        });
        const requestData = requestSchema.parse(req.body);
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        const demoDescription = {
          content: `Transform your product experience with this premium ${requestData.productName}. Crafted with exceptional attention to detail, this ${requestData.category.toLowerCase()} combines innovative design with superior functionality. Key features include ${requestData.features.join(', ')}, making it the perfect choice for discerning customers. Available now with fast shipping and our satisfaction guarantee. Order today and discover why thousands of customers trust our quality and service.`,
          seoScore: 8,
          wordCount: 65,
          keywordDensity: 12.5,
          suggestedKeywords: ['premium', 'quality', 'innovative', 'satisfaction guarantee', 'fast shipping']
        };

        // Create description record with demo content
        const descriptionData = {
          productId: requestData.productId || 0,
          userId: userId,
          content: demoDescription.content,
          seoScore: demoDescription.seoScore.toString(),
          wordCount: demoDescription.wordCount,
          keywordDensity: demoDescription.keywordDensity.toString(),
          tone: requestData.tone,
          length: requestData.length,
        };

        const description = await storage.createDescription(descriptionData);
        
        return res.json({
          description,
          generatedDescription: demoDescription,
          remainingCredits: Math.max(0, (user?.apiCredits || 0) - 1),
          demoMode: true,
          message: "Demo content generated. Please add billing to your OpenAI account at https://platform.openai.com/account/billing for full AI generation."
        });
      }
      
      res.status(500).json({ message: error.message || "Failed to generate description" });
    }
  });

  app.post('/api/generate/keywords', isAuthenticated, async (req: any, res) => {
    try {
      const requestSchema = z.object({
        productName: z.string().min(1),
        category: z.string().min(1),
      });

      const { productName, category } = requestSchema.parse(req.body);
      const keywords = await suggestKeywords(productName, category);
      res.json({ keywords });
    } catch (error) {
      console.error("Error suggesting keywords:", error);
      res.status(500).json({ message: "Failed to suggest keywords" });
    }
  });

  app.post('/api/generate/seo-score', isAuthenticated, async (req: any, res) => {
    try {
      const requestSchema = z.object({
        description: z.string().min(1),
        keywords: z.array(z.string()),
      });

      const { description, keywords } = requestSchema.parse(req.body);
      const seoScore = await calculateSEOScore(description, keywords);
      res.json({ seoScore });
    } catch (error) {
      console.error("Error calculating SEO score:", error);
      res.status(500).json({ message: "Failed to calculate SEO score" });
    }
  });

  // Description routes
  app.get('/api/descriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const descriptions = await storage.getUserDescriptions(userId);
      res.json(descriptions);
    } catch (error) {
      console.error("Error fetching descriptions:", error);
      res.status(500).json({ message: "Failed to fetch descriptions" });
    }
  });

  app.get('/api/descriptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const descriptionId = parseInt(req.params.id);
      const description = await storage.getDescription(descriptionId);
      
      if (!description) {
        return res.status(404).json({ message: "Description not found" });
      }

      if (description.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(description);
    } catch (error) {
      console.error("Error fetching description:", error);
      res.status(500).json({ message: "Failed to fetch description" });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Stripe subscription routes
  if (stripe) {
    app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          });
        }

        if (!user.email) {
          return res.status(400).json({ message: "No user email on file" });
        }

        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });

        // Create a payment intent instead of subscription for simplicity
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 2900, // $29.00 in cents
          currency: 'usd',
          customer: customer.id,
          setup_future_usage: 'off_session',
          metadata: {
            type: 'subscription',
            userId: userId
          }
        });

        await storage.updateUserStripeInfo(userId, customer.id, paymentIntent.id);

        res.json({
          subscriptionId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error: any) {
        console.error("Error creating subscription:", error);
        res.status(400).json({ error: { message: error.message } });
      }
    });

    app.post('/api/webhook/stripe', async (req, res) => {
      try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig as string,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        );

        switch (event.type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;
            // Update user subscription status based on subscription status
            break;
          case 'invoice.payment_succeeded':
            const invoice = event.data.object as Stripe.Invoice;
            // Add API credits based on successful payment
            break;
        }

        res.json({ received: true });
      } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).json({ error: "Webhook error" });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
