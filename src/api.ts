/**
 * MILKEE API Client
 * Base URL: https://app.milkee.ch/api/v2
 */

const BASE_URL = 'https://app.milkee.ch/api/v2';

export interface MilkeeConfig {
  apiToken: string;
  companyId: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export class MilkeeApi {
  private apiToken: string;
  private companyId: string;

  constructor(config: MilkeeConfig) {
    this.apiToken = config.apiToken;
    this.companyId = config.companyId;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${BASE_URL}/companies/${this.companyId}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MILKEE API Error ${response.status}: ${errorText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==================== CUSTOMERS ====================

  async listCustomers(params?: PaginationParams & {
    'filter[name]'?: string;
    'filter[archived]'?: boolean;
    include?: string;
  }) {
    return this.request<ApiResponse<Customer[]>>('GET', '/customers', undefined, params);
  }

  async getCustomer(id: number, include?: string) {
    return this.request<{ data: Customer }>('GET', `/customers/${id}`, undefined, { include });
  }

  async createCustomer(data: CreateCustomerInput) {
    return this.request<{ data: Customer }>('POST', '/customers', data);
  }

  async updateCustomer(id: number, data: Partial<CreateCustomerInput>) {
    return this.request<{ data: Customer }>('PUT', `/customers/${id}`, data);
  }

  async deleteCustomer(id: number) {
    return this.request<void>('DELETE', `/customers/${id}`);
  }

  async getCustomerStatistics(id: number) {
    return this.request<CustomerStatistics>('GET', `/customers/${id}/statistics`);
  }

  // ==================== PROJECTS ====================

  async listProjects(params?: PaginationParams & {
    'filter[archived]'?: boolean;
    'filter[customer_id]'?: number;
    include?: string;
  }) {
    return this.request<ApiResponse<Project[]>>('GET', '/projects', undefined, params);
  }

  async getProject(id: number, include?: string) {
    return this.request<{ data: Project }>('GET', `/projects/${id}`, undefined, { include });
  }

  async createProject(data: CreateProjectInput) {
    return this.request<{ data: Project }>('POST', '/projects', data);
  }

  async updateProject(id: number, data: Partial<UpdateProjectInput>) {
    return this.request<{ data: Project }>('PUT', `/projects/${id}`, data);
  }

  async deleteProject(id: number) {
    return this.request<void>('DELETE', `/projects/${id}`);
  }

  async bulkArchiveProjects(ids: number[], archive: boolean) {
    return this.request<void>('POST', '/projects/multiple', { ids, archive });
  }

  // ==================== TASKS ====================

  async listTasks(params?: PaginationParams & {
    'filter[status]'?: 'open' | 'in-progress' | 'done';
    'filter[project_id]'?: number;
    include?: string;
  }) {
    return this.request<ApiResponse<Task[]>>('GET', '/tasks', undefined, params);
  }

  async getTask(id: number, include?: string) {
    return this.request<{ data: Task }>('GET', `/tasks/${id}`, undefined, { include });
  }

  async createTask(data: CreateTaskInput) {
    return this.request<{ data: Task }>('POST', '/tasks', data);
  }

  async updateTask(id: number, data: Partial<CreateTaskInput>) {
    return this.request<{ data: Task }>('PUT', `/tasks/${id}`, data);
  }

  async deleteTask(id: number) {
    return this.request<void>('DELETE', `/tasks/${id}`);
  }

  // ==================== TIME ENTRIES ====================

  async listTimes(params?: PaginationParams & {
    'filter[user_id]'?: number;
    'filter[customer_id]'?: number;
    'filter[project_id]'?: number;
    'filter[billable]'?: boolean;
    'filter[status]'?: string;
    'filter[date]'?: string;
    include?: string;
    group_by?: 'date' | 'project' | 'weeks';
  }) {
    return this.request<ApiResponse<TimeEntry[]>>('GET', '/times', undefined, params);
  }

  async getTime(id: number, include?: string) {
    return this.request<{ data: TimeEntry }>('GET', `/times/${id}`, undefined, { include });
  }

  async createTime(data: CreateTimeInput) {
    return this.request<{ data: TimeEntry }>('POST', '/times', data);
  }

  async updateTime(id: number, data: Partial<CreateTimeInput>) {
    return this.request<{ data: TimeEntry }>('PUT', `/times/${id}`, data);
  }

  async deleteTime(id: number) {
    return this.request<void>('DELETE', `/times/${id}`);
  }

  // Timer operations
  async getTimer() {
    return this.request<{ data: Timer | null }>('GET', '/times/timer');
  }

  async startTimer(data: { project_id: number; task_id?: number; description?: string }) {
    return this.request<{ data: Timer }>('POST', '/times/timer', data);
  }

  async stopTimer() {
    return this.request<{ data: TimeEntry }>('POST', '/times/timer', { action: 'stop' });
  }

  async updateTimerDescription(description: string) {
    return this.request<{ data: Timer }>('PUT', '/times/timer/description', { description });
  }

  async discardTimer() {
    return this.request<void>('DELETE', '/times/timer');
  }

  // ==================== ENTRIES (BOOKKEEPING) ====================

  async listEntries(params?: PaginationParams & {
    'filter[date]'?: string;
    'filter[type]'?: 'income' | 'expense' | 'swap';
    'filter[customer_id]'?: number;
    'filter[project_id]'?: number;
    'filter[billable]'?: boolean;
    'filter[account_id]'?: number;
    'filter[tag_id]'?: number;
    include?: string;
    sort?: string;
  }) {
    return this.request<ApiResponse<Entry[]>>('GET', '/entries', undefined, params);
  }

  async getEntry(id: number, include?: string) {
    return this.request<{ data: Entry }>('GET', `/entries/${id}`, undefined, { include });
  }

  async createEntry(data: CreateEntryInput) {
    return this.request<{ data: Entry }>('POST', '/entries', data);
  }

  async updateEntry(id: number, data: Partial<CreateEntryInput>) {
    return this.request<{ data: Entry }>('PUT', `/entries/${id}`, data);
  }

  async deleteEntry(id: number) {
    return this.request<void>('DELETE', `/entries/${id}`);
  }

  async getNextEntryNumber(type: 'income' | 'expense' | 'swap', year?: number) {
    return this.request<{ number: number }>('GET', `/entries/number/${type}`, undefined, { year });
  }

  async bulkDeleteEntries(ids: number[]) {
    return this.request<void>('DELETE', '/entries/multiple', { ids });
  }

  async bulkUpdateEntries(ids: number[], updates: Record<string, unknown>) {
    return this.request<void>('PUT', '/entries/multiple', { ids, ...updates });
  }

  // ==================== PRODUCTS ====================

  async listProducts(params?: PaginationParams & {
    'filter[name]'?: string;
    'filter[archived]'?: boolean;
  }) {
    return this.request<ApiResponse<Product[]>>('GET', '/products', undefined, params);
  }

  async getProduct(id: number) {
    return this.request<{ data: Product }>('GET', `/products/${id}`);
  }

  async createProduct(data: CreateProductInput) {
    return this.request<{ data: Product }>('POST', '/products', data);
  }

  async updateProduct(id: number, data: Partial<CreateProductInput>) {
    return this.request<{ data: Product }>('PUT', `/products/${id}`, data);
  }

  async deleteProduct(id: number) {
    return this.request<void>('DELETE', `/products/${id}`);
  }

  async getProductCount() {
    return this.request<number>('GET', '/products/count');
  }

  // ==================== ACCOUNTS ====================

  async listAccounts(params?: {
    'filter[type]'?: AccountType;
  }) {
    return this.request<ApiResponse<Account[]>>('GET', '/accounts', undefined, params);
  }

  async getAccount(id: number) {
    return this.request<{ data: Account }>('GET', `/accounts/${id}`);
  }

  async createAccount(data: CreateAccountInput) {
    return this.request<{ data: Account }>('POST', '/accounts', data);
  }

  async updateAccount(id: number, data: Partial<CreateAccountInput>) {
    return this.request<{ data: Account }>('PUT', `/accounts/${id}`, data);
  }

  async deleteAccount(id: number) {
    return this.request<void>('DELETE', `/accounts/${id}`);
  }

  async resetAccounts() {
    return this.request<void>('POST', '/accounts/reset');
  }

  // ==================== TAGS ====================

  async listTags(params?: PaginationParams & {
    'filter[name]'?: string;
    'filter[color]'?: TagColor;
  }) {
    return this.request<ApiResponse<Tag[]>>('GET', '/tags', undefined, params);
  }

  async getTag(id: number) {
    return this.request<{ data: Tag }>('GET', `/tags/${id}`);
  }

  async createTag(data: CreateTagInput) {
    return this.request<{ data: Tag }>('POST', '/tags', data);
  }

  async updateTag(id: number, data: Partial<CreateTagInput>) {
    return this.request<{ data: Tag }>('PUT', `/tags/${id}`, data);
  }

  async deleteTag(id: number) {
    return this.request<void>('DELETE', `/tags/${id}`);
  }

  async getTagColors() {
    return this.request<{ colors: TagColor[] }>('GET', '/tags/colors');
  }

  // ==================== TAX RATES ====================

  async listTaxRates() {
    return this.request<ApiResponse<TaxRate[]>>('GET', '/tax-rates');
  }

  async getTaxRate(id: number) {
    return this.request<{ data: TaxRate }>('GET', `/tax-rates/${id}`);
  }

  // ==================== CONTACTS ====================

  async listContacts(customerId: number, params?: PaginationParams) {
    return this.request<ApiResponse<Contact[]>>('GET', `/customers/${customerId}/contacts`, undefined, params);
  }

  async createContact(customerId: number, data: CreateContactInput) {
    return this.request<{ data: Contact }>('POST', `/customers/${customerId}/contacts`, data);
  }

  async updateContact(customerId: number, contactId: number, data: Partial<CreateContactInput>) {
    return this.request<{ data: Contact }>('PUT', `/customers/${customerId}/contacts/${contactId}`, data);
  }

  async deleteContact(customerId: number, contactId: number) {
    return this.request<void>('DELETE', `/customers/${customerId}/contacts/${contactId}`);
  }

  // ==================== INVOICES ====================

  async listInvoices(params?: PaginationParams & {
    'filter[status]'?: InvoiceStatus;
    'filter[customer_id]'?: number;
    'filter[project_id]'?: number;
    'filter[date]'?: string;
    'filter[overdue]'?: boolean;
    include?: string;
    sort?: string;
  }) {
    return this.request<ApiResponse<Invoice[]>>('GET', '/invoices', undefined, params);
  }

  async getInvoice(id: number, include?: string) {
    return this.request<Invoice>('GET', `/invoices/${id}`, undefined, { include });
  }

  async createInvoice(data: CreateInvoiceInput) {
    return this.request<{ data: Invoice }>('POST', '/invoices', data);
  }

  async updateInvoice(id: number, data: Partial<CreateInvoiceInput> & { status?: InvoiceStatus }) {
    return this.request<{ data: Invoice }>('PUT', `/invoices/${id}`, data);
  }

  async deleteInvoice(id: number) {
    return this.request<void>('DELETE', `/invoices/${id}`);
  }

  async markInvoicePaid(id: number, payment_date?: string) {
    return this.request<{ data: Invoice }>('POST', `/invoices/${id}/paid`, { payment_date });
  }

  async sendInvoice(id: number, email?: string) {
    return this.request<{ data: Invoice }>('POST', `/invoices/${id}/send`, { email });
  }

  // ==================== PROPOSALS ====================

  async listProposals(params?: PaginationParams & {
    'filter[status]'?: ProposalStatus;
    'filter[customer_id]'?: number;
    'filter[project_id]'?: number;
    'filter[date]'?: string;
    include?: string;
    sort?: string;
  }) {
    return this.request<ApiResponse<Proposal[]>>('GET', '/proposals', undefined, params);
  }

  async getProposal(id: number, include?: string) {
    return this.request<Proposal>('GET', `/proposals/${id}`, undefined, { include });
  }

  async createProposal(data: CreateProposalInput) {
    return this.request<{ data: Proposal }>('POST', '/proposals', data);
  }

  async updateProposal(id: number, data: Partial<CreateProposalInput> & { status?: ProposalStatus }) {
    return this.request<{ data: Proposal }>('PUT', `/proposals/${id}`, data);
  }

  async deleteProposal(id: number) {
    return this.request<void>('DELETE', `/proposals/${id}`);
  }

  async convertProposalToInvoice(id: number) {
    return this.request<{ data: Invoice }>('POST', `/proposals/${id}/convert`);
  }

  async sendProposal(id: number, email?: string) {
    return this.request<{ data: Proposal }>('POST', `/proposals/${id}/send`, { email });
  }
}

// ==================== TYPE DEFINITIONS ====================

export interface Customer {
  id: number;
  name: string;
  contact_name?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  default_hourly_rate?: number;
  tax_rate_id?: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
  name: string;
  contact_name?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  default_hourly_rate?: number;
  tax_rate_id?: number;
}

export interface CustomerStatistics {
  income: number;
  expenses: number;
  profit: number;
  hours_total: number;
  hours_billable: number;
  hours_non_billable: number;
  hours_open: number;
  billability_percentage: number;
}

export interface Project {
  id: number;
  name: string;
  customer_id: number;
  project_type: 'byHour' | 'fixedBudget' | 'fixedPrice';
  budget?: number;
  hourly_rate?: number;
  start_date?: string;
  end_date?: string;
  kanban_status?: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  customer_id?: number;
  newCustomerName?: string;
  project_type?: 'byHour' | 'fixedBudget' | 'fixedPrice';
  budget?: number;
  hourly_rate?: number;
}

export interface UpdateProjectInput {
  name?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  kanban_status?: string;
  archived?: boolean;
}

export interface Task {
  id: number;
  title: string;
  project_id: number;
  status: 'open' | 'in-progress' | 'done';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  project_id: number;
  status?: 'open' | 'in-progress' | 'done';
  due_date?: string;
}

export interface TimeEntry {
  id: number;
  project_id: number;
  task_id?: number;
  user_id: number;
  date: string;
  hours: number;
  minutes: number;
  description?: string;
  hourly_rate?: number;
  billable: boolean;
  total_value?: number;
  start?: string;
  end?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeInput {
  project_id: number;
  date: string;
  hours: number;
  minutes: number;
  description?: string;
  hourly_rate?: number;
  billable?: boolean;
  task_id?: number;
  start?: string;
  end?: string;
}

export interface Timer {
  id: number;
  project_id: number;
  task_id?: number;
  description?: string;
  started_at: string;
}

export interface Entry {
  id: number;
  date: string;
  description?: string;
  sum: number;
  debit_account_id: number;
  credit_account_id: number;
  customer_id?: number;
  project_id?: number;
  tax_rate_id?: number;
  billable?: boolean;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryInput {
  date: string;
  debit_account_id: number;
  credit_account_id: number;
  description?: string;
  sum?: number;
  customer_id?: number;
  project_id?: number;
  tax_rate_id?: number;
  tag_ids?: number[];
  billable?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  unit?: string;
}

export type AccountType = 'bank' | 'deprecations' | 'income' | 'expense' | 'assets' | 'liabilities' | 'balance_sheet';

export interface Account {
  id: number;
  name: string;
  number: string;
  type: AccountType;
  iban?: string;
  is_primary_bank?: boolean;
  balance?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  name: string;
  number: string;
  type: AccountType;
  iban?: string;
  is_primary_bank?: boolean;
}

export type TagColor = 'orange' | 'blue' | 'lime' | 'yellow' | 'turquoise' | 'marine' | 'purple' | 'pink' | 'green' | 'red' | 'gray';

export interface Tag {
  id: number;
  name: string;
  color: TagColor;
  created_at: string;
  updated_at: string;
}

export interface CreateTagInput {
  name: string;
  color: TagColor;
}

export interface TaxRate {
  id: number;
  name: string;
  rate: number;
  is_default: boolean;
}

export interface Contact {
  id: number;
  customer_id: number;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

// ==================== INVOICES ====================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  company_id: number;
  customer_id: number;
  contact_id?: number;
  proposal_id?: number;
  project_id?: number;
  bank_account_id?: number;
  number: number;
  title: string;
  lang: string;
  date: string;
  payable_until: string;
  positions: string; // JSON string of line items
  remarks_top?: string;
  remarks?: string;
  status: InvoiceStatus;
  currency: string;
  total_value: number;
  discount_rate?: number;
  discount_amount?: number;
  total_value_with_discount: number;
  vat_active: boolean;
  vat_rate?: number;
  vat_amount?: number;
  total_value_with_vat?: number;
  final_value: number;
  reference?: string;
  qr_reference?: string;
  entry_id?: number;
  repeat: boolean;
  repeat_interval?: string;
  overdue: boolean;
  open_total: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface CreateInvoiceInput {
  customer_id: number;
  title: string;
  date: string;
  payable_until: string;
  positions: string; // JSON string of line items
  contact_id?: number;
  project_id?: number;
  bank_account_id?: number;
  lang?: string;
  remarks_top?: string;
  remarks?: string;
  currency?: string;
  discount_rate?: number;
  discount_amount?: number;
  vat_active?: boolean;
  vat_rate?: number;
  tax_rate_id?: number;
}

// ==================== PROPOSALS ====================

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface Proposal {
  id: number;
  company_id: number;
  customer_id: number;
  contact_id?: number;
  invoice_id?: number;
  project_id?: number;
  number: number;
  title: string;
  lang: string;
  date: string;
  valid_until: string;
  positions: string; // JSON string of line items
  remarks_top?: string;
  remarks?: string;
  status: ProposalStatus;
  currency: string;
  total_value: number;
  discount_rate?: number;
  discount_amount?: number;
  total_value_with_discount: number;
  vat_active: boolean;
  vat_rate?: number;
  vat_amount?: number;
  total_value_with_vat?: number;
  final_value: number;
  with_signature: boolean;
  signature_remark?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface CreateProposalInput {
  customer_id: number;
  title: string;
  date: string;
  valid_until: string;
  positions: string; // JSON string of line items
  contact_id?: number;
  project_id?: number;
  lang?: string;
  remarks_top?: string;
  remarks?: string;
  currency?: string;
  discount_rate?: number;
  discount_amount?: number;
  vat_active?: boolean;
  vat_rate?: number;
  tax_rate_id?: number;
  with_signature?: boolean;
  signature_remark?: string;
}
