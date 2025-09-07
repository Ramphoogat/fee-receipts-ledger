# Fee Receipts Ledger

A comprehensive **school fee management system** built with modern web technologies. This application streamlines the process of managing student fees, generating invoices, processing payments, and maintaining financial records.

## 🚀 Features

### Core Functionality

- **📋 Invoice Management**: Generate and track monthly fee invoices for students by class
- **💳 Payment Processing**: Record payments with multiple modes (Cash, Card, UPI, Bank transfers)
- **🧾 Receipt Generation**: Auto-generate sequential receipt numbers with proper formatting
- **📊 Student Ledger**: Complete payment history and account balance tracking
- **📈 Financial Reports**: Comprehensive fee collection reports with filtering capabilities
- **🔒 Transaction Safety**: ACID-compliant payment processing with idempotency keys
- **👥 Multi-Student Support**: Manage multiple classes and students simultaneously

### Technical Features

- **Type Safety**: End-to-end TypeScript with auto-generated API client
- **Real-time Updates**: Live data synchronization between frontend and backend
- **Database Migrations**: Automated schema management
- **Error Handling**: Comprehensive error management and validation
- **Responsive Design**: Mobile-friendly interface with modern UI components

## 🏗️ Architecture

### Technology Stack

**Backend (Encore Framework)**

- **Runtime**: Node.js with TypeScript
- **Framework**: Encore.dev for API development
- **Database**: PostgreSQL with automated migrations
- **Client Generation**: Auto-generated TypeScript client for frontend

**Frontend (React + Vite)**

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and builds
- **UI Library**: Radix UI components for accessibility
- **Styling**: Tailwind CSS for utility-first design
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router for client-side navigation
- **Icons**: Lucide React for consistent iconography

### Project Structure

```
fee-receipts-ledger/
├── backend/                 # Encore backend application
│   ├── fees/               # Main service directory
│   │   ├── encore.service.ts    # Service definition
│   │   ├── db.ts               # Database connection
│   │   ├── migrations/         # SQL migration files
│   │   │   ├── 001_init.up.sql
│   │   │   └── 001_init.down.sql
│   │   ├── create_payment.ts   # Payment creation API
│   │   ├── get_ledger.ts       # Student ledger API
│   │   ├── list_invoices.ts    # Invoice listing API
│   │   ├── generate_invoices.ts # Invoice generation API
│   │   ├── get_receipt.ts      # Receipt retrieval API
│   │   └── get_reports.ts      # Financial reports API
│   ├── encore.app          # Encore app configuration
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── frontend/               # React frontend application
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (Radix)
│   │   └── Navigation.tsx # Main navigation component
│   ├── pages/             # Application pages
│   │   ├── InvoicesPage.tsx   # Invoice management page
│   │   ├── PaymentPage.tsx    # Payment processing page
│   │   ├── LedgerPage.tsx     # Student ledger page
│   │   └── ReportsPage.tsx    # Financial reports page
│   ├── client.ts          # Generated Encore API client
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── index.html        # HTML template
│   ├── vite.config.ts    # Vite configuration
│   ├── package.json      # Frontend dependencies
│   └── tsconfig.json     # TypeScript configuration
├── package.json          # Monorepo configuration
├── DEVELOPMENT.md        # Development setup guide
├── WARP.md              # WARP-specific development guide
└── README.md            # This file
```

## 🛠️ Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)

   ```bash
   # Download from https://nodejs.org/
   # Verify installation
   node --version
   npm --version
   ```

2. **Bun** (Package Manager)

   ```bash
   # Install Bun
   npm install -g bun

   # Verify installation
   bun --version
   ```

3. **Encore CLI** (Backend Framework)
   Choose the appropriate command for your system:

   **Windows (PowerShell)**

   ```powershell
   iwr https://encore.dev/install.ps1 | iex
   ```

   **macOS (Homebrew)**

   ```bash
   brew install encoredev/tap/encore
   ```

   **Linux**

   ```bash
   curl -L https://encore.dev/install.sh | bash
   ```

   **Verify Encore Installation**

   ```bash
   encore version
   ```

4. **Git** (Version Control)
   ```bash
   # Download from https://git-scm.com/
   # Verify installation
   git --version
   ```

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/fee-receipts-ledger.git
cd fee-receipts-ledger

