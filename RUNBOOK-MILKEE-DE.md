# Runbook: Milkee-Integration für OpenClaw

*So richtest du einen KI-Assistenten ein, der aktiv mit Milkee arbeitet — Rechnungen, Belege, Finanzauswertungen und mehr.*

---

## Was das ermöglicht

Ein KI-Assistent (via OpenClaw), der:
- Rechnungen, Ausgaben, Kunden und Offerten aus Milkee lesen kann
- Buchungseinträge aus Belegen erstellt (Foto → Eintrag + angehängtes Bild)
- Wöchentliche und monatliche Finanzauswertungen proaktiv durchführt
- Niemals Datensätze löscht oder Rechnungen sendet, ohne explizite Bestätigung des Nutzers

---

## 1. Infrastruktur

### MCP-Server: `milkee-mcp`

Die Integration nutzt `milkee-mcp`, einen Node.js-MCP-Server, der die Milkee-API kapselt.

Global installieren:
```bash
npm install -g milkee-mcp
```

Erforderliche Umgebungsvariablen:
- `MILKEE_API_TOKEN` — aus den Milkee-Kontoeinstellungen (API-Schlüssel)
- `MILKEE_COMPANY_ID` — deine Unternehmens-ID in Milkee (in der URL oder per API sichtbar)

### mcporter-Konfiguration (`~/.mcporter/mcporter.json`)

Server registrieren, damit OpenClaw ihn aufrufen kann:

```json
{
  "mcpServers": {
    "milkee": {
      "command": "milkee-mcp",
      "args": [],
      "description": "Milkee Buchhaltung für [Dein Unternehmen]",
      "env": {
        "MILKEE_API_TOKEN": "DEIN_TOKEN_HIER",
        "MILKEE_COMPANY_ID": "DEINE_COMPANY_ID_HIER"
      }
    }
  }
}
```

> ⚠️ Den API-Token in einem Passwort-Manager (z.B. 1Password) speichern, nicht direkt in der Konfigurationsdatei.

---

## 2. OpenClaw-Konfiguration

Es sind keine speziellen OpenClaw-Konfigurationsänderungen erforderlich, solange mcporter eingerichtet ist. Die MCP-Tools stehen dem Agenten automatisch zur Verfügung, sobald der Server registriert ist.

---

## 3. Verfügbare Tools

Der `milkee-mcp`-Server stellt folgende Tools bereit (alle mit Präfix `milkee_`):

| Tool | Zweck |
|------|-------|
| `milkee_get_company_summary` | Übersicht: Umsatz, Ausgaben, offene Rechnungen |
| `milkee_list_invoices` | Rechnungen auflisten (mit Filtern: Status, Zeitraum) |
| `milkee_list_entries` | Buchungseinträge auflisten |
| `milkee_list_customers` | Kunden auflisten |
| `milkee_list_proposals` | Offerten auflisten |
| `milkee_create_entry` | Buchungseintrag erstellen |
| `milkee_create_entry_with_file` | Eintrag erstellen UND Beleg in einem Schritt anhängen |
| `milkee_upload_entry_file` | Datei an bestehenden Eintrag anhängen |

> **Versionshinweis:** `milkee_create_entry_with_file` und `milkee_upload_entry_file` wurden in v1.2.14 hinzugefügt. Sicherstellen, dass diese Version oder neuer verwendet wird.

---

## 4. Agenten-Instruktionen (Der wichtige Teil)

Der MCP-Server liefert den API-Zugang. Was die Integration *wirklich nützlich* macht, ist die Instruktionsebene — die Workspace-Dateien, die dem Agenten sagen, was er tun soll, was nicht, und wie er sich verhalten soll.

### TOOLS.md — Tool-Referenz (Ausschnitt)

In die `TOOLS.md` des Agenten einfügen:

```markdown
## Milkee — Buchhaltung

Zugriff auf die Buchhaltung via MCP-Tools (Server: milkee). Alle Tools mit Präfix milkee_.

Wichtige Tools: milkee_get_company_summary, milkee_list_invoices, milkee_list_entries,
milkee_create_entry, milkee_create_entry_with_file, milkee_list_customers, milkee_list_proposals.

Datei/Beleg-Tools (ab v1.2.14):
- milkee_create_entry_with_file — Eintrag erstellen + Beleg in einem Schritt anhängen (bevorzugt)
- milkee_upload_entry_file — Datei an bestehenden Eintrag anhängen

Leitplanken in OPS.md — NIEMALS Datensätze löschen, NIEMALS Rechnungen ohne Bestätigung senden.
```

### OPS.md — Leitplanken und Playbook

Hier lebt die Geschäftslogik. Mindestens enthalten sein müssen:

**Buchhaltungs-Leitplanken (nicht verhandelbar):**
```markdown
### Milkee-Leitplanken

- NIEMALS einen Datensatz löschen — keine Einträge, Rechnungen, Offerten, Kunden. Nie.
- NIEMALS eine Rechnung oder Offerte senden ohne explizite Bestätigung des Nutzers.
  Als Entwurf erstellen → Zusammenfassung zeigen → auf OK warten.
- NIEMALS eine Rechnung als bezahlt markieren, ohne dass der Nutzer den Zahlungseingang bestätigt hat.
- Immer zuerst zeigen, dann erstellen — beim Verarbeiten eines Belegs dem Nutzer anzeigen,
  was eingetragen wird (Betrag, Konto, Beschreibung), bevor create aufgerufen wird.
```

