# Demsew Andarge — Video Editor & Motion Storyteller

A cinematic, mobile-first portfolio and content management workspace for Demsew Andarge. Public portfolio content and contact inquiries use an ASP.NET Core API backed by PostgreSQL; the Next.js app serves the website and securely proxies admin requests.

## Project structure

```text
backend/
  DemsewPortfolio.Api/
    Controllers/       REST API controllers
    Data/Migrations/   EF Core schema and migrations
    Dtos/              Request and response data transfer objects
    Entities/          EF Core and Identity entities
    Interfaces/        Storage and token service abstractions
    Services/          Auth, file storage, and API infrastructure
    Validators/        FluentValidation request validators
frontend/
  src/app/             App Router pages and route handlers
  src/components/      Public website and admin interface components
  src/lib/             API data, schemas, and shared helpers
```

The API project and all backend source files live under `backend`. PostgreSQL is the default database. The website/admin listens on port **6230**, and the API listens on port **6231**; PostgreSQL listens on its normal port **5432**. Docker is not required.

## Local setup

### Requirements

- .NET 10 SDK
- PostgreSQL 15 or newer
- Node.js 20.9 or newer and npm

### 1. Start the API

Create a PostgreSQL database named `demsew_portfolio` and configure the backend environment. ASP.NET Core does not load `.env` files automatically; use your terminal, IDE launch profile, or deployment host to set these variables. From PowerShell at the repository root:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://localhost:6231"
$env:Database__Provider = "PostgreSQL"
$env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=demsew_portfolio;Username=postgres;Password=YOUR_LOCAL_PASSWORD"
$env:Jwt__Secret = "replace-with-a-random-secret-at-least-32-bytes-long"
$env:Admin__Email = "you@example.com"
$env:Admin__Password = "replace-with-a-unique-strong-password"
$env:RequireAdminCredentials = "true"
$env:Frontend__Origin = "http://localhost:6230"
dotnet run --project backend\DemsewPortfolio.Api
```

On startup the API applies pending EF Core migrations and seeds the administrator account and replaceable sample portfolio content. Keep the generated admin password and JWT secret private. API documentation is available in Development at `http://localhost:6231/scalar/v1`.

See [backend/README.md](./backend/README.md) for SQLite configuration, migrations, API endpoints, uploads, and API deployment.

### 2. Start the frontend

In a second terminal:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
Set-Location frontend
npm install
npm run dev
```

Open `http://localhost:6230`. The public site is at `/`; administrator sign-in is at `/admin/login`. The environment example sets the API URL to port 6231 and the site origin to port 6230.

If the API is unavailable, public pages remain viewable with sample preview content and the API issue is logged by Next.js. Contact form submissions require the API and database to be available.

## Website and admin features

- **Public:** Home/showreel, selected work with category filters and project details, about, services and quote CTA, contact form, privacy page, custom not-found page.
- **SEO/performance:** Per-page metadata, Open Graph image, sitemap, robots rules, Person and VideoObject JSON-LD, cached public reads with five-minute revalidation, optimized images, and click-to-load video embeds.
- **Admin:** Protected sign-in and dashboard; project, category, testimonial, service, and site-settings management; image/document uploads; inbox, read status, CSV export, and project ordering.
- **API:** Identity admin role, JWT access and rotating refresh tokens, PostgreSQL/EF Core migrations, FluentValidation, ProblemDetails, login/contact rate limiting, output caching, and local file storage abstraction.

## Configuration

- `backend/.env.example` lists backend settings, but ASP.NET Core does **not** load that file automatically. Set the variables in the shell, IDE, or hosting platform.
- `frontend/.env.example` lists `PORTFOLIO_API_URL` and `NEXT_PUBLIC_SITE_URL`. Copy it to `frontend/.env.local` for local use.
- Configure optional SMTP values in the backend host to receive email notifications for contact inquiries.
- Uploaded images and CV files are stored by the API under `wwwroot/uploads`; back up that directory or replace the storage service before moving to object storage.

Never commit real credentials, connection strings containing passwords, JWT secrets, or local environment files.

## Verification

Run frontend checks from `frontend`:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Backend build and database integration require the .NET 10 SDK and a running PostgreSQL instance.

## Deployment

- **Frontend:** Deploy `frontend` to Vercel or another Node-compatible Next.js host. Set `PORTFOLIO_API_URL` to the deployed API origin and `NEXT_PUBLIC_SITE_URL` to the canonical public URL.
- **Backend:** Publish `backend\DemsewPortfolio.Api` with `dotnet publish -c Release`; host on Azure App Service or IIS. Configure production PostgreSQL, HTTPS, `ASPNETCORE_URLS`/hosting bindings, admin credentials, JWT secret, exact `Frontend__Origin`, optional SMTP, and persistent upload storage using the hosting provider’s secret store.
- Do not expose secrets in the frontend environment. Do not put the API’s private database credentials in Vercel.

See each app’s README for platform-specific setup. Docker assets are intentionally not included.

## Content Demsew should provide

The starter database contains clearly identified sample content and placeholder contact details. Replace and verify these before launch:

1. **Brand and profile:** A high-quality portrait/profile photo, preferred display name/title, confirmed city and location text (the current Addis Ababa/Ethiopia value is a placeholder), and final about/story copy.
2. **Showreel:** A representative, rights-cleared YouTube, Vimeo, or HTTPS MP4 link, plus an optional poster/thumbnail image.
3. **Projects:** For every project: approved title, category, slug, description, client credit (or permission to keep it anonymous), year, video URL, thumbnail image, role/tools, featured/publish choices, and optional before/after asset.
4. **Services and pricing:** Final service names, descriptions, and pricing labels or quote-only policy.
5. **Testimonials:** Client-approved quote, name/title, and optional portrait for each testimonial.
6. **Experience and CV:** Accurate experience timeline and years of experience, software/tools, and a current downloadable CV. The current about page lists tools but does not invent employment dates.
7. **Contact and social:** Confirmed public email, WhatsApp number/link, Telegram link, YouTube, Instagram, TikTok, LinkedIn, Behance, and booking URL if used.
8. **Business proof points:** Accurate completed-project, client, and experience counts if those are to appear as statistics; do not publish estimates as facts.
9. **SEO:** Final search title and description, preferred site URL/domain, and any approved social-sharing image or usage restrictions.

Review every seeded example and remove or replace anything that is not Demsew’s real, approved work before publishing it.