# Or if you have the project locally
cd path/to/fee-receipts-ledger
```

### 2. Install Dependencies

**Install all dependencies (recommended)**

```bash
# Install dependencies for the entire monorepo
bun install
```

**Or install individually**

```bash
# Backend dependencies
cd backend
bun install
cd ..

# Frontend dependencies
cd frontend
bun install
cd ..
```

### 3. Backend Setup (Encore)

**Navigate to backend directory**

```bash
cd backend
```

**Authenticate with Encore (if deploying to cloud)**

```bash
encore auth login
```

**Database Setup**

- Encore automatically handles database setup and migrations
- PostgreSQL database will be created automatically when you start the backend
- Migration files are located in `backend/fees/migrations/`

**Start the Backend Development Server**

```bash
encore run
```

The backend will be available at `http://localhost:4000` (or the URL shown in your terminal).

**Initial Data**
The database comes pre-populated with sample data:

- 4 sample students in classes 10-A and 10-B
- 4 fee heads: Tuition Fee, Lab Fee, Transport Fee, Library Fee
- You can modify this data in `backend/fees/migrations/001_init.up.sql`

### 4. Frontend Setup (React + Vite)

**Open a new terminal and navigate to frontend directory**

```bash
cd frontend
```

**Install frontend dependencies (if not done already)**

```bash
bun install
```

**Generate the API Client**

```bash
# From the backend directory
cd ../backend
encore gen client --target leap
cd ../frontend
```

**Create Environment File**

```bash
# Create .env.development file
echo "VITE_CLIENT_TARGET=http://localhost:4000" > .env.development
```

**Start the Frontend Development Server**

```bash
npx vite dev
```

The frontend will be available at `http://localhost:5173` (or the next available port).

### 5. Verify Setup

1. **Backend Health Check**

   - Visit `http://localhost:4000` in your browser
   - You should see the Encore development dashboard

2. **Frontend Application**

   - Visit `http://localhost:5173` in your browser
   - You should see the Fee Receipts Ledger application
   - Try navigating to different pages (Invoices, Reports, etc.)

3. **API Integration**
   - Go to the Invoices page
   - Verify that sample data loads correctly
   - Try generating new invoices or processing payments

## 🗄️ Database Schema

### Core Tables

**students**

- `id`: Primary key
- `name`: Student name
- `roll_no`: Unique roll number
- `class`: Class designation
- `created_at`: Timestamp

**fee_heads**

- `id`: Primary key
- `name`: Fee category name (Tuition, Lab, etc.)
- `amount_default`: Default fee amount
- `active`: Status flag
- `created_at`: Timestamp

**invoices**

- `id`: Primary key
- `student_id`: Foreign key to students
- `class`: Class designation
- `month`: Billing month (YYYY-MM format)
- `billed_total`: Total amount billed
- `paid_total`: Total amount paid
- `balance`: Outstanding balance
- `status`: Invoice status (UNPAID, PARTIAL, PAID, VOID)
- `created_at`: Timestamp

**invoice_items**

- `id`: Primary key
- `invoice_id`: Foreign key to invoices
- `head_id`: Foreign key to fee_heads
- `head_name`: Fee category name
- `amount`: Fee amount

**payments**

- `id`: Primary key
- `invoice_id`: Foreign key to invoices
- `amount`: Payment amount
- `mode`: Payment method (CASH, CARD, UPI, BANK, OTHER)
- `txn_ref`: Transaction reference
- `paid_on`: Payment timestamp
- `receipt_no`: Generated receipt number
- `meta`: Additional metadata (JSON)

**Supporting Tables**

- `idempotency`: Prevents duplicate operations
- `receipts_sequence`: Auto-incrementing receipt numbers

## 🔧 Development

### Adding New Features

**Backend API Endpoints**

```typescript
// Example: backend/fees/new_endpoint.ts
import { api } from "encore.dev/api";
import { feesDB } from "./db";

export interface NewRequest {
  // Define request structure
}

export interface NewResponse {
  // Define response structure
}

export const newEndpoint = api<NewRequest, NewResponse>(
  { expose: true, method: "POST", path: "/new-endpoint" },
  async (req) => {
    await feesDB.exec`BEGIN`;
    try {
      // Business logic here
      const result = await feesDB.queryRow`
        SELECT * FROM table WHERE condition = ${req.param}
      `;
      await feesDB.exec`COMMIT`;
      return { data: result };
    } catch (error) {
      await feesDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
```

