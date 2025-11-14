# My Trener

My Trener is a Next.js application for planning workouts, logging training sessions, and tracking progress.

## Prerequisites

- Node.js 20+
- pnpm 10+

Install dependencies:

```bash
pnpm install
```

## Environment variables

Copy `.env.example` to `.env.local` (or `.env`) and populate it with credentials from your Firebase project and, optionally, the Vercel Blob token used for seeding the exercise dataset.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID. |
| `VERCEL_BLOB_READ_WRITE_TOKEN` | ⛔️ | Optional token that enables uploading the exercise dataset to Vercel Blob storage during bootstrapping. |

> ℹ️ The application requires all Firebase variables to be present both locally and in production in order to connect to Firestore.

## Local development

Start the development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the app.

## Deploying to Vercel

1. Create a project from this repository in the [Vercel Dashboard](https://vercel.com/dashboard).
2. In **Settings → Environment Variables**, add each variable from the table above.
   - Add them to the **Production** environment.
   - If you use Preview deployments, repeat the same variables for the **Preview** environment.
3. Redeploy the project so the new environment variables take effect.

Once configured, the API routes will have access to Firebase and the optional Vercel Blob integration.

## Production verification

Before deploying, run the production build locally to ensure the API routes compile and bootstrapping succeeds without runtime errors:

```bash
pnpm build
```

This command executes the same compilation steps Vercel performs for production builds, validating that Server Actions and API routes are ready to run in the hosted environment.
