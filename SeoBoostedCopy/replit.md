# DescriptAI - AI-Powered Product Description Generator

## Overview

DescriptAI is a full-stack web application that generates SEO-optimized product descriptions for eCommerce stores using AI. The application allows users to input product details and automatically generates compelling, keyword-rich descriptions that improve search rankings and boost sales conversions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with custom middleware
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Payment Processing**: Stripe integration for subscriptions

### Key Components

#### Authentication System
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Storage**: PostgreSQL-backed session store with automatic cleanup
- **User Management**: Complete user profile management with Stripe integration
- **Authorization**: Route-level protection with middleware

#### AI Integration
- **Provider**: OpenAI GPT-4o for content generation
- **Features**: 
  - Product description generation with customizable tone and length
  - SEO keyword suggestions and optimization
  - Content scoring and analytics
- **API Management**: Credit-based system for controlling usage

#### Database Schema
- **Users**: Profile management, subscription status, API credits
- **Products**: Product catalog with metadata and categorization
- **Descriptions**: Generated content with versioning and analytics
- **Analytics**: Performance tracking and SEO metrics
- **Sessions**: Secure session management for authentication

#### Payment System
- **Provider**: Stripe for subscription management
- **Plans**: Free tier with limited credits, Pro tier with unlimited access
- **Integration**: Webhooks for subscription updates and billing

## Data Flow

1. **User Authentication**: 
   - User logs in via Replit Auth
   - Session created and stored in PostgreSQL
   - User profile loaded with subscription status

2. **Product Management**:
   - Users create products with basic information
   - Product data stored with user association
   - Category and feature classification

3. **Description Generation**:
   - User provides product details and preferences
   - OpenAI API generates optimized content
   - Results stored with analytics metadata
   - API credits deducted from user account

4. **Analytics & Tracking**:
   - SEO scores calculated for generated content
   - Usage analytics tracked per user
   - Performance insights provided in dashboard

## External Dependencies

- **OpenAI API**: GPT-4o for content generation
- **Stripe API**: Payment processing and subscription management
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication and user management
- **Shadcn/ui**: Component library built on Radix UI

## Deployment Strategy

### Development Environment
- **Platform**: Replit with live development server
- **Hot Reload**: Vite dev server with automatic rebuilds
- **Database**: Neon development instance
- **Environment Variables**: Secure credential management

### Production Deployment
- **Build Process**: 
  - Frontend: Vite build with static asset optimization
  - Backend: esbuild bundling for Node.js deployment
- **Server**: Express.js serving both API and static files
- **Database Migrations**: Drizzle migrations with automatic schema updates
- **Scaling**: Replit autoscale deployment target

### Configuration Management
- **Environment Variables**: Separate configs for development/production
- **Database**: Automatic provisioning with connection pooling
- **Sessions**: Persistent storage with configurable TTL
- **Static Assets**: Optimized serving with caching headers

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```