**Frontend Pages**

```typescript
// Example: frontend/pages/NewPage.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../client";

export default function NewPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["new-data"],
    queryFn: () => client.fees.newEndpoint({ param: "value" }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Your component JSX */}</div>;
}
```

### Database Migrations

**Creating New Migrations**

```bash
# Create migration files in backend/fees/migrations/
# Format: XXX_description.up.sql and XXX_description.down.sql

# Example: 002_add_new_table.up.sql
CREATE TABLE new_table (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

# Example: 002_add_new_table.down.sql
DROP TABLE IF EXISTS new_table;
```

**Migration Best Practices**

- Always create both up and down migration files
- Test migrations in development before deploying
- Include proper indexes for performance
- Maintain referential integrity with foreign keys

### Code Generation

**Update API Client**

```bash
# After making backend changes, regenerate the client
cd backend
encore gen client --target leap
```

**Build Commands**

```bash
# Build frontend for production
cd frontend
bun run build

# Build frontend for backend integration
cd backend
bun run build
```

## 🚀 Deployment

### Encore Cloud Platform

**1. Set up Git Remote**

```bash
git remote add encore encore://fee-receipts-ledger-rfa2
```

**2. Deploy to Encore Cloud**

```bash
git add -A .
git commit -m "Deploy to Encore Cloud"
git push encore
```

**3. Monitor Deployment**
Visit the [Encore Cloud Dashboard](https://app.encore.dev/fee-receipts-ledger-rfa2/deploys) to monitor your deployment progress.

### GitHub Integration (Recommended)

**1. Connect GitHub Account**

- Open the [Encore Cloud Dashboard](https://app.encore.cloud/fee-receipts-ledger-rfa2/settings/integrations/github)
- Click "Connect Account to GitHub"
- Grant access to your repository

**2. Deploy via GitHub**

```bash
git add -A .
git commit -m "Deploy via GitHub"
git push origin main
```

### Self-Hosting with Docker

**Build Docker Image**

```bash
# Create Dockerfile using Encore's Docker build
encore build docker
```

Refer to the [Encore self-hosting documentation](https://encore.dev/docs/self-host/docker-build) for detailed instructions.

## 🧪 Testing

### Manual Testing

**1. Invoice Generation**

- Navigate to Invoices page
- Generate invoices for a specific class and month
- Verify invoice details and amounts

**2. Payment Processing**

- Select an unpaid invoice
- Process a payment with different payment modes
- Verify receipt generation and balance updates

**3. Ledger Verification**

- View student ledger
- Verify transaction history accuracy
- Check running balance calculations

**4. Reports**

- Generate reports with different filters
- Verify data accuracy and totals

### API Testing

**Using Encore Dashboard**

- Visit `http://localhost:4000`
- Use the built-in API explorer
- Test endpoints with sample data

**Using curl**

```bash
# List invoices
curl "http://localhost:4000/invoices?class=10-A&status=UNPAID"

# Create payment
curl -X POST "http://localhost:4000/payments" \
  -H "Content-Type: application/json" \
  -d '{"invoice_id": 1, "amount": 1000, "mode": "CASH"}'
```

## 🐛 Troubleshooting

### Common Issues

**1. Backend Won't Start**

```bash
# Check if Encore is installed
encore version

# Check if you're in the backend directory
pwd  # Should end with /backend

# Reinstall dependencies
bun install
```

**2. Frontend Build Errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules
bun install

# Regenerate API client
cd ../backend
encore gen client --target leap
```

**3. Database Connection Issues**

- Ensure Encore backend is running
- Check migration files for syntax errors
- Restart the Encore development server

**4. CORS Issues**

- Verify `VITE_CLIENT_TARGET` environment variable
- Ensure backend URL matches frontend configuration

**5. TypeScript Errors**

- Regenerate API client after backend changes
- Check for proper imports and type definitions
- Ensure all dependencies are installed

### Getting Help

**Documentation**

- [Encore Documentation](https://encore.dev/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

**Community Support**

- [Encore Discord](https://encore.dev/discord)
- [GitHub Issues](https://github.com/your-username/fee-receipts-ledger/issues)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation and troubleshooting sections

---

**Made with ❤️ using Encore and React**
