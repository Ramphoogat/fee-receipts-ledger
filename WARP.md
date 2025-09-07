# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Fee Receipts Ledger** application built for school fee management. It's a full-stack application with an **Encore** backend and a **React + TypeScript** frontend.

### Key Features
- **Invoice Management**: Generate and track student fee invoices by class and month
- **Payment Processing**: Record payments with multiple modes (Cash, Card, UPI, Bank transfers)
- **Receipt Generation**: Auto-generate receipt numbers with proper sequencing
- **Student Ledger**: Track complete payment history for individual students
- **Financial Reports**: Fee collection reports with filtering capabilities
- **Database Transactions**: ACID-compliant payment processing with idempotency keys

## Architecture Overview

### Backend (Encore Framework)
- **Service**: `fees` service handling all fee-related operations
- **Database**: PostgreSQL with automated migrations
- **API Endpoints**: RESTful APIs with TypeScript type safety
- **Generated Client**: Auto-generated TypeScript client for frontend consumption

### Frontend (React + Vite)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with custom configuration
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router with protected routes for different pages

### Data Flow
1. Frontend makes type-safe API calls using generated Encore client
2. Backend processes requests through `fees` service endpoints
3. Database operations use SQL with proper transactions and constraints
4. Results return through the same type-safe client interface

## Essential Commands

### Package Management
```bash
# Install all dependencies (monorepo)
bun install

# Backend-specific dependencies
cd backend && bun install

# Frontend-specific dependencies  
cd frontend && bun install
```

### Development Builds
```bash
# Build frontend for backend integration
cd backend && bun run build

# Frontend development build
cd frontend && bun run build
```

### Code Generation
```bash
# Generate frontend client from backend (run from backend directory)
cd backend && encore gen client --target leap
```

### Database Operations
```bash
# Database migrations are handled automatically by Encore
# Migration files located in backend/fees/migrations/
```

## Backend Development (Encore)

### Project Structure
```
backend/
├── fees/                    # Main service directory
│   ├── encore.service.ts    # Service definition
│   ├── db.ts               # Database connection
│   ├── migrations/         # SQL migration files
│   ├── create_payment.ts   # Payment creation endpoint
│   ├── get_ledger.ts       # Student ledger endpoint
│   ├── list_invoices.ts    # Invoice listing endpoint
│   ├── generate_invoices.ts # Invoice generation
│   ├── get_receipt.ts      # Receipt retrieval
│   └── get_reports.ts      # Financial reports
├── encore.app              # App configuration
├── package.json
└── tsconfig.json
```

### Key Database Tables
- **students**: Student master data
- **fee_heads**: Fee categories (tuition, lab, transport, library)
- **invoices**: Monthly fee invoices with status tracking
- **invoice_items**: Detailed breakdown of fees per invoice
- **payments**: Payment records with receipt numbers
- **receipts_sequence**: Auto-incrementing receipt number generation

### Adding New API Endpoints
```typescript
import { api } from "encore.dev/api";
import { feesDB } from "./db";

export const newEndpoint = api<RequestType, ResponseType>(
  { expose: true, method: "POST", path: "/new-endpoint" },
  async (req) => {
    // Implementation with proper error handling
    // Use transactions for data consistency
    await feesDB.exec`BEGIN`;
    try {
      // Business logic here
      await feesDB.exec`COMMIT`;
      return result;
    } catch (error) {
      await feesDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
```

### Database Best Practices
- Always use transactions for multi-table operations
- Implement proper error handling with rollbacks
- Use parameterized queries to prevent SQL injection
- Include idempotency keys for payment operations
- Validate input data before database operations

## Frontend Development (React)

