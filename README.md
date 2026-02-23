# Media Tracker

Media Tracker is a Nuxt 4 app for tracking movies, series, anime, and manga.
It includes authentication, profile management, notes, import tools, and a PHP + MySQL backend API.

## Features

- Track content by category: movies, series, anime, manga
- Authentication: register, login, logout
- Profile page: update username, email, and password (requires current password)
- Personal notes for each media item
- Import support:
  - AniList import (anime/manga)
  - IMDb CSV import (movies/series)
- Multilingual UI: Turkish and English (`@nuxtjs/i18n`)
- Responsive UI with Nuxt UI + TailwindCSS

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript, Nuxt UI, TailwindCSS
- **Backend API**: PHP (shared hosting friendly)
- **Database**: MySQL (managed via phpMyAdmin)
- **Deployment**: GitHub Actions + FTP Deploy Action

## Project Structure

- `app/` - Nuxt app (pages, components, composables, middleware)
- `public/api/` - PHP API endpoints
- `i18n/locales/` - Translation files (`tr.json`, `en.json`)
- `database.sql` - SQL schema for MySQL
- `.github/workflows/deploy.yml` - Build and deploy workflow

## Local Development

### 1) Install dependencies

```bash
pnpm install
```

### 2) Create `.env`

Create a `.env` file in project root:

```env
NUXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key_here
```

### 3) Run dev server

```bash
pnpm dev
```

App runs at `http://localhost:3000`.

## Database Setup (phpMyAdmin)

1. Open phpMyAdmin
2. Create/select your database
3. Run the SQL in `database.sql`

If your `media_items` table was created before notes support, run:

```sql
ALTER TABLE media_items ADD COLUMN notes TEXT AFTER genre;
```

## API Configuration (Production)

`public/api/config.php` is generated in CI from GitHub Secrets.
Do not commit `config.php`.

Required secrets:

- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `JWT_SECRET`
- `OMDB_API_KEY`
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_PATH`

## Deploy

On push to `main`, GitHub Actions:

1. Installs dependencies
2. Generates `public/api/config.php` from secrets
3. Builds static output via `pnpm generate`
4. Deploys `.output/public/` to your hosting via FTP

## Auth Flow

- Frontend stores JWT token in localStorage
- Protected API endpoints use `Authorization: Bearer <token>`
- Profile updates require current password verification

## i18n

- Locales are in `i18n/locales/`
- Default locale: `tr`
- Toggle between `TR` and `EN` in public pages/profile

## Scripts

- `pnpm dev` - Start development server
- `pnpm generate` - Generate static output
- `pnpm build` - Build app
- `pnpm preview` - Preview production build

## Notes

- Never commit real API keys or DB credentials.
- Keep secrets in GitHub Actions secrets for production.
- `.env.example` is only a template for local setup.
