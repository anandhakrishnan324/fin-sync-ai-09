# Fin-Sync AI - Project Documentation

## Project Overview
Fin-Sync AI is a full-stack web application for personal finance management with AI-powered insights. It helps users track expenses, visualize spending patterns, calculate taxes, and receive intelligent financial advice.

---

## Technologies Used

### Frontend Technologies

#### 1. **React (v18.3.1)**
- **Purpose**: JavaScript library for building user interfaces
- **Why Used**: Component-based architecture allows for reusable UI components and efficient rendering
- **Implementation**: 
  - Created modular components for Dashboard, Settings, Admin Panel, Tax Calculator
  - Used React Hooks (useState, useEffect, custom hooks) for state management
  - Implemented React Router for navigation between pages

#### 2. **TypeScript**
- **Purpose**: Strongly-typed superset of JavaScript
- **Why Used**: Provides type safety, better IDE support, and reduces runtime errors
- **Implementation**:
  - Defined interfaces for User, Expense, Settings data structures
  - Type-safe API calls and database operations
  - Compile-time error checking

#### 3. **Vite**
- **Purpose**: Modern build tool and development server
- **Why Used**: Fast hot module replacement (HMR), optimized builds, better developer experience
- **Implementation**:
  - Configured in `vite.config.ts` with path aliases (@/)
  - Optimized production builds with code splitting

#### 4. **Tailwind CSS**
- **Purpose**: Utility-first CSS framework
- **Why Used**: Rapid UI development, consistent design system, responsive design
- **Implementation**:
  - Custom design tokens in `src/index.css` (colors, gradients, shadows)
  - Responsive layouts for mobile and desktop
  - Dark/light theme support via CSS variables

#### 5. **Shadcn UI Components**
- **Purpose**: Pre-built accessible UI components
- **Why Used**: Professional UI with accessibility built-in
- **Implementation**:
  - Used components: Button, Card, Dialog, Form, Table, Toast, Tabs
  - Customized with Tailwind for brand consistency

#### 6. **React Query (TanStack Query v5)**
- **Purpose**: Data fetching and state management library
- **Why Used**: Automatic caching, background updates, optimistic updates
- **Implementation**:
  - Fetch and cache expense data
  - Automatic refetching on focus/reconnect
  - Optimistic updates for better UX

#### 7. **React Router (v6)**
- **Purpose**: Client-side routing library
- **Why Used**: Single-page application navigation without page reloads
- **Implementation**:
  - Routes: /auth, /, /tax-calculator, /settings, /admin
  - Protected routes with authentication checks
  - 404 Not Found page

#### 8. **Recharts**
- **Purpose**: Charting library for React
- **Why Used**: Data visualization for expense trends and categories
- **Implementation**:
  - Line charts for spending trends over time
  - Pie charts for category-wise expense breakdown
  - Bar charts for monthly comparisons

#### 9. **Lucide React**
- **Purpose**: Icon library
- **Why Used**: Consistent, scalable icons throughout the app
- **Implementation**: Icons for navigation, buttons, data visualization

---

### Backend Technologies

#### 1. **PostgreSQL Database (via Supabase)**
- **Purpose**: Relational database management system
- **Why Used**: ACID compliance, complex queries, data integrity, strong consistency
- **Implementation**:

**Database Schema:**

