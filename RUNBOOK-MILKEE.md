# Runbook: Milkee Accounting Integration for OpenClaw

*How to set up an AI assistant that actively works with Milkee — invoices, receipts, financial reviews, and more.*

---

## What This Enables

An AI assistant (via OpenClaw) that can:
- Read invoices, expenses, customers, and proposals from Milkee
- Create bookkeeping entries from receipts (photo → entry + attached file)
- Run weekly and monthly financial reviews proactively
- Never delete records or send invoices without explicit user confirmation

---

## 1. Infrastructure

### MCP Server: `milkee-mcp`

The integration uses `milkee-mcp`, a Node.js MCP server that wraps the Milkee API.

Install it globally:
```bash
npm install -g milkee-mcp
```

Required environment variables:
- `MILKEE_API_TOKEN` — from Milkee account settings (API key)
- `MILKEE_COMPANY_ID` — your company ID in Milkee (visible in the URL or via API)

### mcporter config (`~/.mcporter/mcporter.json`)

Register the server so OpenClaw can call it:

```json
{
  "mcpServers": {
    "milkee": {
      "command": "milkee-mcp",
      "args": [],
      "description": "Milkee accounting for [Your Company]",
      "env": {
        "MILKEE_API_TOKEN": "YOUR_TOKEN_HERE",
        "MILKEE_COMPANY_ID": "YOUR_COMPANY_ID_HERE"
      }
    }
  }
}
```

> ⚠️ Store the API token in a password manager (e.g. 1Password), not hardcoded in a shared file.

---

## 2. OpenClaw Config

No special OpenClaw config changes are needed beyond having mcporter set up. MCP tools become available to the agent automatically once the server is registered.

---

## 3. Available Tools

The `milkee-mcp` server exposes these tools (all prefixed `milkee_`):

| Tool | Purpose |
|------|---------|
| `milkee_get_company_summary` | Overview: revenue, expenses, open invoices |
| `milkee_list_invoices` | List invoices with filters (status, date range) |
| `milkee_list_entries` | List bookkeeping entries |
| `milkee_list_customers` | List customers/clients |
| `milkee_list_proposals` | List quotes/proposals |
| `milkee_create_entry` | Create a bookkeeping entry |
| `milkee_create_entry_with_file` | Create entry AND attach receipt in one call |
| `milkee_upload_entry_file` | Attach a file to an existing entry |

> **Version note:** `milkee_create_entry_with_file` and `milkee_upload_entry_file` were added in v1.2.14. Make sure you're on that version or later.

---

## 4. Agent Instructions (The Important Part)

The MCP server gives you API access. What makes it *actually useful* is the instruction layer — the workspace files that tell the agent what to do, what not to do, and how to behave.

### TOOLS.md — Tool Reference Snippet

Add this to the agent's `TOOLS.md`:

```markdown
## Milkee — Accounting

Access accounting via MCP tools (server: milkee). All tools prefixed milkee_.

Key tools: milkee_get_company_summary, milkee_list_invoices, milkee_list_entries,
milkee_create_entry, milkee_create_entry_with_file, milkee_list_customers, milkee_list_proposals.

File/Receipt tools (v1.2.14+):
- milkee_create_entry_with_file — create entry + attach receipt in one step (preferred)
- milkee_upload_entry_file — attach file to an existing entry

See OPS.md for guardrails — NEVER delete records, NEVER send invoices without confirmation.
```

### OPS.md — Guardrails and Playbook

This is where the business logic lives. At minimum, include:

**Accounting guardrails (non-negotiable):**
```markdown
### Milkee Guardrails

- NEVER delete any record — no entries, invoices, proposals, customers. Ever.
- NEVER send an invoice or proposal without explicit user confirmation.
  Create as draft → show summary → wait for OK.
- NEVER mark an invoice as paid without confirming payment was received.
- Always show before creating — when processing a receipt, show the user
  what you're about to enter (amount, account, description) before calling create.
```

