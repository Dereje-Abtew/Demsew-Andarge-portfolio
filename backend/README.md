# Demsew Andarge portfolio API

Controller-based ASP.NET Core API targeting .NET 10 / C# 14. PostgreSQL is the default database; SQLite is also available for local development. Admin access uses ASP.NET Core Identity with an Admin role, short-lived JWT access tokens, rotating refresh tokens, and per-IP login rate limiting.

## Requirements

- .NET 10 SDK
- PostgreSQL 15+ (default) or SQLite

## Local setup

From the repository root:

```powershell
# ASP.NET Core does not automatically load .env files; set values in this shell or your hosting environment.
$env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=demsew_portfolio;Username=postgres;Password=your-local-password"
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://localhost:6231"
$env:Database__Provider = "PostgreSQL"
$env:Jwt__Secret = "replace-with-a-random-secret-at-least-32-bytes-long"
$env:Admin__Email = "admin@example.com"
$env:Admin__Password = "Use-A-Unique-Password-2026!"
$env:RequireAdminCredentials = "true"
$env:Frontend__Origin = "http://localhost:6230"
dotnet run --project backend\DemsewPortfolio.Api
```

Create the `demsew_portfolio` database in PostgreSQL before running the API. ASP.NET Core reads `__` environment variable names as nested configuration; it does not automatically load `.env` files, so set environment values in your shell or IDE. The API listens at `http://localhost:6231`, applies the included initial migration, then seeds the admin account, categories, demonstration projects, services, and testimonial. The sample content is intentionally marked as replaceable and must be reviewed before production publishing.

OpenAPI is available at `http://localhost:6231/openapi/v1.json`, with Scalar documentation at `http://localhost:6231/scalar/v1` in Development.

## Database migrations

The repository contains the initial database schema migration for PostgreSQL and SQLite. At runtime, EF Core applies pending migrations before the seeding routine.

To add future migrations after installing the pinned EF CLI:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.0
dotnet ef migrations add YourMigration --project backend\DemsewPortfolio.Api
dotnet ef database update --project backend\DemsewPortfolio.Api
```

To use SQLite instead, set `Database__Provider=Sqlite` and `ConnectionStrings__Default=Data Source=portfolio.db`.

## API surface

- `POST /api/auth/login`, `/refresh`, `/logout`
- Public cached reads under `/api/public`: categories, projects, testimonials, services, settings
- `POST /api/public/contact` stores validated inquiries and sends an optional SMTP notification
- Admin-only endpoints under `/api/admin`: dashboard, project/category/testimonial/service CRUD, site settings, messages, CSV export, uploads
- Admin endpoints require a JWT carrying the `Admin` role.

Uploads accept JPG, PNG, WebP, and PDF up to 10 MB, verify file signatures, and store generated filenames under `wwwroot/uploads`. The `IFileStorage` abstraction can be replaced by an object-storage provider later. Videos remain external YouTube/Vimeo/HTTPS MP4 URLs.

## Production deployment

Publish the API with `dotnet publish -c Release`, deploy the published output to Azure App Service or IIS, and configure environment variables/secrets in the host. For production, terminate HTTPS at a trusted reverse proxy/load balancer, set `Frontend__Origin` to the exact deployed web origin, use a managed PostgreSQL database, and supply secrets through the host's secret manager rather than committing them.
