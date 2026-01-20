#!/usr/bin/env node
/**
 * MILKEE MCP Server
 * Model Context Protocol server for MILKEE Swiss accounting software
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MilkeeApi, TagColor, AccountType } from './api.js';

// Get configuration from environment variables
const API_TOKEN = process.env.MILKEE_API_TOKEN;
const COMPANY_ID = process.env.MILKEE_COMPANY_ID;

if (!API_TOKEN || !COMPANY_ID) {
  console.error('Error: MILKEE_API_TOKEN and MILKEE_COMPANY_ID environment variables are required');
  process.exit(1);
}

const api = new MilkeeApi({ apiToken: API_TOKEN, companyId: COMPANY_ID });

// ==================== TOOL DEFINITIONS ====================

const tools: Tool[] = [
  // ==================== CUSTOMERS ====================
  {
    name: 'milkee_list_customers',
    description: 'List all customers with optional filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: { type: 'number', description: 'Items per page (default: 15, max: 100)' },
        name: { type: 'string', description: 'Filter by name (partial match)' },
        archived: { type: 'boolean', description: 'Filter by archived status' },
        include: { type: 'string', description: 'Include relations: contacts, taxRate' },
      },
    },
  },
  {
    name: 'milkee_get_customer',
    description: 'Get details of a specific customer',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Customer ID' },
        include: { type: 'string', description: 'Include relations: taxRate, contacts, proposals, invoices, activeProjects' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_customer',
    description: 'Create a new customer',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Customer name (required, max 255 chars)' },
        contact_name: { type: 'string', description: 'Contact person name' },
        street: { type: 'string', description: 'Street address' },
        zip: { type: 'string', description: 'ZIP/postal code' },
        city: { type: 'string', description: 'City' },
        country: { type: 'string', description: 'Country' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        website: { type: 'string', description: 'Website URL' },
        default_hourly_rate: { type: 'number', description: 'Default hourly rate' },
        tax_rate_id: { type: 'number', description: 'Tax rate ID' },
      },
      required: ['name'],
    },
  },
  {
    name: 'milkee_update_customer',
    description: 'Update an existing customer',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Customer ID' },
        name: { type: 'string', description: 'Customer name' },
        contact_name: { type: 'string', description: 'Contact person name' },
        street: { type: 'string', description: 'Street address' },
        zip: { type: 'string', description: 'ZIP/postal code' },
        city: { type: 'string', description: 'City' },
        country: { type: 'string', description: 'Country' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        website: { type: 'string', description: 'Website URL' },
        default_hourly_rate: { type: 'number', description: 'Default hourly rate' },
        tax_rate_id: { type: 'number', description: 'Tax rate ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_customer',
    description: 'Delete a customer (only if no linked projects or invoices)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Customer ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_get_customer_statistics',
    description: 'Get financial statistics for a customer (income, expenses, hours, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Customer ID' },
      },
      required: ['id'],
    },
  },

  // ==================== PROJECTS ====================
  {
    name: 'milkee_list_projects',
    description: 'List all projects with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Items per page (max: 100)' },
        archived: { type: 'boolean', description: 'Filter by archived status' },
        customer_id: { type: 'number', description: 'Filter by customer ID' },
        include: { type: 'string', description: 'Include relations' },
      },
    },
  },
  {
    name: 'milkee_get_project',
    description: 'Get details of a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
        include: { type: 'string', description: 'Include relations: customer, invoices, tasks' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_project',
    description: 'Create a new project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name (required)' },
        customer_id: { type: 'number', description: 'Customer ID (or use newCustomerName)' },
        newCustomerName: { type: 'string', description: 'Create new customer with this name' },
        project_type: { type: 'string', enum: ['byHour', 'fixedBudget', 'fixedPrice'], description: 'Project billing type' },
        budget: { type: 'number', description: 'Project budget' },
        hourly_rate: { type: 'number', description: 'Hourly rate' },
      },
      required: ['name'],
    },
  },
  {
    name: 'milkee_update_project',
    description: 'Update an existing project',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
        name: { type: 'string', description: 'Project name' },
        budget: { type: 'number', description: 'Project budget' },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        kanban_status: { type: 'string', description: 'Kanban status' },
        archived: { type: 'boolean', description: 'Archive status' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_project',
    description: 'Delete a project (only if no billable time entries)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_bulk_archive_projects',
    description: 'Archive or unarchive multiple projects',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'number' }, description: 'Project IDs' },
        archive: { type: 'boolean', description: 'True to archive, false to unarchive' },
      },
      required: ['ids', 'archive'],
    },
  },

  // ==================== TASKS ====================
  {
    name: 'milkee_list_tasks',
    description: 'List all tasks with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Items per page' },
        status: { type: 'string', enum: ['open', 'in-progress', 'done'], description: 'Filter by status' },
        project_id: { type: 'number', description: 'Filter by project ID' },
        include: { type: 'string', description: 'Include relations' },
      },
    },
  },
  {
    name: 'milkee_get_task',
    description: 'Get details of a specific task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Task ID' },
        include: { type: 'string', description: 'Include relations' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_task',
    description: 'Create a new task',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title (required)' },
        project_id: { type: 'number', description: 'Project ID (required)' },
        status: { type: 'string', enum: ['open', 'in-progress', 'done'], description: 'Task status' },
        due_date: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
      },
      required: ['title', 'project_id'],
    },
  },
  {
    name: 'milkee_update_task',
    description: 'Update an existing task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Task ID' },
        title: { type: 'string', description: 'Task title' },
        status: { type: 'string', enum: ['open', 'in-progress', 'done'], description: 'Task status' },
        due_date: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_task',
    description: 'Delete a task',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Task ID' },
      },
      required: ['id'],
    },
  },

  // ==================== TIME ENTRIES ====================
  {
    name: 'milkee_list_times',
    description: 'List time entries with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Items per page' },
        user_id: { type: 'number', description: 'Filter by user ID' },
        customer_id: { type: 'number', description: 'Filter by customer ID' },
        project_id: { type: 'number', description: 'Filter by project ID' },
        billable: { type: 'boolean', description: 'Filter by billable status' },
        status: { type: 'string', description: 'Filter by status' },
        date: { type: 'string', description: 'Filter by date (YYYY-MM-DD or range)' },
        group_by: { type: 'string', enum: ['date', 'project', 'weeks'], description: 'Group results by' },
        include: { type: 'string', description: 'Include relations: project, task, user' },
      },
    },
  },
  {
    name: 'milkee_get_time',
    description: 'Get details of a specific time entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Time entry ID' },
        include: { type: 'string', description: 'Include relations' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_time',
    description: 'Create a new time entry',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID (required)' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD, required)' },
        hours: { type: 'number', description: 'Hours (required)' },
        minutes: { type: 'number', description: 'Minutes (required)' },
        description: { type: 'string', description: 'Description' },
        hourly_rate: { type: 'number', description: 'Hourly rate' },
        billable: { type: 'boolean', description: 'Is billable' },
        task_id: { type: 'number', description: 'Task ID' },
        start: { type: 'string', description: 'Start time (HH:MM)' },
        end: { type: 'string', description: 'End time (HH:MM)' },
      },
      required: ['project_id', 'date', 'hours', 'minutes'],
    },
  },
  {
    name: 'milkee_update_time',
    description: 'Update an existing time entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Time entry ID' },
        project_id: { type: 'number', description: 'Project ID' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        hours: { type: 'number', description: 'Hours' },
        minutes: { type: 'number', description: 'Minutes' },
        description: { type: 'string', description: 'Description' },
        hourly_rate: { type: 'number', description: 'Hourly rate' },
        billable: { type: 'boolean', description: 'Is billable' },
        task_id: { type: 'number', description: 'Task ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_time',
    description: 'Delete a time entry (cannot delete invoiced entries)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Time entry ID' },
      },
      required: ['id'],
    },
  },

  // ==================== TIMER ====================
  {
    name: 'milkee_get_timer',
    description: 'Get the current running timer status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'milkee_start_timer',
    description: 'Start a new timer for time tracking',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID (required)' },
        task_id: { type: 'number', description: 'Task ID (optional)' },
        description: { type: 'string', description: 'Timer description' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'milkee_stop_timer',
    description: 'Stop the current running timer and create a time entry',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'milkee_update_timer_description',
    description: 'Update the description of the running timer',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'New description' },
      },
      required: ['description'],
    },
  },
  {
    name: 'milkee_discard_timer',
    description: 'Discard the current running timer without creating an entry',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ==================== ENTRIES (BOOKKEEPING) ====================
  {
    name: 'milkee_list_entries',
    description: 'List bookkeeping entries with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Items per page' },
        date: { type: 'string', description: 'Filter by date' },
        type: { type: 'string', enum: ['income', 'expense', 'swap'], description: 'Filter by entry type' },
        customer_id: { type: 'number', description: 'Filter by customer ID' },
        project_id: { type: 'number', description: 'Filter by project ID' },
        account_id: { type: 'number', description: 'Filter by account ID' },
        tag_id: { type: 'number', description: 'Filter by tag ID' },
        billable: { type: 'boolean', description: 'Filter by billable status' },
        sort: { type: 'string', description: 'Sort field (e.g., date, sum)' },
        include: { type: 'string', description: 'Include relations: customer, project, tags, tax_rate, accounts' },
      },
    },
  },
  {
    name: 'milkee_get_entry',
    description: 'Get details of a specific bookkeeping entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Entry ID' },
        include: { type: 'string', description: 'Include relations' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_entry',
    description: 'Create a new bookkeeping entry',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date (YYYY-MM-DD, required)' },
        debit_account_id: { type: 'number', description: 'Debit account ID (required)' },
        credit_account_id: { type: 'number', description: 'Credit account ID (required)' },
        description: { type: 'string', description: 'Entry description' },
        sum: { type: 'number', description: 'Amount' },
        customer_id: { type: 'number', description: 'Customer ID' },
        project_id: { type: 'number', description: 'Project ID' },
        tax_rate_id: { type: 'number', description: 'Tax rate ID' },
        tag_ids: { type: 'array', items: { type: 'number' }, description: 'Tag IDs' },
        billable: { type: 'boolean', description: 'Is billable' },
      },
      required: ['date', 'debit_account_id', 'credit_account_id'],
    },
  },
  {
    name: 'milkee_update_entry',
    description: 'Update an existing bookkeeping entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Entry ID' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        debit_account_id: { type: 'number', description: 'Debit account ID' },
        credit_account_id: { type: 'number', description: 'Credit account ID' },
        description: { type: 'string', description: 'Entry description' },
        sum: { type: 'number', description: 'Amount' },
        customer_id: { type: 'number', description: 'Customer ID' },
        project_id: { type: 'number', description: 'Project ID' },
        tax_rate_id: { type: 'number', description: 'Tax rate ID' },
        tag_ids: { type: 'array', items: { type: 'number' }, description: 'Tag IDs' },
        billable: { type: 'boolean', description: 'Is billable' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_entry',
    description: 'Delete a bookkeeping entry (cannot delete entries in locked years)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Entry ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_get_next_entry_number',
    description: 'Get the next available booking number for entries',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['income', 'expense', 'swap'], description: 'Entry type (required)' },
        year: { type: 'number', description: 'Year (optional, defaults to current)' },
      },
      required: ['type'],
    },
  },
  {
    name: 'milkee_bulk_delete_entries',
    description: 'Delete multiple bookkeeping entries at once',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'number' }, description: 'Entry IDs to delete' },
      },
      required: ['ids'],
    },
  },

  // ==================== PRODUCTS ====================
  {
    name: 'milkee_list_products',
    description: 'List all products',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Items per page' },
        name: { type: 'string', description: 'Filter by name' },
        archived: { type: 'boolean', description: 'Filter by archived status' },
      },
    },
  },
  {
    name: 'milkee_get_product',
    description: 'Get details of a specific product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Product ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_product',
    description: 'Create a new product',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name (required)' },
        description: { type: 'string', description: 'Product description' },
        price: { type: 'number', description: 'Product price (required)' },
        unit: { type: 'string', description: 'Unit (e.g., hour, piece)' },
      },
      required: ['name', 'price'],
    },
  },
  {
    name: 'milkee_update_product',
    description: 'Update an existing product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Product ID' },
        name: { type: 'string', description: 'Product name' },
        description: { type: 'string', description: 'Product description' },
        price: { type: 'number', description: 'Product price' },
        unit: { type: 'string', description: 'Unit' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_product',
    description: 'Delete a product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Product ID' },
      },
      required: ['id'],
    },
  },

  // ==================== ACCOUNTS ====================
  {
    name: 'milkee_list_accounts',
    description: 'List all accounts (bank, income, expense, assets, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['bank', 'deprecations', 'income', 'expense', 'assets', 'liabilities', 'balance_sheet'],
          description: 'Filter by account type',
        },
      },
    },
  },
  {
    name: 'milkee_get_account',
    description: 'Get details of a specific account',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Account ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_account',
    description: 'Create a new account',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Account name (required)' },
        number: { type: 'string', description: 'Account number (required)' },
        type: {
          type: 'string',
          enum: ['bank', 'deprecations', 'income', 'expense', 'assets', 'liabilities', 'balance_sheet'],
          description: 'Account type (required)',
        },
        iban: { type: 'string', description: 'IBAN (for bank accounts)' },
        is_primary_bank: { type: 'boolean', description: 'Set as primary bank account' },
      },
      required: ['name', 'number', 'type'],
    },
  },
  {
    name: 'milkee_update_account',
    description: 'Update an existing account',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Account ID' },
        name: { type: 'string', description: 'Account name' },
        number: { type: 'string', description: 'Account number' },
        iban: { type: 'string', description: 'IBAN' },
        is_primary_bank: { type: 'boolean', description: 'Set as primary bank account' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_account',
    description: 'Delete an account (only if no associated entries)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Account ID' },
      },
      required: ['id'],
    },
  },

  // ==================== TAGS ====================
  {
    name: 'milkee_list_tags',
    description: 'List all tags',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Items per page' },
        name: { type: 'string', description: 'Filter by name' },
        color: {
          type: 'string',
          enum: ['orange', 'blue', 'lime', 'yellow', 'turquoise', 'marine', 'purple', 'pink', 'green', 'red', 'gray'],
          description: 'Filter by color',
        },
      },
    },
  },
  {
    name: 'milkee_get_tag',
    description: 'Get details of a specific tag',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Tag ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_create_tag',
    description: 'Create a new tag',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tag name (required)' },
        color: {
          type: 'string',
          enum: ['orange', 'blue', 'lime', 'yellow', 'turquoise', 'marine', 'purple', 'pink', 'green', 'red', 'gray'],
          description: 'Tag color (required)',
        },
      },
      required: ['name', 'color'],
    },
  },
  {
    name: 'milkee_update_tag',
    description: 'Update an existing tag',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Tag ID' },
        name: { type: 'string', description: 'Tag name' },
        color: {
          type: 'string',
          enum: ['orange', 'blue', 'lime', 'yellow', 'turquoise', 'marine', 'purple', 'pink', 'green', 'red', 'gray'],
          description: 'Tag color',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_delete_tag',
    description: 'Delete a tag',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Tag ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'milkee_get_tag_colors',
    description: 'Get available tag colors',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ==================== TAX RATES ====================
  {
    name: 'milkee_list_tax_rates',
    description: 'List all available tax rates',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'milkee_get_tax_rate',
    description: 'Get details of a specific tax rate',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Tax rate ID' },
      },
      required: ['id'],
    },
  },

  // ==================== CONTACTS ====================
  {
    name: 'milkee_list_contacts',
    description: 'List contacts for a customer',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID (required)' },
        page: { type: 'number', description: 'Page number' },
        per_page: { type: 'number', description: 'Items per page' },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'milkee_create_contact',
    description: 'Create a new contact for a customer',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID (required)' },
        name: { type: 'string', description: 'Contact name (required)' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        position: { type: 'string', description: 'Job position' },
      },
      required: ['customer_id', 'name'],
    },
  },
  {
    name: 'milkee_update_contact',
    description: 'Update an existing contact',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID' },
        contact_id: { type: 'number', description: 'Contact ID' },
        name: { type: 'string', description: 'Contact name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        position: { type: 'string', description: 'Job position' },
      },
      required: ['customer_id', 'contact_id'],
    },
  },
  {
    name: 'milkee_delete_contact',
    description: 'Delete a contact',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID' },
        contact_id: { type: 'number', description: 'Contact ID' },
      },
      required: ['customer_id', 'contact_id'],
    },
  },
];

// ==================== TOOL HANDLERS ====================

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      // Customers
      case 'milkee_list_customers': {
        const result = await api.listCustomers({
          page: args.page as number,
          per_page: args.per_page as number,
          'filter[name]': args.name as string,
          'filter[archived]': args.archived as boolean,
          include: args.include as string,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_customer': {
        const result = await api.getCustomer(args.id as number, args.include as string);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_customer': {
        const { id, ...data } = args;
        const result = await api.createCustomer(data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_customer': {
        const { id, ...data } = args;
        const result = await api.updateCustomer(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_customer': {
        await api.deleteCustomer(args.id as number);
        return JSON.stringify({ success: true, message: 'Customer deleted' });
      }
      case 'milkee_get_customer_statistics': {
        const result = await api.getCustomerStatistics(args.id as number);
        return JSON.stringify(result, null, 2);
      }

      // Projects
      case 'milkee_list_projects': {
        const result = await api.listProjects({
          page: args.page as number,
          per_page: args.per_page as number,
          'filter[archived]': args.archived as boolean,
          'filter[customer_id]': args.customer_id as number,
          include: args.include as string,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_project': {
        const result = await api.getProject(args.id as number, args.include as string);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_project': {
        const result = await api.createProject(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_project': {
        const { id, ...data } = args;
        const result = await api.updateProject(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_project': {
        await api.deleteProject(args.id as number);
        return JSON.stringify({ success: true, message: 'Project deleted' });
      }
      case 'milkee_bulk_archive_projects': {
        await api.bulkArchiveProjects(args.ids as number[], args.archive as boolean);
        return JSON.stringify({ success: true, message: `Projects ${args.archive ? 'archived' : 'unarchived'}` });
      }

      // Tasks
      case 'milkee_list_tasks': {
        const result = await api.listTasks({
          page: args.page as number,
          per_page: args.per_page as number,
          'filter[status]': args.status as any,
          'filter[project_id]': args.project_id as number,
          include: args.include as string,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_task': {
        const result = await api.getTask(args.id as number, args.include as string);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_task': {
        const result = await api.createTask(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_task': {
        const { id, ...data } = args;
        const result = await api.updateTask(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_task': {
        await api.deleteTask(args.id as number);
        return JSON.stringify({ success: true, message: 'Task deleted' });
      }

      // Time entries
      case 'milkee_list_times': {
        const result = await api.listTimes({
          page: args.page as number,
          per_page: args.per_page as number,
          'filter[user_id]': args.user_id as number,
          'filter[customer_id]': args.customer_id as number,
          'filter[project_id]': args.project_id as number,
          'filter[billable]': args.billable as boolean,
          'filter[status]': args.status as string,
          'filter[date]': args.date as string,
          group_by: args.group_by as any,
          include: args.include as string,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_time': {
        const result = await api.getTime(args.id as number, args.include as string);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_time': {
        const result = await api.createTime(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_time': {
        const { id, ...data } = args;
        const result = await api.updateTime(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_time': {
        await api.deleteTime(args.id as number);
        return JSON.stringify({ success: true, message: 'Time entry deleted' });
      }

      // Timer
      case 'milkee_get_timer': {
        const result = await api.getTimer();
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_start_timer': {
        const result = await api.startTimer(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_stop_timer': {
        const result = await api.stopTimer();
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_timer_description': {
        const result = await api.updateTimerDescription(args.description as string);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_discard_timer': {
        await api.discardTimer();
        return JSON.stringify({ success: true, message: 'Timer discarded' });
      }

      // Entries (Bookkeeping)
      case 'milkee_list_entries': {
        const result = await api.listEntries({
          page: args.page as number,
          per_page: args.per_page as number,
          'filter[date]': args.date as string,
          'filter[type]': args.type as any,
          'filter[customer_id]': args.customer_id as number,
          'filter[project_id]': args.project_id as number,
          'filter[account_id]': args.account_id as number,
          'filter[tag_id]': args.tag_id as number,
          'filter[billable]': args.billable as boolean,
          sort: args.sort as string,
          include: args.include as string,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_entry': {
        const result = await api.getEntry(args.id as number, args.include as string);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_entry': {
        const result = await api.createEntry(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_entry': {
        const { id, ...data } = args;
        const result = await api.updateEntry(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_entry': {
        await api.deleteEntry(args.id as number);
        return JSON.stringify({ success: true, message: 'Entry deleted' });
      }
      case 'milkee_get_next_entry_number': {
        const result = await api.getNextEntryNumber(args.type as any, args.year as number);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_bulk_delete_entries': {
        await api.bulkDeleteEntries(args.ids as number[]);
        return JSON.stringify({ success: true, message: 'Entries deleted' });
      }

      // Products
      case 'milkee_list_products': {
        const result = await api.listProducts({
          page: args.page as number,
          per_page: args.per_page as number,
          'filter[name]': args.name as string,
          'filter[archived]': args.archived as boolean,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_product': {
        const result = await api.getProduct(args.id as number);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_product': {
        const result = await api.createProduct(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_product': {
        const { id, ...data } = args;
        const result = await api.updateProduct(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_product': {
        await api.deleteProduct(args.id as number);
        return JSON.stringify({ success: true, message: 'Product deleted' });
      }

      // Accounts
      case 'milkee_list_accounts': {
        const result = await api.listAccounts({
          'filter[type]': args.type as AccountType,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_account': {
        const result = await api.getAccount(args.id as number);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_account': {
        const result = await api.createAccount(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_account': {
        const { id, ...data } = args;
        const result = await api.updateAccount(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_account': {
        await api.deleteAccount(args.id as number);
        return JSON.stringify({ success: true, message: 'Account deleted' });
      }

      // Tags
      case 'milkee_list_tags': {
        const result = await api.listTags({
          page: args.page as number,
          per_page: args.per_page as number,
          'filter[name]': args.name as string,
          'filter[color]': args.color as TagColor,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_tag': {
        const result = await api.getTag(args.id as number);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_tag': {
        const result = await api.createTag(args as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_tag': {
        const { id, ...data } = args;
        const result = await api.updateTag(id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_tag': {
        await api.deleteTag(args.id as number);
        return JSON.stringify({ success: true, message: 'Tag deleted' });
      }
      case 'milkee_get_tag_colors': {
        const result = await api.getTagColors();
        return JSON.stringify(result, null, 2);
      }

      // Tax Rates
      case 'milkee_list_tax_rates': {
        const result = await api.listTaxRates();
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_get_tax_rate': {
        const result = await api.getTaxRate(args.id as number);
        return JSON.stringify(result, null, 2);
      }

      // Contacts
      case 'milkee_list_contacts': {
        const result = await api.listContacts(args.customer_id as number, {
          page: args.page as number,
          per_page: args.per_page as number,
        });
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_create_contact': {
        const { customer_id, ...data } = args;
        const result = await api.createContact(customer_id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_update_contact': {
        const { customer_id, contact_id, ...data } = args;
        const result = await api.updateContact(customer_id as number, contact_id as number, data as any);
        return JSON.stringify(result, null, 2);
      }
      case 'milkee_delete_contact': {
        await api.deleteContact(args.customer_id as number, args.contact_id as number);
        return JSON.stringify({ success: true, message: 'Contact deleted' });
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return JSON.stringify({ error: errorMessage });
  }
}

// ==================== SERVER SETUP ====================

const server = new Server(
  {
    name: 'milkee-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await handleToolCall(name, args as Record<string, unknown>);
  return {
    content: [{ type: 'text', text: result }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MILKEE MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