### Project Structure
```
frontend/
├── components/
│   ├── ui/                 # Reusable UI components
│   └── Navigation.tsx      # Main navigation
├── pages/
│   ├── InvoicesPage.tsx    # Invoice management
│   ├── PaymentPage.tsx     # Payment processing
│   ├── LedgerPage.tsx      # Student ledger view
│   └── ReportsPage.tsx     # Financial reports
├── client.ts              # Generated Encore client
├── App.tsx               # Main app component
├── main.tsx              # App entry point
└── vite.config.ts        # Vite configuration
```

### Key Dependencies
- **@tanstack/react-query**: Server state management
- **react-router-dom**: Client-side routing
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Styling framework
- **lucide-react**: Icon library

### Adding New Pages
1. Create page component in `pages/` directory
2. Add route to `App.tsx` Routes configuration
3. Update navigation in `components/Navigation.tsx`
4. Use TanStack Query for server state management

### API Integration Pattern
```typescript
import { useQuery } from '@tanstack/react-query';
import client from './client';

// Query example
const { data, isLoading, error } = useQuery({
  queryKey: ['invoices', filters],
  queryFn: () => client.fees.listInvoices(filters),
});

// Mutation example
const mutation = useMutation({
  mutationFn: (paymentData) => client.fees.createPayment(paymentData),
  onSuccess: () => {
    queryClient.invalidateQueries(['invoices']);
  },
});
```

## Configuration

### Backend Configuration
- **encore.app**: Contains app ID and language specification
- **tsconfig.json**: TypeScript configuration with path aliases
- **package.json**: Build scripts and dependencies

### Frontend Configuration
- **vite.config.ts**: 
  - Path aliases: `@/` for current directory, `~backend/` for backend imports
  - Tailwind CSS integration
  - React plugin configuration
- **tsconfig.json**: TypeScript paths matching Vite configuration

### Environment Variables
Frontend development environment:
```env
# frontend/.env.development
VITE_CLIENT_TARGET=http://localhost:4000
```

## Development Workflow

### File Organization
- Backend: Feature-based organization within `fees/` service
- Frontend: Standard React patterns with `pages/` and `components/` separation
- Shared types: Automatically generated through Encore client

### Type Safety
- Backend endpoints automatically generate TypeScript types
- Frontend consumes these types through generated client
- No manual type synchronization needed between frontend and backend

### Database Schema Changes
1. Create new migration file in `backend/fees/migrations/`
2. Follow naming convention: `XXX_description.up.sql` and `XXX_description.down.sql`
3. Test migrations in development environment
4. Encore handles automatic migration application

### Client Generation
- Run `encore gen client --target leap` after backend API changes
- Generated client automatically updates frontend type definitions
- No manual API client maintenance required

## Troubleshooting

### Common Issues
- **TypeScript errors**: Ensure generated client is up-to-date after backend changes
- **Database connection issues**: Check Encore service status and migration state  
- **Build failures**: Verify all dependencies installed and path aliases configured
- **CORS issues**: Ensure frontend client target matches backend URL

### When Issues Persist
As per project rules: "If any error persists i will tell you myself" - escalate persistent issues to the project maintainer rather than attempting extensive troubleshooting.

### Debugging Tips
- Check browser DevTools Network tab for API call failures
- Use Encore dashboard for backend service monitoring
- Verify database schema matches migration files
- Ensure proper error boundaries in React components

## Key Technical Decisions

### Why Encore?
- Type-safe API development with automatic client generation
- Built-in database management with migrations
- Simplified deployment and infrastructure management
- Strong TypeScript integration throughout the stack

### Why This Frontend Stack?
- **Vite**: Fast development and build performance
- **TanStack Query**: Robust server state management with caching
- **Radix UI**: Accessible, unstyled components for custom design
- **Tailwind CSS**: Utility-first styling for rapid UI development

### Database Design Patterns
- **Normalization**: Separate tables for students, fee heads, and transactions
- **Audit Trail**: Created timestamps and status tracking on all entities
- **Referential Integrity**: Foreign key constraints maintain data consistency
- **Idempotency**: Payment operations use unique keys to prevent duplicates
