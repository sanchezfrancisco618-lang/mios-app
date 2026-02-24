# MIOS - Phase 2 (Backend & Persistence Integration)

MEP Intelligence Operating System (MIOS) Phase 2 implements a robust backend infrastructure ensuring that operational reality (Equipment records, Dates, Risks) is immutable once generated, and governed by business logic routines on the server.

## Major Advancements in Phase 2
- **Persistent Database (Prisma + SQLite)**: Replaced client-side static mocks with a local SQLite DB (`dev.db`). This readies the app for a Postgres migration.
- **Server-Side API Routes (Next.js)**: Created full RESTful `app/api/...` architecture including endpoints for `commit` flows, `procurement` patches, and automatic risk rule evaluation.
- **Extraction Workflow Pipeline**: Built a conceptual Extraction Run system where files map to `ExtractionRow` records (uncommitted state) that are formally merged, approved, and then committed into strictly validated `Equipment` objects. 
- **Zustand Connected Store**: The client-side UI global store now acts as a cache and action dispatcher using standard `fetch()` API calls against the backend, retaining the lightning-fast reactivity of Phase 1.
- **Server Rule Engine**: When lead times change, the server dynamically regenerates `requiredRelease` dates and revalidates records through a rules engine to automatically emit "Missed Release" risks.

## Tech Stack
- Frontend: Next.js (App Router), TailwindCSS, Zustand, RadixUI
- Backend: Next.js API Routes, Prisma ORM, Zod, SQLite
- Language: TypeScript

## How to Run Phase 2 Locally

1. Install dependencies (Prisma, Zod, etc. added in Phase 2):
   ```bash
   npm install
   ```
2. Initialize and migrate the SQLite database:
   ```bash
   npx prisma migrate dev --name init
   ```
   *(Wait for Prisma to generate the client and create `dev.db`)*
3. Start the Next.js standard dev environment:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000). The `InitStore` component will detect if no projects exist and automatically auto-seed the standard `P-1001` (Howard County Public School) project for immediate testing.

## Testing the AI AI Extraction API Pipeline
1. Navigate to `/ai-extraction`. Assuming standard conditions, click **Scan for Equipment Schedules**.
2. This creates an `ExtractionRun` in the DB and spawns fake PENDING rows.
3. High Risk rows flag locally in the table. Click **Approve** on some of them.
4. Click **Commit Approved**. This executes a `POST /equipment/commit` which maps pending rows into the canonical generic Equipment list while doing uniqueness checks on the Tags.
5. Head over to the Schedule/Procurement view to see the freshly baked immutable records and manage their lead times!
