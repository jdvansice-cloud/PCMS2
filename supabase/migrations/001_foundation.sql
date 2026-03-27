-- PCMS2 Foundation Schema
-- Companies, Stores, Users, Roles, Subscriptions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES (Organizations / Clinics)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  ruc TEXT,
  tax_rate NUMERIC(5,2) DEFAULT 16.00,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'MX',
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);

-- ============================================
-- STORES (Branches / Sucursales)
-- ============================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB DEFAULT '{}',
  geolocation JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stores_company ON stores(company_id);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);

-- ============================================
-- ROLES
-- ============================================
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roles_company ON roles(company_id);

-- ============================================
-- USERS (Staff)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'receptionist' CHECK (role IN ('admin', 'veterinarian', 'groomer', 'receptionist')),
  phone TEXT,
  avatar_url TEXT,
  commission_rate NUMERIC(5,2),
  license_number TEXT,
  signature_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_platform_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_auth ON users(auth_id);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_store ON users(store_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- STAFF SCHEDULES
-- ============================================
CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  lunch_start TIME,
  lunch_end TIME,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_staff_schedules_user ON staff_schedules(user_id);

-- ============================================
-- PAYMENT METHODS
-- ============================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0
);

-- ============================================
-- OWNERS (Pet Owners / Clients)
-- ============================================
CREATE TABLE owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  phone_whatsapp TEXT,
  id_type TEXT CHECK (id_type IN ('cedula', 'passport', 'ruc', 'ine', 'curp')),
  id_number TEXT,
  address JSONB DEFAULT '{}',
  account_balance NUMERIC(10,2) DEFAULT 0,
  is_vip BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_owners_store ON owners(store_id);
CREATE INDEX idx_owners_name ON owners(first_name, last_name);
CREATE INDEX idx_owners_phone ON owners(phone);

-- ============================================
-- CUSTOMER AUTH (Portal login link)
-- ============================================
CREATE TABLE customer_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_auth_auth ON customer_auth(auth_id);

-- ============================================
-- PETS (Patients)
-- ============================================
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'canino',
  breed TEXT,
  sex TEXT CHECK (sex IN ('M', 'F', 'sin_sexar')),
  date_of_birth DATE,
  weight NUMERIC(6,2),
  microchip_number TEXT,
  photo_url TEXT,
  allergies TEXT,
  condition TEXT DEFAULT 'active' CHECK (condition IN ('active', 'deceased')),
  is_sterilized BOOLEAN DEFAULT false,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_pets_store ON pets(store_id);
CREATE INDEX idx_pets_name ON pets(name);
CREATE INDEX idx_pets_microchip ON pets(microchip_number);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  veterinarian_id UUID REFERENCES users(id),
  type TEXT DEFAULT 'consulta',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'in_progress', 'completed', 'no_show', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  no_show_marked_at TIMESTAMPTZ,
  color_code TEXT,
  notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_store ON appointments(store_id);