```sql
-- Users authentication (managed by Supabase Auth)
-- Stores user credentials and handles authentication

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- User roles table (admin/user)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) UNIQUE,
    theme ENUM('light', 'dark') DEFAULT 'light',
    language ENUM('en', 'hi') DEFAULT 'en',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

**Key Database Features:**
- **Foreign Keys**: Maintain referential integrity between tables
- **Check Constraints**: Ensure data validity (e.g., amount > 0)
- **Unique Constraints**: Prevent duplicate entries
- **Timestamps**: Track creation and modification times
- **Enums**: Type-safe role and settings options

#### 2. **Row-Level Security (RLS) Policies**
- **Purpose**: Database-level security to control data access
- **Why Used**: Prevents unauthorized data access, enforces user isolation
- **Implementation**:

```sql
-- Users can only view their own expenses
CREATE POLICY "Users can view their own expenses" 
ON expenses FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own expenses
CREATE POLICY "Users can create their own expenses" 
ON expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own expenses
CREATE POLICY "Users can update their own expenses" 
ON expenses FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own expenses
CREATE POLICY "Users can delete their own expenses" 
ON expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (has_role(auth.uid(), 'admin'));
```

#### 3. **Database Functions & Triggers**
- **Purpose**: Automate database operations and enforce business logic
- **Implementation**:

```sql
-- Function to check user roles (security definer to avoid RLS recursion)
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger to create profile on user signup
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to auto-update timestamps
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 4. **Supabase Authentication**
- **Purpose**: User authentication and session management
- **Why Used**: Secure, scalable authentication with JWT tokens
- **Implementation**:
  - Email/password authentication
  - JWT token-based sessions stored in localStorage
  - Automatic token refresh
  - Password hashing with bcrypt
  - Protected API routes

**Authentication Flow:**
```typescript
// Sign up
await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${window.location.origin}/` }
});

// Sign in
await supabase.auth.signIn({ email, password });

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

#### 5. **Edge Functions (Serverless Backend)**
- **Purpose**: Server-side logic without managing servers
- **Why Used**: Scalable, pay-per-use, automatic scaling
- **Implementation**:

**AI Insights Function** (`supabase/functions/ai-insights/index.ts`):
```typescript
// Fetches user expenses and generates personalized insights
Deno.serve(async (req) => {
  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch user's expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id);
  
  // Calculate statistics
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  
  // Generate insights
  const insights = generateFinancialAdvice(total, categoryTotals);
  
  return new Response(JSON.stringify({ insights }));
});
```

---

## Key Features Implemented

### 1. **User Authentication System**
- **Files**: `src/pages/Auth.tsx`, `src/hooks/useAuth.tsx`
- **Implementation**:
  - Login and signup forms with validation
  - JWT-based session management
  - Automatic redirect for authenticated users
  - Secure password handling (hashed, not stored in plain text)
  - Role-based access control (admin/user)

### 2. **Expense Management Dashboard**
- **Files**: `src/pages/Dashboard.tsx`
- **Implementation**:
  - Add/edit/delete expenses
  - Real-time expense list
  - Category selection (Food, Transport, Entertainment, etc.)
  - Date picker for expense date
  - Amount validation

### 3. **Data Visualization**
- **Files**: Dashboard components with Recharts
- **Implementation**:
  - Line chart: Spending trends over time
  - Pie chart: Category-wise expense distribution
  - Bar chart: Monthly expense comparison
  - Summary cards: Total spent, expense count, average spending

### 4. **Indian Tax Calculator**
- **Files**: `src/pages/TaxCalculator.tsx`
- **Implementation**:
  - Income input with validation
  - Tax calculation based on Indian tax slabs (2024)
  - Deduction options (80C, 80D, etc.)
  - Old vs New tax regime comparison
  - Tax breakdown display

### 5. **Admin Panel**
- **Files**: `src/pages/Admin.tsx`
- **Implementation**:
  - Role-based access (only admins can access)
  - View all users
  - User statistics
  - Protected route with authorization check

### 6. **Settings & Personalization**
- **Files**: `src/pages/Settings.tsx`
- **Implementation**:
  - Theme toggle (light/dark mode)
  - Language selection (English/Hindi)
  - Profile information display
  - Contact information
  - Settings persistence in database

### 7. **AI-Powered Financial Insights**
- **Files**: `supabase/functions/ai-insights/index.ts`
- **Implementation**:
  - Analyzes spending patterns
  - Identifies highest spending categories
  - Calculates monthly and weekly averages
  - Provides personalized recommendations
  - Serverless edge function for scalability

---

## Security Implementations

### 1. **Row-Level Security (RLS)**
- Users can only access their own data
- Admin-only access to certain resources
- Database-level enforcement (cannot be bypassed)

