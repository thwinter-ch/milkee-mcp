# MILKEE MCP Server

Give Claude AI direct access to your [MILKEE](https://milkee.ch) Swiss accounting software.

**[Deutsche Anleitung / German Guide](QUICKSTART.de.md)**

## What is MILKEE?

[MILKEE](https://milkee.ch) is Swiss accounting software for freelancers and small businesses:
- **Invoicing** - QR invoices (Swiss QR-bill standard)
- **Proposals** - Quotes that convert to invoices
- **Bookkeeping** - Double-entry accounting, VAT
- **Time Tracking** - Hours, timers, billable tracking
- **Customers** - Contact and billing management

## What is this MCP Server?

This MCP server connects Claude to your MILKEE account, letting you ask natural questions about your business finances, create invoices, manage proposals, and more.

Works with **Claude Desktop** and **Claude Code (CLI)**.

---

[MILKEE](https://milkee.ch) | [API Docs](https://apidocs.milkee.ch/) | [MCP Protocol](https://modelcontextprotocol.io) | [Changelog](CHANGELOG.md) | [Build Diary](BUILD_DIARY.md)

## Disclaimer

Independent community project, not an official MILKEE GmbH product. Provided "as is" without warranty. Use at your own risk.

## Disclosure

The author ([Thomas Winter](https://github.com/thwinter-ch)) serves as an advisor to MILKEE GmbH.

## License

MIT

---

## Contents

- [What You Can Do](#what-you-can-do)
- [Report Types](#report-types)
- [Example Prompts](#example-prompts)
- [All Tools](#all-tools)
- [Setup](#setup)
- [Reference](#reference)

---

## What You Can Do

| Ask Claude... | You Get |
|---------------|---------|
| "How is my business doing?" | Profit/loss summary, invoice status, cash position |
| "Show unpaid invoices" | List of outstanding invoices with amounts |
| "Give me a complete financial assessment" | Deep analysis with trends, top customers, expense breakdown |
| "Create an invoice for Acme Corp" | New invoice created in MILKEE |
| "Which customers owe me money?" | Overdue invoice breakdown by customer |

---

## Report Types

Claude generates different levels of reports depending on how you ask:

### Quick Summary
**Prompt:** "How is my business doing?"

Fast overview using a single API call:
- Revenue, expenses, net profit, profit margin
- Bank balance
- Invoice counts by status
- Outstanding receivables

```
Financial Health
┌────────────────┬───────────────┐
│ Total Income   │ CHF 52'275.75 │
│ Total Expenses │ CHF 19'793.32 │
│ Net Profit     │ CHF 32'482.43 │
│ Profit Margin  │ 62.1%         │
│ Bank Balance   │ CHF 12'136.35 │
└────────────────┴───────────────┘
```

### Deep Financial Assessment
**Prompt:** "Give me a complete financial assessment"

Comprehensive analysis using multiple API calls. Everything above plus:
- Monthly revenue trends
- Top 10 customers by revenue
- Expense breakdown by category
- Balance sheet summary
- Customer concentration analysis
- Seasonality insights

```
Monthly Revenue Trend
┌──────────┬──────────┐
│ Dec 2025 │ 9'053.25 │
│ Nov 2025 │ 2'602.70 │
│ Oct 2025 │ 1'804.00 │
│ ...      │ ...      │
└──────────┴──────────┘

Top Customers by Revenue
┌─────────────────┬───────────────┐
│ Migros          │ CHF 9'236.00  │
│ Veloblitz       │ CHF 6'856.70  │
│ Bridge AG       │ CHF 3'853.00  │
└─────────────────┴───────────────┘
```

### Invoice & Proposal Reports
**Prompts:** "Show my invoices", "List pending proposals", "What's overdue?"

### Customer Analysis
**Prompt:** "Show me statistics for [customer name]"

---

## Example Prompts

### Business Overview
| Prompt | What You Get |
|--------|--------------|
| "How is my business doing?" | Quick summary: profit, invoices, cash |
| "Give me a complete financial assessment" | Deep analysis: trends, top customers, expense categories |
| "What's my profit this year?" | Revenue minus expenses calculation |
| "Who are my top customers by revenue?" | Customer ranking |

### Invoicing
| Prompt | What You Get |
|--------|--------------|
| "Show unpaid invoices" | List of pending/overdue invoices |
| "Create an invoice for Acme Corp for 10 hours at CHF 150/hour" | New invoice created |
| "Mark invoice #2024001 as paid" | Invoice status updated |
| "Send the latest invoice to the customer" | Email sent via MILKEE |

### Proposals
| Prompt | What You Get |
|--------|--------------|
| "List pending proposals" | Proposals awaiting response |
| "Convert proposal #250003 to an invoice" | New invoice from proposal |
| "What proposals are expiring this week?" | Time-sensitive proposals |

### Analysis
| Prompt | What You Get |
|--------|--------------|
| "Which customers have overdue invoices?" | Overdue breakdown by customer |
| "What are my biggest expense categories?" | Expense analysis |
| "Show revenue trends by month" | Monthly revenue chart |
| "Who are my top 10 customers?" | Customers ranked by revenue |

---

## All Tools

<details>
<summary>Click to expand (71 tools)</summary>

### Company
- `milkee_get_company_summary` - Your business overview

### Invoices
- `milkee_list_invoices` - List with filtering
- `milkee_get_invoice` - Full details
- `milkee_create_invoice` - Create new
- `milkee_update_invoice` - Modify
- `milkee_delete_invoice` - Delete draft
- `milkee_mark_invoice_paid` - Mark paid
- `milkee_send_invoice` - Send via email

### Proposals
- `milkee_list_proposals` - List quotes
- `milkee_get_proposal` - Full details
- `milkee_create_proposal` - Create new
- `milkee_update_proposal` - Modify
- `milkee_delete_proposal` - Delete
- `milkee_convert_proposal_to_invoice` - Convert
- `milkee_send_proposal` - Send via email

### Customers
- `milkee_list_customers` - List with filtering
- `milkee_get_customer` - Full details
- `milkee_create_customer` - Create new
- `milkee_update_customer` - Modify
- `milkee_delete_customer` - Delete
- `milkee_get_customer_statistics` - Financial stats

### Bookkeeping
- `milkee_list_entries` - Ledger entries
- `milkee_get_entry` - Entry details
- `milkee_create_entry` - Create entry
- `milkee_update_entry` - Modify
- `milkee_delete_entry` - Delete
- `milkee_get_next_entry_number` - Next number
- `milkee_bulk_delete_entries` - Bulk delete

### Projects
- `milkee_list_projects`, `milkee_get_project`, `milkee_create_project`, `milkee_update_project`, `milkee_delete_project`, `milkee_bulk_archive_projects`

### Tasks
- `milkee_list_tasks`, `milkee_get_task`, `milkee_create_task`, `milkee_update_task`, `milkee_delete_task`

### Time Tracking
- `milkee_list_times`, `milkee_get_time`, `milkee_create_time`, `milkee_update_time`, `milkee_delete_time`
- `milkee_get_timer`, `milkee_start_timer`, `milkee_stop_timer`, `milkee_update_timer_description`, `milkee_discard_timer`

### Products
- `milkee_list_products`, `milkee_get_product`, `milkee_create_product`, `milkee_update_product`, `milkee_delete_product`

### Accounts
- `milkee_list_accounts`, `milkee_get_account`, `milkee_create_account`, `milkee_update_account`, `milkee_delete_account`

### Tags
- `milkee_list_tags`, `milkee_get_tag`, `milkee_create_tag`, `milkee_update_tag`, `milkee_delete_tag`, `milkee_get_tag_colors`

### Tax Rates
- `milkee_list_tax_rates`, `milkee_get_tax_rate`

### Contacts
- `milkee_list_contacts`, `milkee_create_contact`, `milkee_update_contact`, `milkee_delete_contact`

</details>

---

## Setup

### Get Your Credentials

1. Log in to [MILKEE](https://app.milkee.ch)
2. Go to **Settings > API**
3. Generate a new API token
4. Note your **Company ID** from the URL (e.g., `app.milkee.ch/companies/1234/...` → ID is `1234`)

### Claude Desktop

Config file location:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Full access:**
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

**Read-only** (for analysis only - no create/update/delete):
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

Restart Claude Desktop after saving. Test with: "List my MILKEE invoices"

### Claude Code (CLI)

**Full access:**
```bash
claude mcp add milkee -e MILKEE_API_TOKEN=your-token -e MILKEE_COMPANY_ID=your-id -- npx -y milkee-mcp@latest
```

**Read-only:**
```bash
claude mcp add milkee -e MILKEE_API_TOKEN=your-token -e MILKEE_COMPANY_ID=your-id -e MILKEE_READ_ONLY=true -- npx -y milkee-mcp@latest
```

---

## Reference

### Understanding Your Data

| Term | Meaning | Example |
|------|---------|---------|
| **Company** | YOUR business (the MILKEE account holder) | "Blizzard Ventures" |
| **Customer** | People/businesses you bill | "Acme Corp" |

- "How is **my business** doing?" → Your company's financials
- "Show **customer** statistics for Acme" → Stats about someone you invoice

### Security

- API token stays on your machine
- MCP runs locally - credentials only sent to MILKEE's API
- Use **read-only mode** for safe analysis

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "MILKEE_API_TOKEN required" | Check env variables in config |
| Claude doesn't show tools | Restart Claude Desktop |
| API errors | Verify token in MILKEE Settings > API |
| Stale version | Use `milkee-mcp@latest` not `milkee-mcp` |

### Development

```bash
git clone https://github.com/thwinter-ch/milkee-mcp.git
cd milkee-mcp
npm install
npm run build
```

Local testing:
```bash
MILKEE_API_TOKEN=xxx MILKEE_COMPANY_ID=123 node dist/index.js
```

Point Claude Desktop to local build:
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
