# Changelog

All notable changes to this project will be documented in this file.

## [1.2.3] - 2025-01-20
- Restructured README for usability - lead with value, not setup
- Added table of contents with jump links
- Documented report types (Quick Summary vs Deep Financial Assessment)
- Added example output showing what each report produces
- Excluded test files from npm package

## [1.2.2] - 2025-01-20
- Removed .claude/ from repo (local config)
- Changed example company from Tafelwart to Blizzard Ventures
- Created separate CHANGELOG.md
- Added Claude Code CLI instructions for read-only mode

## [1.2.1] - 2025-01-20
- Fixed disclaimer wording (MILKEE GmbH, not AG)
- Simplified "independent community project" language

## [1.2.0] - 2025-01-20
- **Added:** `milkee_get_company_summary` - Get YOUR business overview (invoices, revenue, expenses, profit, cash position)
- **Fixed:** Response size optimization - list endpoints now return slim data (96% smaller responses)
- **Improved:** Tool descriptions to clarify company vs customer (your business vs people you bill)
- **Improved:** Documentation with testing section and example prompts

## [1.1.0] - 2025-01-20
- **Added:** Invoice tools (list, get, create, update, delete, mark paid, send)
- **Added:** Proposal tools (list, get, create, update, delete, convert to invoice, send)
- **Added:** Read-only mode (`MILKEE_READ_ONLY=true`) for safe analysis
- **Improved:** Tool descriptions with better accounting context

## [1.0.x] - 2025-01-19
- Initial release with customers, projects, time tracking, bookkeeping, products, tags, tasks
