# MILKEE MCP Server

MCP (Model Context Protocol) server for [MILKEE](https://milkee.ch) - Swiss accounting software for freelancers and small businesses.

## Features

This MCP server provides full access to the MILKEE API:

- **Customers** - CRUD operations, statistics, contacts management
- **Projects** - CRUD, bulk archive/unarchive
- **Tasks** - CRUD with status tracking
- **Time Tracking** - CRUD, timer start/stop/discard
- **Bookkeeping Entries** - CRUD, bulk operations, entry numbering
- **Products** - CRUD for product catalog
- **Accounts** - Manage chart of accounts (bank, income, expense, etc.)
- **Tags** - Color-coded labels for organization
- **Tax Rates** - Swiss VAT rate management
- **Contacts** - Customer contact management

## Installation

```bash
npm install
npm run build
```

## Configuration

The server requires two environment variables:

| Variable | Description |
|----------|-------------|
| `MILKEE_API_TOKEN` | Your MILKEE API token (generate in MILKEE settings) |
| `MILKEE_COMPANY_ID` | Your MILKEE company ID |

### Getting Your API Token

1. Log in to [MILKEE](https://app.milkee.ch)
2. Go to Settings > API
3. Generate a new API token
4. Copy your company ID from the URL or settings

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "milkee": {
      "command": "node",
      "args": ["path/to/milkee-mcp/dist/index.js"],
      "env": {
        "MILKEE_API_TOKEN": "your-api-token",
        "MILKEE_COMPANY_ID": "your-company-id"
      }
    }
  }
}
```

## Available Tools

### Customers
- `milkee_list_customers` - List customers with filtering
- `milkee_get_customer` - Get customer details
- `milkee_create_customer` - Create new customer
- `milkee_update_customer` - Update customer
- `milkee_delete_customer` - Delete customer
- `milkee_get_customer_statistics` - Get financial stats

### Projects
- `milkee_list_projects` - List projects
- `milkee_get_project` - Get project details
- `milkee_create_project` - Create project
- `milkee_update_project` - Update project
- `milkee_delete_project` - Delete project
- `milkee_bulk_archive_projects` - Archive/unarchive multiple

### Tasks
- `milkee_list_tasks` - List tasks
- `milkee_get_task` - Get task details
- `milkee_create_task` - Create task
- `milkee_update_task` - Update task
- `milkee_delete_task` - Delete task

### Time Tracking
- `milkee_list_times` - List time entries
- `milkee_get_time` - Get time entry
- `milkee_create_time` - Log time
- `milkee_update_time` - Update time entry
- `milkee_delete_time` - Delete time entry
- `milkee_get_timer` - Get running timer
- `milkee_start_timer` - Start timer
- `milkee_stop_timer` - Stop timer (creates entry)
- `milkee_update_timer_description` - Update timer description
- `milkee_discard_timer` - Discard timer

### Bookkeeping
- `milkee_list_entries` - List bookkeeping entries
- `milkee_get_entry` - Get entry details
- `milkee_create_entry` - Create entry
- `milkee_update_entry` - Update entry
- `milkee_delete_entry` - Delete entry
- `milkee_get_next_entry_number` - Get next booking number
- `milkee_bulk_delete_entries` - Delete multiple entries

### Products
- `milkee_list_products` - List products
- `milkee_get_product` - Get product
- `milkee_create_product` - Create product
- `milkee_update_product` - Update product
- `milkee_delete_product` - Delete product

### Accounts
- `milkee_list_accounts` - List accounts
- `milkee_get_account` - Get account
- `milkee_create_account` - Create account
- `milkee_update_account` - Update account
- `milkee_delete_account` - Delete account

### Tags
- `milkee_list_tags` - List tags
- `milkee_get_tag` - Get tag
- `milkee_create_tag` - Create tag
- `milkee_update_tag` - Update tag
- `milkee_delete_tag` - Delete tag
- `milkee_get_tag_colors` - Get available colors

### Tax Rates
- `milkee_list_tax_rates` - List tax rates
- `milkee_get_tax_rate` - Get tax rate

### Contacts
- `milkee_list_contacts` - List customer contacts
- `milkee_create_contact` - Create contact
- `milkee_update_contact` - Update contact
- `milkee_delete_contact` - Delete contact

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## API Documentation

- [MILKEE API Docs](https://apidocs.milkee.ch/)
- [API Overview](https://apidocs.milkee.ch/api/)

## License

MIT
