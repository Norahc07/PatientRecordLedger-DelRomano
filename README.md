# Del Romano Clinic — Patient Record & Ledger

Digital patient records and financial ledger for the dental clinic. Built with **React (Vite)** and **Supabase**.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL Editor, run the script in `supabase-schema.sql` to create the tables: `patients`, `medical_alerts`, `tooth_status`, `ledger_entries`.

3. **Environment**
   - Copy `.env.example` to `.env`.
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project (Settings → API).

4. **Run the app**
   ```bash
   npm run dev
   ```
   Open the URL shown (e.g. http://localhost:5173).

## Features

- **Dashboard** — Card list of patients with search, medical alert badges, treatment counts, and balance (red = due, green = settled).
- **Add New Patient** — Form for name, age, occupation, contact, and chief complaint.
- **Patient overview** — Profile, medical alerts (add/remove), dental chart (odontogram), schedule summary, and treatment/financial ledger.
- **Odontogram** — Click a tooth to cycle status: normal → needs treatment → completed → missing.
- **Ledger** — Add debit (charge) or credit (payment: Cash/Check/Card); running balance and totals.

## Deploy to Vercel

1. **Push the repo to GitHub** (or GitLab/Bitbucket) and import the project in [Vercel](https://vercel.com).

2. **Configure the project**
   - Vercel will detect Vite and use `npm run build` and output `dist`. No extra config needed if you use `vercel.json` (included).

3. **Set environment variables** in Vercel (Project → Settings → Environment Variables):
   - `VITE_SUPABASE_URL` — your Supabase project URL (e.g. `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

   Add them for **Production**, **Preview**, and **Development** so all deployments work.

4. **Deploy**
   - Deploy from the Vercel dashboard or by pushing to your connected branch. Every push can trigger a new deployment.

5. **SPA routing**
   - `vercel.json` includes a rewrite so routes like `/patient/123` and `/patient/new` serve `index.html` and React Router works correctly.

## Tech stack

- React 18, Vite 6, React Router 6, Tailwind CSS, Supabase (PostgreSQL + JS client).


UI design prompt:

with a minimalist and user-friendly User interface or design. structure and consistent design elements with fonts, color, and structures.
