# Backend

NestJS API using Prisma ORM 7 and PostgreSQL.

## Setup

Use Node.js 22.18 or newer and configure `DATABASE_URL` in `.env`.

```bash
npm install
npm run prisma:generate
npm run dev
```

The Prisma schema is `prisma/schema.prisma`; the generated client is written to `src/prisma/generated/client` and is created by the build and development scripts.

## Database workflow

```bash
npm run migrate
npm run migration:status
npm run migrate:deploy
```

`migrate` creates and applies a development migration. `migrate:deploy` applies checked-in migrations in a deployed environment. Prisma 7 migration history is stored in `prisma/migrations`.

For an existing database, first verify that the live schema is compatible with the generated baseline, then mark the baseline as applied and deploy the additive compatibility migration:

```bash
npx prisma migrate resolve --applied 20261101000000_baseline
npm run migrate:deploy
```

The compatibility migration adds `DoctorSchedule.isAvailable`, backfills it from `isActive`, adds query indexes, and enforces per-clinic invoice-number uniqueness. The unique index was checked against the configured database and no duplicate groups were found. For a new empty database, run `npm run migrate:deploy` directly; it applies the baseline and follow-up migrations.

## Build and deployment

```bash
npm run build
npm run deploy
```

`deploy` builds the server only. Run `npm run deploy:migrations` separately after the database has been baselined. The API expects a PostgreSQL connection supplied through `DATABASE_URL`; the former Prisma Composer provisioning and Prisma Compute deployment have been removed. Deploy the built NestJS server on the hosting platform of your choice.

## Clinic logo storage

Clinic logos uploaded during clinic creation are stored in Supabase Storage through its S3-compatible API. Configure these backend environment variables:

- `SUPABASE_S3_ENDPOINT`
- `SUPABASE_S3_REGION`
- `SUPABASE_S3_ACCESS_KEY_ID`
- `SUPABASE_S3_SECRET_ACCESS_KEY`
- `SUPABASE_BUCKET`

Create the bucket in Supabase before uploading logos and make it public so the stored object URLs can be displayed by the frontend.
