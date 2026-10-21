# Demsew Andarge portfolio

The Next.js App Router application serves the public portfolio and the protected admin workspace. Public project, category, service, testimonial, and settings content comes from the ASP.NET Core API; contact inquiries are forwarded to its public contact endpoint.

## Local development

1. Start the backend API and PostgreSQL database using the setup steps in [`../backend/README.md`](../backend/README.md). The API listens at `http://localhost:6231`.
2. Copy `.env.example` to `.env.local`. Set `PORTFOLIO_API_URL` to the backend API URL. Set `NEXT_PUBLIC_SITE_URL` to the site origin (use `http://localhost:6230` locally).
3. Install frontend dependencies and start Next.js:

   ```powershell
   npm install
   npm run dev
   ```

4. Open `http://localhost:6230`. The public site is at `/`; the admin sign-in is at `/admin/login`.

If the API is offline, the public pages show clearly labeled sample/preview content so the frontend can still be reviewed. API errors are written to the Next.js server log. Contact form submissions require the API and database to be running.

## Public portfolio pages

- `/` — hero reel, selected projects, services, testimonials, and contact CTA.
- `/work` and `/work/[slug]` — category filters and project details.
- `/about`, `/services`, `/contact`, and `/privacy`.
- `/sitemap.xml`, `/robots.txt`, and the generated Open Graph image.

Public reads are cached and revalidated every five minutes. Video embeds are only loaded when a visitor chooses to play them. Uploaded images are served from the backend under `/uploads/`.

## Production

Deploy the frontend to Vercel or another Node-compatible Next.js host. Configure `PORTFOLIO_API_URL` as a server-side environment variable pointing to the deployed API and `NEXT_PUBLIC_SITE_URL` as the canonical public site URL. Configure the API CORS origin and trusted proxy/network access to match the deployment. Do not expose the API URL as a client-side secret; public API requests are made from the Next.js server and contact submissions pass through a route handler.

Run the production checks before deployment:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```
