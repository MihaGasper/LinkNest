# LinkNest – Save & Tag Your Links
Simple app built with Next.js 14 and Supabase.

## ✨ Features
- Google OAuth via Supabase
- Save links with #tags
- View your list of links
- Admin dashboard with users + metrics

## 🛠 Setup

1. Clone repo & install deps
```bash
npm install
```

2. Create Supabase project, and add `links` table via `supabase.sql`

3. Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

4. Run locally:
```bash
npm run dev
```

5. Deploy on Vercel:
```bash
vercel --prod
```

## 📂 Pages

- `/` – Landing (Google sign in)
- `/dashboard` – Save & view your links
- `/admin` – Admin dashboard (change email manually)

## 🔒 Admin
To restrict access to `/admin`, change the email hardcoded in `app/admin/page.tsx`.

Enjoy!