### 2. **Authentication Security**
- Password hashing (bcrypt)
- JWT tokens with expiration
- Secure session storage
- Protected routes on frontend

### 3. **Input Validation**
- Type checking with TypeScript
- Form validation (email format, required fields)
- Database constraints (CHECK, NOT NULL, FOREIGN KEY)
- SQL injection prevention (parameterized queries)

### 4. **API Security**
- CORS headers for cross-origin requests
- Authorization checks on edge functions
- Environment variables for sensitive data
- Anon key vs Service role key separation

---

## Database Design Principles Applied

### 1. **Normalization**
- Separate tables for users, expenses, roles, settings
- Eliminates data redundancy
- Maintains data integrity

### 2. **Referential Integrity**
- Foreign key constraints link tables
- CASCADE delete ensures orphaned records are removed
- Maintains consistency across related data

### 3. **Data Integrity Constraints**
- NOT NULL for required fields
- CHECK constraints for valid data ranges
- UNIQUE constraints prevent duplicates
- DEFAULT values for consistent initialization

### 4. **Indexing** (Implicit in PostgreSQL)
- Primary keys automatically indexed
- Foreign keys indexed for JOIN performance
- UUID primary keys for distributed systems

### 5. **ACID Properties**
- **Atomicity**: Transactions complete fully or not at all
- **Consistency**: Database always in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data persists

---

## Project Structure

```
fin-sync-ai/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (buttons, cards, dialogs)
│   │   └── Layout.tsx       # App layout with navigation
│   ├── pages/
│   │   ├── Auth.tsx         # Login/signup page
│   │   ├── Dashboard.tsx    # Main expense dashboard
│   │   ├── TaxCalculator.tsx # Tax calculation page
│   │   ├── Settings.tsx     # User settings page
│   │   └── Admin.tsx        # Admin panel
│   ├── hooks/
│   │   └── useAuth.tsx      # Custom authentication hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client configuration
│   │       └── types.ts     # TypeScript types from database
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles and design tokens
├── supabase/
│   ├── functions/
│   │   └── ai-insights/
│   │       └── index.ts     # AI insights edge function
│   ├── migrations/          # Database migration files
│   └── config.toml          # Supabase configuration
├── schema.sql               # Database schema definition
├── vite.config.ts           # Vite build configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Project dependencies

```

---

## Development Workflow

### 1. **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:8080
```

### 2. **Database Migrations**
- SQL migrations in `supabase/migrations/`
- Applied automatically on deployment
- Version-controlled schema changes

### 3. **Type Safety**
- TypeScript compilation checks
- Database types auto-generated from schema
- Props validation in React components

### 4. **Build & Deployment**
```bash
# Production build
npm run build

# Deploy to hosting (Vercel, Netlify, etc.)
```

---

## What Makes This Project Stand Out

### 1. **Full-Stack Implementation**
- Not just a frontend demo - real backend with database
- Production-ready authentication and security
- Scalable serverless architecture

### 2. **Modern Tech Stack**
- Uses latest versions and best practices
- Type-safe throughout (TypeScript)
- Component-based architecture

### 3. **Real-World Application**
- Solves actual problem (expense tracking)
- Professional UI/UX
- Mobile-responsive design

### 4. **Database Management**
- Proper schema design with constraints
- Row-level security policies
- Triggers and functions
- Foreign key relationships

### 5. **Security-First Approach**
- Authentication required for all features
- Data isolation per user
- Input validation at multiple levels
- SQL injection prevention

---

## Conclusion

Fin-Sync AI demonstrates a complete understanding of:
- **Frontend Development**: React, TypeScript, modern UI libraries
- **Backend Development**: Database design, authentication, serverless functions
- **Database Management**: SQL, constraints, triggers, RLS policies
- **Security**: Authentication, authorization, data protection
- **Software Engineering**: Component architecture, type safety, version control

This project showcases practical implementation of database concepts including normalization, referential integrity, ACID properties, and secure data access patterns - all essential for a comprehensive DBMS course project.

---

## Contact
For support or inquiries: wecanthelpyou@gmail.com
