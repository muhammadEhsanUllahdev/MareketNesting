# Overview

This is a full-stack multi-vendor e-commerce marketplace application built with modern web technologies. The platform supports multiple languages (English, French, Arabic with RTL support), role-based authentication (client, seller, admin), and provides comprehensive dashboards for different user types. The application features a React frontend with shadcn/ui components, an Express.js backend with PostgreSQL database using Drizzle ORM, and includes file upload capabilities with Google Cloud Storage integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing with protected routes
- **State Management**: TanStack Query for server state and custom React hooks for client state
- **Internationalization**: i18next with support for English, French, and Arabic (including RTL layout)
- **Authentication**: Context-based auth provider with JWT token handling
- **Forms**: React Hook Form with Zod validation schemas
- **File Upload**: Uppy integration for file handling with drag-and-drop support

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Authentication**: Passport.js with local strategy, session-based auth with express-session
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with role-based access control
- **Security**: Password hashing with scrypt, session management, CORS handling
- **Development**: Hot reload with tsx, ESBuild for production bundling

## Database Design
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle migrations with versioned database changes
- **Multi-language Support**: Separate translation tables for categories and products
- **User Roles**: Role-based access (client, seller, admin) with proper permissions
- **Product Management**: Hierarchical categories, vendor-specific products, inventory tracking

## Authentication & Authorization
- **Session Management**: Express-session with memory store for development
- **Password Security**: Scrypt-based hashing with salt for secure password storage
- **Role-Based Access**: Three-tier system (client, seller, admin) with protected routes
- **JWT Integration**: Token-based authentication for API requests

## UI/UX Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Dark Mode Support**: CSS custom properties for theme switching
- **Component Library**: Comprehensive set of reusable UI components
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Code splitting, lazy loading, optimized bundle sizes

# External Dependencies

## Core Technologies
- **Database**: PostgreSQL via Neon serverless with WebSocket support
- **File Storage**: Google Cloud Storage for product images and user uploads
- **Styling**: Tailwind CSS with PostCSS processing and Autoprefixer

## Development Tools
- **Build System**: Vite with React plugin and runtime error overlay
- **Type Checking**: TypeScript with strict mode and path mapping
- **Code Quality**: ESLint and Prettier configurations (referenced in components.json)
- **Development Server**: Replit integration with cartographer plugin

## Third-Party Services
- **UI Components**: Radix UI primitives for accessible component foundations
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono)
- **Internationalization**: i18next ecosystem for translation management
- **Query Management**: TanStack Query for server state synchronization

## Production Infrastructure
- **Session Storage**: Configurable session store (memory for development, can be extended to Redis/PostgreSQL)
- **Environment Configuration**: Environment variable management for database URLs and secrets
- **Deployment**: Docker-ready with separate client/server build processes