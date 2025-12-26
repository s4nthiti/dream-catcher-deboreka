# Deboreka Tracker

A Next.js application for tracking Deboreka enhancements for Black Desert Online players (Deborians). Features weekly scoreboards, crown system, and admin dashboard.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Gmail
- 👤 **User Profiles** - Each user must provide their Black Desert family name
- 📊 **Weekly Scoreboards** - Track enhancements for 4 Deboreka parts (Necklace, Earring, Ring, Belt)
- 👑 **Crown System** - Winners of each part get crowns
- 🛡️ **Admin Dashboard** - Remove fake data entries
- 🔄 **Weekly Reset** - Scoreboards reset every Sunday
- 💾 **Neon Database** - PostgreSQL database hosted on Neon

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **NextAuth v5** - Authentication
- **Neon Serverless** - Direct PostgreSQL database connection
- **Tailwind CSS** - Styling
- **Vercel** - Deployment platform

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Database

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Copy your connection string

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your-neon-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### 5. Run Database Migrations

```bash
npm run db:migrate
```

Or manually:
```bash
npx tsx database/migrate.ts
```

### 6. Set Up Admin User

After creating your first user, manually set `isAdmin` to `true` in the database:

```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel domain)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Update Google OAuth redirect URI to: `https://your-domain.vercel.app/api/auth/callback/google`
5. Deploy!

### 3. Run Migrations on Production

After deployment, run migrations manually:

```bash
npx tsx database/migrate.ts
```

Or set up a migration script in your deployment pipeline.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── setup/            # Family name setup
│   └── page.tsx          # Main dashboard
├── components/           # React components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema
└── public/               # Static assets
```

## Deboreka Parts & Prices

- **Necklace**: 1,000,000,000 silver (default)
- **Earring**: 800,000,000 silver (default)
- **Ring**: 600,000,000 silver (default)
- **Belt**: 900,000,000 silver (default)

Users can override these prices when adding enhancements.

## Weekly Reset

Scoreboards automatically reset every Sunday at midnight. The system tracks enhancements by week start date (Sunday).

## License

MIT