**Belegverarbeitung:**
```markdown
### Belegverarbeitung

Nutzer sendet ein Foto → Agent liest es (Vision-Modell erforderlich) →
extrahiert: Lieferant, Datum, Betrag, Kategorie → zeigt dem Nutzer zur Bestätigung →
ruft milkee_create_entry_with_file auf (hängt Originalbild an).
```

**Wöchentliche Finanzauswertung:**
```markdown
### Wöchentliche Finanzauswertung

- Offene und überfällige Rechnungen
- Nicht zahlende Kunden
- Ausstehende Offerten
- Alles kennzeichnen, was seit mehr als 30 Tagen unbezahlt ist
```

**Monatliche Finanzauswertung:**
```markdown
### Monatliche Finanzauswertung (1. des Monats)

Bericht erstellen mit:
- Umsatz diesen Monat vs. letzten Monat
- Offene und überfällige Beträge
- Ausgaben-Aufschlüsselung
- Top-Kunden nach Umsatz
- Preisbeobachtungen
```

---

## 5. Modellanforderungen

- **Vision-Fähigkeit erforderlich** für die Belegverarbeitung (Fotos lesen)
- Claude Sonnet oder gleichwertig — muss Dokumentenbilder zuverlässig verstehen
- Kleinere/günstigere Modelle (z.B. Gemini Flash) sind für reine Leseabfragen geeignet (Rechnungsabruf, Finanzauswertungen)

---

## 6. Die 80/20-Regel dieser Integration

| Ebene | Wo sie lebt | Was sie tut |
|-------|-------------|-------------|
| API-Zugang | mcporter-Konfiguration | Verbindet Agenten mit Milkee |
| Tool-Dokumentation | TOOLS.md | Agent weiss, welche Tools existieren |
| Geschäftsregeln | OPS.md | Agent weiss, was er darf und was nicht |
| Nutzerkontext | USER.md | Agent weiss, wen er bedient, Sprache, Präferenzen |
| Proaktives Verhalten | HEARTBEAT.md / Cron | Auswertungen laufen automatisch |
| Institutionelles Wissen | MEMORY.md | Gelernte Eigenheiten, bevorzugte Konten, vergangene Entscheidungen |

**Der MCP-Server ist ca. 20% dessen, was die Integration funktionieren lässt. Die anderen 80% sind die Instruktionsebene.**

Den MCP-Server in 5 Minuten installieren und rohen API-Zugang haben — das ist einfach. Das nützliche, zuverlässige Verhalten — wann nachfragen, wann nicht handeln, wie Ergebnisse kommunizieren — kommt aus den Workspace-Dateien.

---

## 7. Cron-Jobs für proaktive Auswertungen

Cron-Jobs einrichten, damit Auswertungen automatisch ablaufen — ohne dass der Nutzer jedes Mal fragen muss.

**Wöchentliche Auswertung (Beispiel: Sonntagabend, vor der Wochenplanung):**
```json
{
  "name": "weekly-financial-review",
  "schedule": { "kind": "cron", "expr": "30 18 * * 0", "tz": "Europe/Zurich" },
  "payload": {
    "kind": "agentTurn",
    "message": "Wöchentliche Milkee-Finanzauswertung durchführen. Offene Rechnungen, überfällige Beträge, ausstehende Offerten prüfen. Kurze Zusammenfassung an den Nutzer senden."
  },
  "sessionTarget": "isolated"
}
```

**Monatliche Auswertung (1. Sonntag des Monats, Mittag):**
```json
{
  "name": "monthly-financial-review",
  "schedule": { "kind": "cron", "expr": "0 12 1-7 * 0", "tz": "Europe/Zurich" },
  "payload": {
    "kind": "agentTurn",
    "message": "Monatliche Milkee-Finanzauswertung durchführen. Vollständigen Bericht erstellen: Umsatz vs. Vormonat, Ausgaben, offene/überfällige Beträge, Top-Kunden, Preisbeobachtungen. An Nutzer senden."
  },
  "sessionTarget": "isolated"
}
```

Zeitzone und Zeitplan an den jeweiligen Kontext anpassen.

---

## 8. Deployment-Checkliste

- [ ] `milkee-mcp` global installiert (`npm install -g milkee-mcp`)
- [ ] API-Token und Company-ID aus den Milkee-Kontoeinstellungen
- [ ] Zugangsdaten in mcporter-Konfiguration eingetragen (`~/.mcporter/mcporter.json`)
- [ ] (Empfohlen) Token in Passwort-Manager gespeichert, zur Laufzeit abgerufen
- [ ] TOOLS.md mit Tool-Liste und Hinweisen ergänzt
- [ ] OPS.md mit Leitplanken, Workflows und Geschäftsregeln geschrieben
- [ ] USER.md beschreibt, wer bedient wird (Sprache, Präferenzen, Kommunikationsstil)
- [ ] Modell mit Vision-Fähigkeit konfiguriert (für Belegverarbeitung)
- [ ] Cron-Jobs für wöchentliche/monatliche Auswertungen eingerichtet
- [ ] **Test:** Belegfoto senden → Eintrag + Anhang erscheinen in Milkee
- [ ] **Test:** Offene Rechnungen abfragen → Ausgabe stimmt mit Milkee-Dashboard überein

---

*Entwickelt mit `milkee-mcp`. MCP-Server-Version, Tool-Namen und Konfigurationsformat können sich weiterentwickeln — Changelog beachten.*
