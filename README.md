# MILKEE MCP Server

Give Claude AI direct access to your [MILKEE](https://milkee.ch) accounting data - customers, time tracking, invoices, bookkeeping, and more.

> **Note:** This is an unofficial community project, not an official MILKEE product.

> **Installation:** Skip the `npm i milkee-mcp` command shown above - that's for developers. MCP users just need to add the config below to Claude. [Jump to Quick Start](#quick-start)

## What is this?

[MILKEE](https://milkee.ch) is Swiss accounting software for freelancers and small businesses.

This MCP server connects Claude (Anthropic's AI) to your MILKEE account, so you can:

- "Show me my customers"
- "Start a timer for project X"
- "What did I earn last month?"
- "Create an expense entry for CHF 50"

**What's MCP?** [Model Context Protocol](https://modelcontextprotocol.io) is a standard that lets AI assistants like Claude connect to external tools and data sources.

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
      "args": ["-y", "milkee-mcp"],
      "env": {
        "MILKEE_API_TOKEN": "your-api-token-here",
        "MILKEE_COMPANY_ID": "your-company-id-here"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

That's it! Ask Claude something like "List my MILKEE customers" to test.

---

## Usage with Claude Code (CLI)

Add to your Claude Code config or run:

```bash
claude mcp add milkee -- npx -y milkee-mcp
```

Then set environment variables `MILKEE_API_TOKEN` and `MILKEE_COMPANY_ID`.

---

## What Can It Do?

| Category | Capabilities |
|----------|--------------|
| **Customers** | List, create, update, delete customers. View financial statistics per customer. |
| **Projects** | Manage projects, track budgets, bulk archive/unarchive. |
| **Time Tracking** | Log time entries, start/stop timer, view hours by project. |
| **Bookkeeping** | Create income/expense entries, manage accounts, handle VAT. |
| **Products** | Manage your product/service catalog. |
| **Tags** | Organize with color-coded labels. |
| **Tasks** | Track project tasks with status (open/in-progress/done). |
| **Contacts** | Manage contacts per customer. |

### Example Prompts

- "Show all my active projects"
- "How many hours did I track this week?"
- "Start a timer for the Acme Corp project"
- "Create a new customer called Example AG in Zurich"
- "List all expenses tagged as 'office'"
- "What's my income this month?"

---

## All Available Tools

<details>
<summary>Click to expand full tool list (50+ tools)</summary>

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

</details>

---

## Security

- Your API token stays on your machine (in Claude's config file)
- This MCP runs locally - your credentials are never sent anywhere except directly to MILKEE's API
- The source code is fully open: [GitHub](https://github.com/thwinter-ch/milkee-mcp)

---

## Troubleshooting

**"MILKEE_API_TOKEN and MILKEE_COMPANY_ID environment variables are required"**
→ Check your Claude config has the correct env variables set.

**Claude doesn't show MILKEE tools**
→ Restart Claude Desktop after editing the config.

**API errors**
→ Verify your API token is valid and hasn't expired in MILKEE settings.

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

---

## Links

- [MILKEE Website](https://milkee.ch)
- [MILKEE API Docs](https://apidocs.milkee.ch/)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Report Issues](https://github.com/thwinter-ch/milkee-mcp/issues)

## Disclaimer

This is an **experimental project** provided "as is" without warranty of any kind. Use at your own risk. The author assumes no responsibility for any damages, data loss, or issues arising from the use of this software.

This is an unofficial community project and is not affiliated with, endorsed by, or supported by MILKEE AG.

## Disclosure

The author of this project ([Thomas Winter](https://github.com/thwinter-ch)) serves as an advisor to MILKEE.

## License

MIT
