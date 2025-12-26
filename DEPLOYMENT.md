# Deployment Guide

## Prerequisites

1. **Neon Database Account**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy your connection string (it will look like: `postgresql://user:password@host/database?sslmode=require`)

2. **Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - For local: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-domain.vercel.app/api/auth/callback/google`

## Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file:
   ```env
   DATABASE_URL="your-neon-connection-string"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-random-secret-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

   Generate a secret key:
   ```bash
   openssl rand -base64 32
   ```

3. **Run Database Migrations**
   ```bash
   npm run db:migrate
   ```
   
   Or manually:
   ```bash
   npx tsx database/migrate.ts
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Set Up Admin User**
   After logging in for the first time, set yourself as admin:
   ```sql
   UPDATE users SET "isAdmin" = true WHERE email = 'your-email@example.com';
   ```
   
   Or use Prisma Studio:
   ```bash
   npm run db:studio
   ```

## Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `DATABASE_URL` - Your Neon connection string
     - `NEXTAUTH_URL` - Your Vercel domain (e.g., `https://your-app.vercel.app`)
     - `NEXTAUTH_SECRET` - Same secret as local (generate with `openssl rand -base64 32`)
     - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
     - `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

3. **Update Google OAuth Redirect URI**
   - Go back to Google Cloud Console
   - Add your Vercel domain to authorized redirect URIs:
     `https://your-app.vercel.app/api/auth/callback/google`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically run migrations during build

5. **Set Up Admin User (Production)**
   After deployment, connect to your Neon database and run:
   ```sql
   UPDATE users SET "isAdmin" = true WHERE email = 'your-email@example.com';
   ```

## Database Migrations

- **Development**: `npm run db:migrate` or `npx tsx database/migrate.ts`
- **Production**: Run `npx tsx database/migrate.ts` manually after deployment
- The migration script is idempotent and safe to run multiple times

## Troubleshooting

### Database Connection Issues
- Ensure your Neon connection string includes `?sslmode=require`
- Check that your Neon database is active (not paused)

### Authentication Issues
- Verify `NEXTAUTH_URL` matches your actual domain
- Check that Google OAuth redirect URI is correct
- Ensure `NEXTAUTH_SECRET` is set

### Build Failures
- Check that all environment variables are set in Vercel
- Verify Prisma migrations are up to date
- Check Vercel build logs for specific errors

