# Deboreka Tracker

A Next.js application for tracking Deboreka enhancements for Black Desert Online players (Deborians). Features weekly scoreboards, crown system, and admin dashboard.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Gmail
- 👤 **User Profiles** - Each user must provide their Black Desert family name
- 📊 **Weekly Scoreboards** - Track enhancements for 4 Deboreka parts (Necklace, Earring, Ring, Belt)
- 👑 **Crown System** - Automated weekly crown awarding every Sunday
- 🛡️ **Admin Dashboard** - Remove fake data entries
- 🔄 **Weekly Reset** - Scoreboards reset every Sunday at midnight UTC
- ⚡ **Real-Time Updates** - Triple-layer system (Custom Events + SSE + Polling)
  - Instant feedback for your own actions (< 50ms)
  - Real-time updates from other users (< 1 second)
  - Guaranteed refresh every 30-60 seconds
- 🌐 **Multi-Language** - English and Thai language support
- 🌓 **Dark Mode** - Light and dark theme switching
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
CRON_SECRET="generate-a-random-cron-secret"
```

Generate secrets:
```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For CRON_SECRET
openssl rand -hex 32
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

## Documentation

- 📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- 📖 **[CROWN_SYSTEM.md](./CROWN_SYSTEM.md)** - Crown awarding system details
- 📖 **[REALTIME_UPDATES.md](./REALTIME_UPDATES.md)** - SSE and polling implementation
- 📖 **[MIGRATION_NOTES.md](./MIGRATION_NOTES.md)** - Database migration notes

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── cron/         # Automated cron jobs
│   │   ├── admin/        # Admin endpoints
│   │   └── events/       # SSE endpoint
│   ├── auth/             # Authentication pages
│   ├── setup/            # Family name setup
│   └── page.tsx          # Main dashboard
├── components/           # React components
├── contexts/             # React contexts (Theme, Language)
├── hooks/                # Custom React hooks (SSE, Polling)
├── lib/                  # Utilities and configurations
├── database/             # Database schema and migrations
└── public/               # Static assets (images)
```

## Deboreka Parts & Prices

- **Necklace**: 1,000,000,000 silver (default)
- **Earring**: 800,000,000 silver (default)
- **Ring**: 600,000,000 silver (default)
- **Belt**: 900,000,000 silver (default)

Users can override these prices when adding enhancements.

## Weekly Reset & Crown System

- **Scoreboards** reset every Sunday at midnight UTC
- **Crowns** are automatically awarded via Vercel Cron Jobs
- Winners receive 1 crown per part they dominated that week
- Crown scoreboard shows all-time champions
- See [CROWN_SYSTEM.md](./CROWN_SYSTEM.md) for details

## Real-Time Updates

The app uses a triple-layer update system for the best user experience:

1. **Custom Browser Events** - Instant feedback for your own actions (< 50ms)
   - When you add an enhancement, you see it immediately
   - No waiting for server response or network delays
   
2. **Server-Sent Events (SSE)** - Real-time updates from other users (< 1 second)
   - See other players' enhancements appear in real-time
   - Multiplayer feel with minimal latency
   
3. **Polling** - Fallback for reliability (30-60 seconds)
   - Ensures data stays fresh even if SSE fails
   - Works in all network environments

**Result**: Perfect user experience with instant feedback and guaranteed data freshness.

See [REALTIME_UPDATES.md](./REALTIME_UPDATES.md) for technical details.

## License

MIT
