# Square Outdoor - Modulares Möbel-ERP

ERP-System für ein modulares Möbelsystem mit Kauf- und Mietoption.

## Architektur

**3-stufiger Artikelstamm:**
- **Systeme** (Stufe 1): Gesamtsysteme wie "Square Outdoor School I"
- **Artikel** (Stufe 2): Einzelne Module wie "4er-Bank tief" mit Varianten (Fichte/Lärche)
- **Komponenten** (Stufe 3): Einzelteile wie Siebdruckplatten, Latten, Schrauben

**ERP-Module:**
- Kundenverwaltung (Privat/Geschäft)
- Aufträge & Verträge (Kauf/Miete)
- Lagerverwaltung (Bestand, Bewegungen)
- Finanzen (Rechnungen, Zahlungen, MwSt.)

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Datenbank:** Supabase (PostgreSQL)

## Setup

### 1. Supabase einrichten
1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Kopiere `.env.example` zu `.env` und trage URL + Keys ein
3. Führe die SQL-Migrationen im Supabase SQL-Editor aus:
   - `backend/migrations/001_initial_schema.sql` (Schema)
   - `backend/migrations/002_seed_data.sql` (Artikelstamm-Daten)

### 2. Backend starten
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend starten
```bash
cd frontend
npm install
npm run dev
```

Die App läuft dann auf http://localhost:5173

## Datenbank-Schema

Das Schema befindet sich in `backend/migrations/001_initial_schema.sql` und enthält:
- Tabellen für alle 3 Stufen + Stücklisten (BOM)
- Kunden, Aufträge, Mietverträge
- Lager, Inventar, Lagerbewegungen
- Rechnungen, Positionen, Zahlungen
- Views, Indizes und Trigger

## Seed-Daten

`002_seed_data.sql` enthält alle Daten aus dem Excel-Artikelstamm:
- 5 Systeme
- 85 Artikel (mit Varianten)
- 171 Komponenten
- 47 System-Artikel-Zuordnungen
- 636 Artikel-Komponenten-Zuordnungen