**Receipt processing workflow:**
```markdown
### Receipt Processing

User sends a photo → agent reads it (vision model required) →
extracts: vendor, date, amount, category → shows user for confirmation →
calls milkee_create_entry_with_file (attaches original image).
```

**Weekly financial review:**
```markdown
### Weekly Financial Review

- Open and overdue invoices
- Unpaid clients
- Outstanding quotes
- Flag anything unpaid for more than 30 days
```

**Monthly financial review:**
```markdown
### Monthly Financial Review (1st of month)

Prepare a report covering:
- Revenue this month vs last month
- Open and overdue amounts
- Expenses breakdown
- Top clients by revenue
- Pricing observations
```

---

## 5. Model Requirements

- **Vision capability required** for receipt processing (reading photos of receipts)
- Claude Sonnet or equivalent — needs to understand document images reliably
- Smaller/cheaper models (e.g. Gemini Flash) are fine for read-only queries like invoice lookups and financial reviews

---

## 6. The 80/20 Rule of This Integration

| Layer | Where it lives | What it does |
|-------|---------------|-------------|
| API access | mcporter config | Connects agent to Milkee |
| Tool documentation | TOOLS.md | Agent knows what tools exist |
| Business rules | OPS.md | Agent knows what it's allowed to do |
| User context | USER.md | Agent knows who it's serving, their language, preferences |
| Proactive behavior | HEARTBEAT.md / cron | Reviews happen automatically |
| Institutional knowledge | MEMORY.md | Learned quirks, preferred accounts, past decisions |

**The MCP server is ~20% of what makes this work. The other 80% is the instruction layer.**

Someone could install the MCP server in 5 minutes and get raw API access. The useful, trustworthy behaviour — knowing when to ask, when not to act, how to communicate results — comes from the workspace files.

---

## 7. Cron Jobs for Proactive Reviews

Set up cron jobs so reviews happen automatically, without the user having to ask.

**Weekly review (example: Sunday evening, before weekly planning):**
```json
{
  "name": "weekly-financial-review",
  "schedule": { "kind": "cron", "expr": "30 18 * * 0", "tz": "Europe/Zurich" },
  "payload": {
    "kind": "agentTurn",
    "message": "Run the weekly Milkee financial review. Check open invoices, overdue amounts, outstanding quotes. Send a concise summary to the user."
  },
  "sessionTarget": "isolated"
}
```

**Monthly review (1st Sunday of the month, midday):**
```json
{
  "name": "monthly-financial-review",
  "schedule": { "kind": "cron", "expr": "0 12 1-7 * 0", "tz": "Europe/Zurich" },
  "payload": {
    "kind": "agentTurn",
    "message": "Run the monthly Milkee financial review. Prepare a full report: revenue vs last month, expenses, open/overdue amounts, top clients, pricing observations. Send to the user."
  },
  "sessionTarget": "isolated"
}
```

Adjust timezone and schedule to match your user's context.

---

## 8. Deployment Checklist

- [ ] `milkee-mcp` installed globally (`npm install -g milkee-mcp`)
- [ ] API token and company ID obtained from Milkee account settings
- [ ] Credentials added to mcporter config (`~/.mcporter/mcporter.json`)
- [ ] (Recommended) Token stored in a password manager; retrieved at runtime
- [ ] TOOLS.md updated with tool list and notes
- [ ] OPS.md written with guardrails, workflows, and business rules
- [ ] USER.md describes who is being served (language, preferences, communication style)
- [ ] Model with vision capability configured (for receipt processing)
- [ ] Cron jobs set up for weekly/monthly reviews
- [ ] **Test:** send a receipt photo → confirm entry + attachment appear in Milkee
- [ ] **Test:** ask for open invoices → verify output matches Milkee dashboard

---

*Built with `milkee-mcp`. MCP server version, tool names, and config format may evolve — check the changelog.*
