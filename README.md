# MILKEE MCP Server

Give Claude AI direct access to your [MILKEE](https://milkee.ch) Swiss accounting software - invoices, proposals, bookkeeping, customers, and more.

> **Note:** This is an unofficial community project, not an official MILKEE product.

## What is MILKEE?

[MILKEE](https://milkee.ch) is Swiss accounting software for freelancers and small businesses. Its core features are:

1. **Invoicing** (Rechnungen) - Create and send QR invoices
2. **Proposals/Quotes** (Offerten) - Send offers, convert to invoices
3. **Bookkeeping** (Buchhaltung) - Double-entry accounting, VAT, financial statements
4. **Time Tracking** (Zeiterfassung) - Track hours, bill to clients
5. **Customer Management** (Kunden) - Contacts, projects, billing history

This MCP server connects Claude to your MILKEE account so you can:

- "Show me all unpaid invoices"
- "What's my revenue this month?"
- "List proposals that are still pending"
- "Create an invoice for customer X"
- "How much did I bill customer Y last year?"

---

## Quick Start

### 1. Get Your MILKEE Credentials

1. Log in to [MILKEE](https://app.milkee.ch)
2. Go to **Settings > API**
3. Generate a new API token
4. Note your **Company ID** from the URL (e.g., `app.milkee.ch/companies/1234/...` → ID is `1234`)

### 2. Add to Claude Desktop

Find your config file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this to your `mcpServers`:

```json
{
  "mcpServers": {
    "milkee": {
      "command": "npx",
      "args": ["-y", "milkee-mcp@latest"],
      "env": {
        "MILKEE_API_TOKEN": "your-api-token-here",
        "MILKEE_COMPANY_ID": "your-company-id-here"
      }
    }
  }
}
```

> **Important:** Use `milkee-mcp@latest` to always get the newest version.

### 3. Restart Claude Desktop

That's it! Ask Claude something like "List my MILKEE invoices" to test.

---

## Read-Only Mode (Recommended for Analysis)

If you only want Claude to **read and analyze** your data without making changes, enable read-only mode:

```json
{
  "mcpServers": {
    "milkee": {
      "command": "npx",
      "args": ["-y", "milkee-mcp@latest"],
      "env": {
        "MILKEE_API_TOKEN": "your-api-token-here",
        "MILKEE_COMPANY_ID": "your-company-id-here",
        "MILKEE_READ_ONLY": "true"
      }
    }
  }
}
```

**Read-only mode:**
- Only exposes `list` and `get` tools
- Cannot create, update, delete, or send anything
- Perfect for financial analysis and reporting
- Protects against accidental modifications

---

## Usage with Claude Code (CLI)

```bash
claude mcp add milkee -e MILKEE_API_TOKEN=your-token -e MILKEE_COMPANY_ID=your-id -- npx -y milkee-mcp@latest
```

For **read-only mode** in Claude Code:

```bash
claude mcp add milkee -e MILKEE_API_TOKEN=your-token -e MILKEE_COMPANY_ID=your-id -e MILKEE_READ_ONLY=true -- npx -y milkee-mcp@latest
```

---

## Understanding Your Data

**Important distinction:**

| Term | Meaning | Example |
|------|---------|---------|
| **Company** | YOUR business (the MILKEE account holder) | "Blizzard Ventures" |
| **Customer** | People/businesses you bill | "Acme Corp", "John Smith" |

When asking Claude about your business:
- "How is **my business** doing?" → Uses `milkee_get_company_summary`
- "What's **my** revenue?" → Your company's revenue
- "Show **customer** statistics for Acme" → Stats about someone you bill

The `milkee_get_company_summary` tool provides YOUR business overview (invoices, revenue, expenses, profit, cash position). Customer tools (`milkee_get_customer_statistics`) show data about people you invoice.

---

## What Can It Do?

### Core Accounting (Primary Use)

| Category | Capabilities |
|----------|--------------|
| **Invoices** | List, create, update, delete, mark paid, send via email |
| **Proposals** | List, create, update, delete, send, convert to invoice |
| **Bookkeeping** | Income/expense entries, accounts, ledger transactions |
| **Customers** | Full customer management with financial statistics |

### Additional Features

| Category | Capabilities |
|----------|--------------|
| **Projects** | Track projects, budgets, link to customers |
| **Time Tracking** | Log hours, timer, billable tracking |
| **Products** | Product/service catalog for invoices |
| **Tags** | Color-coded labels for organization |
| **Tasks** | Project task management |

### Example Prompts

**Business Overview:**
- "How is my business doing?"
- "Give me a financial summary"
- "What's my profit this year?"
- "Show me my cash position"

**Financial Analysis:**
- "Show me all unpaid invoices"
- "What's my total revenue this year?"
- "List expenses for last month"
- "Which customers have overdue invoices?"

**Invoicing:**
- "Create an invoice for Acme Corp for 10 hours at CHF 150/hour"
- "Mark invoice #2024001 as paid"
- "Send the latest invoice to the customer"

**Proposals:**
- "List all pending proposals"
- "Convert proposal #250003 to an invoice"
- "What proposals are expiring this week?"

---

## All Available Tools

<details>
<summary>Click to expand full tool list (71 tools)</summary>

### Company (Your Business)
- `milkee_get_company_summary` - Get YOUR business overview (revenue, expenses, profit, cash)

### Invoices (Rechnungen)
- `milkee_list_invoices` - List invoices with filtering
- `milkee_get_invoice` - Get invoice details
- `milkee_create_invoice` - Create new invoice
- `milkee_update_invoice` - Update invoice
- `milkee_delete_invoice` - Delete draft invoice
- `milkee_mark_invoice_paid` - Mark as paid
- `milkee_send_invoice` - Send via email

### Proposals (Offerten)
- `milkee_list_proposals` - List proposals/quotes
- `milkee_get_proposal` - Get proposal details
- `milkee_create_proposal` - Create new proposal
- `milkee_update_proposal` - Update proposal
- `milkee_delete_proposal` - Delete proposal
- `milkee_convert_proposal_to_invoice` - Convert to invoice
- `milkee_send_proposal` - Send via email

### Customers
- `milkee_list_customers` - List customers with filtering
- `milkee_get_customer` - Get customer details
- `milkee_create_customer` - Create new customer
- `milkee_update_customer` - Update customer
- `milkee_delete_customer` - Delete customer
- `milkee_get_customer_statistics` - Get financial stats

### Bookkeeping (Buchungen)
- `milkee_list_entries` - List ledger entries
- `milkee_get_entry` - Get entry details
- `milkee_create_entry` - Create entry
- `milkee_update_entry` - Update entry
- `milkee_delete_entry` - Delete entry
- `milkee_get_next_entry_number` - Get next booking number
- `milkee_bulk_delete_entries` - Delete multiple entries

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

</details>

---

## Security

- Your API token stays on your machine (in Claude's config file)
- This MCP runs locally - credentials are never sent anywhere except directly to MILKEE's API
- Use **read-only mode** for analysis to prevent accidental modifications
- The source code is fully open: [GitHub](https://github.com/thwinter-ch/milkee-mcp)

---

## Troubleshooting

**"MILKEE_API_TOKEN and MILKEE_COMPANY_ID environment variables are required"**
→ Check your Claude config has the correct env variables set.

**Claude doesn't show MILKEE tools**
→ Restart Claude Desktop after editing the config.

**API errors**
→ Verify your API token is valid and hasn't expired in MILKEE settings.

**Getting stale version**
→ Make sure you're using `milkee-mcp@latest` in your config, not just `milkee-mcp`.

---

## Testing

### Test Basic Connection
Ask Claude: "List my MILKEE customers" - should return customer names.

### Test Company Summary
Ask Claude: "How is my business doing?" or "Give me a company overview" - should return your business stats (invoices, revenue, expenses, profit).

### Test Read-Only Mode
1. Set `MILKEE_READ_ONLY=true` in your config
2. Restart Claude Desktop
3. Ask Claude: "Create a test customer called Test123"
4. Claude should say it can't create/modify data in read-only mode

### Test Checklist

| Test | Prompt | Expected |
|------|--------|----------|
| List invoices | "Show my invoices" | Invoice list with numbers, dates, amounts |
| Company stats | "What's my profit?" | Revenue, expenses, net profit |
| Customer stats | "Statistics for [customer name]" | That customer's billing history |
| Invoice details | "Show invoice #[number]" | Full invoice with line items |
| List proposals | "Show pending proposals" | Proposal list |
| Time entries | "What hours did I log this week?" | Time entries |
| Read-only block | "Create a customer" (with read-only) | Should be blocked |

---

## Development

Want to contribute or run from source?

```bash
git clone https://github.com/thwinter-ch/milkee-mcp.git
cd milkee-mcp
npm install
npm run build
```

Run locally:
```bash
MILKEE_API_TOKEN=xxx MILKEE_COMPANY_ID=123 node dist/index.js
```

For local development with Claude Desktop, point to your local build:
```json
{
  "mcpServers": {
    "milkee": {
      "command": "node",
      "args": ["/path/to/milkee-mcp/dist/index.js"],
      "env": {
        "MILKEE_API_TOKEN": "your-token",
        "MILKEE_COMPANY_ID": "your-id"
      }
    }
  }
}
```

---

## Links

- [MILKEE Website](https://milkee.ch)
- [MILKEE API Docs](https://apidocs.milkee.ch/)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Changelog](CHANGELOG.md)
- [Report Issues](https://github.com/thwinter-ch/milkee-mcp/issues)

## Disclaimer

This is an **experimental project** provided "as is" without warranty of any kind. Use at your own risk. The author assumes no responsibility for any damages, data loss, or issues arising from the use of this software.

This is an independent community project, not an official MILKEE GmbH product.

## Disclosure

The author of this project ([Thomas Winter](https://github.com/thwinter-ch)) serves as an advisor to MILKEE GmbH.

## License

MIT
