# MILKEE MCP Server - Schnellstart

Claude AI direkt mit deinem MILKEE-Konto verbinden.

---

## Was ist das?

Ein MCP Server, der Claude Zugriff auf deine MILKEE-Daten gibt. Du kannst Claude einfach fragen:

- "Wie läuft mein Business?"
- "Zeig mir alle offenen Rechnungen"
- "Erstelle eine Rechnung für Kunde X"
- "Welche Kunden schulden mir Geld?"

Claude holt sich die Daten direkt aus MILKEE und erstellt übersichtliche Reports.

---

## Einrichtung

### 1. API-Zugangsdaten holen

1. In [MILKEE](https://app.milkee.ch) einloggen
2. **Einstellungen > API** öffnen
3. Neuen API-Token generieren
4. **Firmen-ID** aus der URL notieren (z.B. `app.milkee.ch/companies/1234/...` → ID ist `1234`)

### 2. Claude Desktop konfigurieren

Config-Datei öffnen:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Folgendes zu `mcpServers` hinzufügen:

```json
{
  "mcpServers": {
    "milkee": {
      "command": "npx",
      "args": ["-y", "milkee-mcp@latest"],
      "env": {
        "MILKEE_API_TOKEN": "dein-api-token",
        "MILKEE_COMPANY_ID": "deine-firmen-id"
      }
    }
  }
}
```

Claude Desktop neu starten. Fertig!

### 3. Claude Code (CLI)

```bash
claude mcp add milkee -e MILKEE_API_TOKEN=dein-token -e MILKEE_COMPANY_ID=deine-id -- npx -y milkee-mcp@latest
```

---

## Beispiel-Prompts

### Geschäftsübersicht
| Frag Claude... | Du bekommst... |
|----------------|----------------|
| "Wie läuft mein Business?" | Gewinn, Umsatz, Ausgaben, Kontostand |
| "Gib mir eine komplette Finanzanalyse" | Detaillierte Analyse mit Trends und Top-Kunden |
| "Was ist mein Gewinn dieses Jahr?" | Einnahmen minus Ausgaben |

### Rechnungen
| Frag Claude... | Du bekommst... |
|----------------|----------------|
| "Zeig offene Rechnungen" | Liste unbezahlter Rechnungen |
| "Erstelle eine Rechnung für Müller AG für 10 Stunden à CHF 150" | Neue Rechnung in MILKEE |
| "Markiere Rechnung #2024001 als bezahlt" | Status wird aktualisiert |

### Offerten
| Frag Claude... | Du bekommst... |
|----------------|----------------|
| "Liste pendente Offerten" | Offene Offerten |
| "Wandle Offerte #250003 in Rechnung um" | Neue Rechnung aus Offerte |

### Analyse
| Frag Claude... | Du bekommst... |
|----------------|----------------|
| "Welche Kunden haben überfällige Rechnungen?" | Übersicht nach Kunde |
| "Zeig Umsatztrends nach Monat" | Monatliche Umsatzentwicklung |
| "Wer sind meine Top-10-Kunden?" | Kunden nach Umsatz sortiert |

---

## Nur-Lesen-Modus

Für reine Analyse ohne Änderungsrisiko, `MILKEE_READ_ONLY=true` hinzufügen:

```json
"env": {
  "MILKEE_API_TOKEN": "dein-token",
  "MILKEE_COMPANY_ID": "deine-id",
  "MILKEE_READ_ONLY": "true"
}
```

---

## Links

- [Vollständige Dokumentation (Englisch)](README.md)
- [MILKEE](https://milkee.ch)
- [GitHub Repository](https://github.com/thwinter-ch/milkee-mcp)

---

*Unabhängiges Community-Projekt, kein offizielles MILKEE GmbH Produkt.*
