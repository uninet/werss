# AI Tracker Vercel Deployment Guide

## Prerequisites

1. **PostgreSQL Database** (Supabase recommended)
   - Sign up at [Supabase](https://supabase.com)
   - Create a new project
   - Get your DATABASE_URL from Project Settings > Database
   - Format: `postgresql://user:password@host:port/database`

2. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`
   - Login: `vercel login`

3. **Environment Variables**
   - `DATABASE_URL` - PostgreSQL connection string (REQUIRED)
   - `JWT_SECRET` - JWT signing key (REQUIRED, generate random string)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_TO` - Email config (optional)
   - `GITHUB_TOKEN` - GitHub API token (optional)

## Deployment Steps

### 1. Set Up Environment Variables Locally

Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

Edit and fill in:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-random-min-32-characters
```

### 2. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 3. Push Database Schema (Optional)

If using a real database connection:

```bash
cd backend
npx prisma db push
```

Or apply migrations on Vercel after deployment (see step 7).

### 4. Test Build Locally

```bash
npm run build
```

This should:
1. Install backend dependencies
2. Build backend TypeScript
3. Generate Prisma client
4. Install frontend dependencies
5. Build frontend with Vite

Expected output:
```
frontend/dist/index.html
frontend/dist/assets/*.js
frontend/dist/assets/*.css
```

### 5. Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
vercel --prod
```

**Option B: Using GitHub Integration**

1. Push code to GitHub
2. Go to Vercel dashboard
3. Import repository
4. Configure settings (see below)

### 6. Configure Vercel Project

In Vercel dashboard:

**Environment Variables** (Settings > Environment Variables):
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-random-string
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_TO=recipient@example.com
```

**Build & Development Settings**:
- Framework Preset: Vite
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `frontend/dist`
- Install Command: `npm install`

### 7. Run Database Migrations on Vercel

After deployment, apply database schema:

**Using Vercel CLI:**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Or run in Supabase SQL Editor:**
1. Copy contents of `backend/prisma/migrations/20260104100000_init/migration.sql`
2. Paste in Supabase SQL Editor
3. Click Run

### 8. Verify Deployment

1. Check deployment logs in Vercel dashboard
2. Access health check: `https://your-app.vercel.app/health`
3. Test API endpoint: `https://your-app.vercel.app/api/bloggers`
4. Open frontend: `https://your-app.vercel.app`

## Project Structure

```
werss/
├── api/index.ts           # Vercel function entry point
├── backend/
│   ├── dist/             # Compiled backend (build output)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/  # Database migrations
│   └── src/             # Backend source code
├── frontend/
│   ├── dist/             # Built frontend (Vercel serves this)
│   └── src/             # Frontend source code
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## Troubleshooting

### Build Fails

**Error: `Cannot find module`**
- Ensure all dependencies are installed: `npm install`
- Check backend build completed before frontend

**Error: Prisma client not generated**
- Run: `cd backend && npx prisma generate`

**Error: Database connection failed**
- Verify DATABASE_URL format
- Check database is accessible
- Ensure database user has proper permissions

### Deployment Fails

**Error: Function execution timeout**
- Increase `maxDuration` in `vercel.json`:
```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 60
    }
  }
}
```

**Error: API routes return 404**
- Check vercel.json rewrites are correct
- Verify API function location at `api/index.ts`

**Error: CORS errors**
- Backend already configured for CORS
- Check if frontend is making requests to correct origin

### Database Issues

**Error: `Relation does not exist`**
- Run migrations on your database
- Check migration files in `backend/prisma/migrations/`

**Error: Connection pool exhausted**
- Prisma singleton pattern is implemented in `backend/src/models/prisma.ts`
- This prevents multiple Prisma Client instances

### Frontend Issues

**Error: API calls fail**
- Check browser console for errors
- Verify VITE_API_BASE_URL is `/api`
- Check vercel.json API rewrites

## Environment Variable Reference

| Variable | Required | Description | Example |
|-----------|-----------|-------------|----------|
| `DATABASE_URL` | ✅ | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | ✅ | JWT signing key | Random 32+ characters |
| `NODE_ENV` | ❌ | Environment | `production` (auto-set by Vercel) |
| `VERCEL` | ❌ | Vercel flag | `1` (auto-set by Vercel) |
| `SMTP_HOST` | ❌ | Email server | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ | Email port | `587` |
| `SMTP_USER` | ❌ | Email username | `user@gmail.com` |
| `SMTP_PASS` | ❌ | Email password | `app-password` |
| `EMAIL_TO` | ❌ | Default recipient | `admin@example.com` |
| `GITHUB_TOKEN` | ❌ | GitHub API token | `ghp_xxxxxxxxxxxx` |

## Vercel-Specific Features Used

### Serverless Functions
- Backend Express app wrapped with `serverless-http`
- Entry point: `api/index.ts`
- Timeout: 30 seconds (configurable)

### Rewrites
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/index.html"
    }
  ]
}
```

This routes:
- `/api/*` requests to backend function
- All other requests to frontend SPA

### Build Process
```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "frontend/dist"
}
```

Custom build script:
```bash
npm run vercel-build
# → cd backend && npm ci && npm run build && cd .. && npm run build
```

## Performance Optimization

### Prisma
- Singleton pattern prevents connection pool exhaustion
- Logging set to `['error', 'warn']` for production
- Connection pooling handled by Prisma

### Frontend
- Vite production build with code splitting
- CSS extracted to separate file
- Gzip compression enabled by Vercel

### API
- Rate limiting configured (100 requests/15min in production)
- CORS properly configured
- Error handling middleware in place

## Monitoring

### Vercel Dashboard
- Deployment logs
- Function execution logs
- Error tracking
- Performance metrics

### Database (Supabase)
- Query logs
- Performance metrics
- Connection pool status

### Application
- Health check: `/health`
- API endpoints return consistent response format
- Winston logging configured in backend

## Next Steps

1. ✅ Set up PostgreSQL database (Supabase recommended)
2. ✅ Configure environment variables
3. ✅ Test local build: `npm run build`
4. ✅ Deploy to Vercel
5. ✅ Apply database migrations
6. ✅ Test deployed application
7. ✅ Monitor for issues using Vercel dashboard

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express Documentation](https://expressjs.com/)