CREATE INDEX idx_appointments_pet ON appointments(pet_id);
CREATE INDEX idx_appointments_vet ON appointments(veterinarian_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- MEDICAL RECORDS
-- ============================================
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  veterinarian_id UUID REFERENCES users(id),
  vital_signs JSONB DEFAULT '{}',
  examination TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  draft JSONB,
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medical_records_pet ON medical_records(pet_id);
CREATE INDEX idx_medical_records_store ON medical_records(store_id);

-- ============================================
-- PRESCRIPTIONS
-- ============================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  medications JSONB NOT NULL DEFAULT '[]',
  signature_url TEXT,
  senasica_format BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PREVENTIVE TREATMENTS (Vaccines, Deworming, Ectoparasites)
-- ============================================
CREATE TABLE preventive_treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vaccine', 'deworming', 'ectoparasite')),
  product_name TEXT NOT NULL,
  laboratory TEXT,
  lot_number TEXT,
  dose TEXT,
  weight_at_treatment NUMERIC(6,2),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_due_at TIMESTAMPTZ,
  certificate_url TEXT,
  reminder_sent_at TIMESTAMPTZ,
  applied_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preventive_pet ON preventive_treatments(pet_id);
CREATE INDEX idx_preventive_type ON preventive_treatments(type);

-- ============================================
-- LAB STUDIES
-- ============================================
CREATE TABLE lab_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES medical_records(id),
  requested_by_id UUID REFERENCES users(id),
  study_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  results TEXT,
  file_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  client_visible BOOLEAN DEFAULT false,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_lab_studies_pet ON lab_studies(pet_id);
CREATE INDEX idx_lab_studies_status ON lab_studies(status);

-- ============================================
-- RECORD ATTACHMENTS
-- ============================================
CREATE TABLE record_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GROOMING SESSIONS
-- ============================================
CREATE TABLE grooming_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  groomer_id UUID REFERENCES users(id),
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  observations TEXT,
  special_instructions TEXT,
  waiver_signed_at TIMESTAMPTZ,
  waiver_signature_url TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(10,2),
  completed_at TIMESTAMPTZ,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grooming_store ON grooming_sessions(store_id);
CREATE INDEX idx_grooming_status ON grooming_sessions(status);

-- ============================================
-- KENNEL STAYS (Hospitalization / Boarding)
-- ============================================
CREATE TABLE kennel_stays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  veterinarian_id UUID REFERENCES users(id),
  kennel_number TEXT,
  type TEXT NOT NULL DEFAULT 'hospitalization' CHECK (type IN ('hospitalization', 'boarding', 'pension')),
  reason TEXT,
  diagnosis TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged')),
  daily_rate NUMERIC(10,2),
  total_charged NUMERIC(10,2) DEFAULT 0,
  sale_id UUID,
  admitted_at TIMESTAMPTZ DEFAULT NOW(),
  discharged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kennel_store ON kennel_stays(store_id);
CREATE INDEX idx_kennel_status ON kennel_stays(status);

CREATE TABLE kennel_daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kennel_stay_id UUID NOT NULL REFERENCES kennel_stays(id) ON DELETE CASCADE,
  logged_by_id UUID REFERENCES users(id),
  vital_signs JSONB DEFAULT '{}',
  feeding TEXT,
  medication TEXT,
  behavior TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS & INVENTORY
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  product_type TEXT NOT NULL DEFAULT 'retail' CHECK (product_type IN ('service', 'retail', 'medication', 'vaccine', 'food')),
  sku TEXT,
  barcode TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10,2) DEFAULT 0,
  wholesale_price NUMERIC(10,2),
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  lot_number TEXT,
  expiry_date DATE,
  supplier_id UUID REFERENCES suppliers(id),
  is_controlled_senasica BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_taxable BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_type ON products(product_type);

-- ============================================
-- SALES & PAYMENTS
-- ============================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES owners(id),
  sale_number SERIAL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled', 'refunded')),
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_store ON sales(store_id);
CREATE INDEX idx_sales_owner ON sales(owner_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_created ON sales(created_at);

CREATE TABLE sale_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  line_total NUMERIC(10,2) NOT NULL,
  notes TEXT
);

CREATE TABLE sale_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  reference TEXT,
  change_amount NUMERIC(10,2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CASH REGISTER
-- ============================================
CREATE TABLE cash_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  opened_by UUID NOT NULL REFERENCES users(id),
  closed_by UUID REFERENCES users(id),
  opening_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(10,2),
  expected_balance NUMERIC(10,2),
  difference NUMERIC(10,2),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

-- ============================================
-- OWNER CREDITS
-- ============================================
CREATE TABLE owner_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id),
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'charge', 'refund', 'adjustment')),
  balance_after NUMERIC(10,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GIFT CARDS
-- ============================================
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  initial_value NUMERIC(10,2) NOT NULL,
  current_balance NUMERIC(10,2) NOT NULL,
  card_type TEXT DEFAULT 'fixed' CHECK (card_type IN ('fixed', 'variable')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id),
  amount NUMERIC(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  balance_after NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOYALTY
-- ============================================
CREATE TABLE loyalty_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  points_enabled BOOLEAN DEFAULT false,
  points_per_dollar NUMERIC(5,4) DEFAULT 0.05,
  min_redemption_amount NUMERIC(10,2) DEFAULT 10.00,
  points_expiry_days INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_loyalty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  points_balance NUMERIC(10,2) DEFAULT 0,
  total_points_earned NUMERIC(10,2) DEFAULT 0,
  total_points_redeemed NUMERIC(10,2) DEFAULT 0,
  last_points_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, store_id)
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id),
  transaction_type TEXT NOT NULL,
  points_amount NUMERIC(10,2) NOT NULL,
  balance_before NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PURCHASE ORDERS
-- ============================================
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'partial', 'received')),
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  ordered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity_ordered INT NOT NULL DEFAULT 1,
  quantity_received INT DEFAULT 0,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'return', 'adjustment', 'receipt', 'internal')),
  quantity INT NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL TEMPLATES & LOGS
-- ============================================
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  template_type TEXT,
  status TEXT DEFAULT 'sent',
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  justification TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_store ON audit_logs(store_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Permissive policies during development (to be tightened)
CREATE POLICY "companies_all" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "stores_all" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "owners_all" ON owners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pets_all" ON pets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "appointments_all" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "medical_records_all" ON medical_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sales_all" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "products_all" ON products FOR ALL USING (true) WITH CHECK (true);
