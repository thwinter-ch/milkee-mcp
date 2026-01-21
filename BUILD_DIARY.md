# Build Diary: MILKEE MCP Server

How we built an MCP server for Swiss accounting software in about 8 hours, and what we learned along the way.

---

## The Key Insight

**An MCP is not just an API wrapper. It's an API + documentation that teaches the AI how to think about your domain.**

We call this "purpose engineering" - the tool descriptions aren't just documentation, they're prompts that guide how Claude understands and uses your tools.

Example: When we first built the MCP, Claude kept confusing "the company" (your business) with "customers" (people you bill). The fix wasn't code - it was rewriting the tool description:

```
Before: "Get customer statistics"
After:  "Get financial statistics for a SPECIFIC CUSTOMER (someone you bill).
        For YOUR BUSINESS overall stats, use milkee_get_company_summary instead."
```

This single change fixed the AI's understanding completely.

---

## Timeline

### Hour 1-2: Learning & Discovery

**Started with a broken MCP.** Tested in Claude Desktop - it failed badly. Claude treated MILKEE (accounting software) as a project management tool because:
1. The tool descriptions were generic
2. Core accounting endpoints (invoices, proposals) were missing
3. Response sizes were way too large

**Key discovery:** The official MILKEE API docs didn't list invoices/proposals endpoints, but they existed. Found them by testing the API directly:
```bash
curl -H "Authorization: Bearer $TOKEN" https://api.milkee.ch/v1/invoices
# → 21 invoices found!
```

### Hour 3-4: Building Core Features

Added the missing pieces:
- Invoice endpoints (list, get, create, update, delete, mark paid, send)
- Proposal endpoints (list, get, create, update, delete, convert to invoice, send)
- Company summary endpoint (aggregates invoices, entries, accounts into one overview)
- Read-only mode (`MILKEE_READ_ONLY=true` filters out all write operations)

### Hour 5-6: The Response Size Problem

First test in Claude Code:
```
Error: Response too large (227,568 characters)
```

The API returned everything - full customer objects nested in invoices, all metadata, timestamps, etc.

**Solution:** Slim the responses. Extract only essential fields for list views:
```typescript
// Before: Return full API response
return JSON.stringify(result);

// After: Extract essentials
const slimData = result.data?.map((inv: any) => ({
  id: inv.id,
  number: inv.number,
  title: inv.title,
  status: inv.status,
  final_value: inv.final_value,
  customer_name: inv.customer?.name,
}));
```

Result: 162KB → 6KB (96% reduction)

### Hour 7-8: Documentation & Polish

Iterated heavily on the README:
1. First version: Technical setup instructions first (wrong!)
2. Final version: Value proposition first, setup last

Structure that works:
1. What is this? (one line)
2. What can I do with it? (examples with expected output)
3. Legal stuff (get it out of the way)
4. Detailed features
5. Setup instructions
6. Reference material

Also added German quick start guide for Swiss users.

---

## Distribution: What We Learned

### npx with @latest

```json
"args": ["-y", "milkee-mcp@latest"]
```

The `@latest` tag is crucial - without it, npx caches the first version forever. With it, users automatically get updates.

### Windows Quirks

Windows needs `cmd /c` wrapper:
```json
"command": "cmd",
"args": ["/c", "npx", "-y", "milkee-mcp@latest"]
```

The Claude Code CLI had a bug parsing `/c` as `C:/` - had to manually fix the config.

### Read-Only Mode

Simple but powerful: Filter the tool list based on an environment variable.

```typescript
const isReadOnlyTool = (name: string): boolean => {
  return name.includes('_list_') || name.includes('_get_');
};

// In ListTools handler:
tools: READ_ONLY ? tools.filter(t => isReadOnlyTool(t.name)) : tools
```

Users get a safe analysis-only mode without maintaining two separate packages.

---

## What Makes a Good MCP

### 1. Domain-Aware Descriptions

Bad:
```
"List entries"
```

Good:
```
"List bookkeeping entries (Buchungen) - the core accounting ledger.
This contains all income, expenses, and transfer transactions."
```

### 2. Slim Responses

APIs return everything. AIs need essentials. Transform list responses to include only what's needed for decision-making.

### 3. Aggregate Endpoints

Instead of making Claude call 5 endpoints and synthesize data, create one endpoint that does it:

```typescript
case 'milkee_get_company_summary': {
  const [invoices, proposals, income, expenses, accounts] = await Promise.all([
    api.listInvoices({ per_page: 100 }),
    api.listProposals({ per_page: 100 }),
    api.listEntries({ 'filter[type]': 'income' }),
    api.listEntries({ 'filter[type]': 'expense' }),
    api.listAccounts({}),
  ]);
  // Aggregate and return summary
}
```

### 4. Clear Disambiguation

If two concepts could be confused (company vs customer, project vs task), make the descriptions explicitly differentiate them.

### 5. Include Valid Parameter Values

Don't make the AI guess:
```
Bad:  "include: relations to include"
Good: "include: comma-separated relations (customer, tags, tax_rate, credit_account, debit_account)"
```

---

## Tools Used

- **Claude Code (CLI)** - Primary development environment
- **Claude Opus 4** - Coding, debugging, documentation
- **npm** - Package distribution
- **GitHub** - Source code hosting

The entire project was built in conversation with Claude Code - from initial API exploration to final documentation polish.

---

## Time Breakdown

| Phase | Time | Notes |
|-------|------|-------|
| Learning MCP basics | 1h | Understanding the protocol, stdio transport |
| Discovering missing endpoints | 1h | Testing API, finding undocumented routes |
| Core implementation | 2h | Adding endpoints, types, handlers |
| Response optimization | 1h | Slimming responses, fixing size issues |
| Testing & debugging | 1.5h | Claude Desktop, Claude Code, iterations |
| Documentation | 1.5h | README iterations, German guide |
| **Total** | **~8h** | Spread across one day |

Actual focused coding time: ~3 hours. The rest was learning, testing, waiting for builds, and iterating on documentation.

---

## Version History Highlights

- **1.0.x** - Initial release (customers, projects, time tracking)
- **1.1.0** - Added invoices, proposals, read-only mode
- **1.2.0** - Company summary, response optimization
- **1.2.4** - Fixed API parameter issues discovered in testing
- **1.2.9** - Final README restructure
- **1.2.11** - German quick start guide

We published 12 versions in one day. Fast iteration beats perfect planning.

---

## Key Takeaways

1. **MCP = API + AI-readable documentation.** The descriptions are prompts.
2. **Test with real AI conversations**, not just unit tests.
3. **Slim your responses** - APIs are verbose, AIs need focused data.
4. **Create aggregate endpoints** for common questions.
5. **Iterate fast** - publish early, fix issues as you find them.
6. **Documentation matters** - users (and AIs) need to understand what they're getting.

---

*Built by Thomas Winter with Claude Code, January 2025*
