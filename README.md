# ERP Kerajinan Kayu

An ERP application for a woodcraft business, built as a portfolio project using a modern Next.js 16 and Supabase stack.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router, JavaScript) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email) |
| Storage | Supabase Storage |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| Icons | lucide-react |
| Toast | sonner |
| Data Fetching | SWR |
| Fonts | Geist Sans, Geist Mono |
| Deployment | Vercel |

---

## Modules

### Manufacturing

- Products: CRUD with automatic stock calculation
- Materials: CRUD with stock tracking
- Categories: Product categorization
- Bill of Materials (BOM): Component list per product with total cost
- Production Orders: Draft to Confirmed to In Progress to Done

### Purchase

- Vendors: CRUD vendor data
- Bills: Vendor bill recording with payment flow

### Sales

- Customers: CRUD customer data
- Quotations: Price quotation creation
- Sales Orders: Convert quotation to sales order to invoice

### Reports

- Stock Report: Real-time stock for products and materials with filters and print
- Sales Report: Revenue, invoices, and customer performance
- Finance Report: Receivables, payables, and net position

### Accounting

- Customer Invoices: Summary from fully invoiced Sales Orders
- Vendor Bills: Summary from paid Bills

### HR

- Departments: Department management
- Employees: CRUD employee data

Note: Product and material photos are stored in Supabase Storage.

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/username/erp-kerajinan-kayu-nextjs.git
cd erp-kerajinan-kayu-nextjs/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Supabase Setup

### 1. Create Supabase Project

Sign up or log in at supabase.com, create a new project.

### 2. Enable Extension

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 3. Run Migrations

Run migrations 001 through 011 in order from `supabase/migrations/` in the Supabase SQL Editor. Migration 011 creates the Storage bucket for product and material images.

### 4. Run Seed

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
node scripts/seed_supabase.js
```

Note: The seed script wipes and reseeds all ERP tables. Each run produces a clean, consistent demo dataset (categories, materials, products, BOMs, production orders, bills, quotations, sales orders, employees, etc.) suitable for portfolio demos.

---

## Demo Flow End-to-End

### Production Flow

1. Create Category to Create Material to Create Product
2. Create BOM for the product (components and quantities)
3. Create Production Order to Confirmed to In Progress to Done
4. Product stock increases automatically

### Purchase Flow

1. Create Vendor to Create Bill with material items
2. Process bill payment to Paid status
3. Material stock increases automatically

### Sales Flow

1. Create Customer to Create Quotation
2. Confirm Quotation to auto-create Sales Order
3. Process payment to Fully Invoiced status
4. Product stock decreases automatically

---

## Screenshots

Manufacturing dashboard (placeholder)

BOM detail (placeholder)

Production Order detail (placeholder)

Quotation (placeholder)

Sales Order detail (placeholder)

---

## Architecture

Server Components are the default. Three high-density lists (Bills, Products, Stock) use Client Components with SWR for instant filtering and pagination. Mutations are handled via Server Actions with revalidatePath or router.refresh. Authentication uses @supabase/ssr with a proxy middleware. All row actions are unified behind the RowActions menu (three-dot dropdown).

---

## Known Limitations

- No cancel flow for Production Orders or Sales Orders
- Tables are not optimized for mobile screens (under 768px); desktop or tablet landscape recommended
- Accounting module shows summaries only; no double-entry journal implementation
- No role-based access control (all authenticated users have full access)
- Product and material stock can go negative if orders exceed available stock; no minimum stock validation
- BOMs cannot be edited; if material prices change, BOM totals do not auto-update
- No PDF or CSV export
- No search or filter on regular list pages (only available in the Stock Report)
- No low-stock notifications

---

## Roadmap

- [x] Pagination on list pages
- [x] Product and material image upload via Supabase Storage
- [x] Row Level Security (RLS) policies
- [x] Reports and transaction summaries
- [ ] RFQ to Purchase Order to Goods Receipt to Bill to Paid flow
- [ ] Cancel feature for Production Orders and Sales Orders
- [ ] PDF and CSV export
- [ ] Search and filter on regular list pages
- [ ] Low-stock notifications
- [ ] Role-based access control

---

## Author

Mochammad Rafi
Web Developer
GitHub: https://github.com/elemenpetir
LinkedIn: https://linkedin.com/in/mochammad-rafi

---

## License

MIT. See the [LICENSE](./LICENSE) file.