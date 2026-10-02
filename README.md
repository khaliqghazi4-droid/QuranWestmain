# Quran West Academy

A public website and learning management system for an online Quran academy. Families find courses and enroll on the website. The academy runs its classes from three dashboards: **admin**, **teacher** and **student**.

Built with **Next.js 14**, **TypeScript**, **Prisma + PostgreSQL**, **NextAuth** and **Vercel Blob**.

---
Ready to deploy
## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Deployment (Vercel)](#deployment-vercel)
- [Troubleshooting](#troubleshooting)

---

## Features

### Public website
Home, About, Courses, Instructors, Pricing, Testimonials, Blog, FAQs and Contact pages, plus an enrollment form that sends requests to the admin.

### Admin dashboard: `/app/admin`
- **Dashboard:** students, teachers, courses, revenue and recent sign-ups at a glance.
- **Enroll Requests and Free Trials:** review website enrollments and assign trial classes to teachers.
- **Students:** add students, issue logins, suspend or reactivate accounts. Each student has a printable progress report and their own class recordings.
- **Teachers:** profiles, documents and course assignments.
- **Teacher Attendance:** daily sign-in and sign-out records.
- **Scheduling:** weekly booking board for teachers and students.
- **Courses, Payments and Reports.**
- **Class Recordings:** watch and download every recorded class. Each recording can be shown to its student with one click, or hidden again.
- **Messages:** chat with teachers and students.
- **Header search:** live suggestions for students, teachers, courses and pages.

### Teacher dashboard: `/app/teacher`
- **My Workday:** sign in and out for the day.
- **Classes:** upcoming classes, searchable and filterable by day.
- **Class room:** **Start Class** joins the live meeting and starts recording in one click. **End Class** uploads the recording, with a progress bar.
- **Attendance, Lessons, Students and Notes.** Notes can be text or a PDF.
- **Quran Reader, Messages and Profile.**

### Student dashboard: `/app/student`
- **My Courses and Browse Catalog,** including the enrollment form.
- **Schedule:** weekly classes with a Join button, plus any class recordings the admin has shared.
- **Attendance and Progress.**
- **Quran Reader:** surah reader, the full Quran as a PDF, and Norani Qaida.
- **Messages:** text, images, PDFs and voice notes.
- **Profile.**

### Live classes and recordings
- Classes run on **JaaS (8x8.vc)** when it is configured, with the class's teacher as the meeting moderator.
  - Otherwise they fall back to **Daily.co**, then to the public **meet.jit.si**.
  - Trial classes always use meet.jit.si.
- The recording is made in the teacher's browser:
  - It captures the class tab and mixes the student's audio with the teacher's microphone.
  - It uploads to Vercel Blob when the class ends.
- **Who can watch:** recordings are visible to admins only, until the admin shares one with its student.

### Accounts and security
- Email and password sign-in (NextAuth, JWT sessions), with sign-up, email verification and password reset by email.
- Role-based route protection in `src/middleware.ts`.
- Suspended accounts and expired free-trial logins are signed out automatically.

> The `PARENT` role exists in the database schema, but it has no dashboard yet.

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3 (dashboards), Bootstrap-based template CSS (website), Framer Motion |
| Database | PostgreSQL (Neon) with Prisma 6 |
| Auth | NextAuth 4 (credentials provider, JWT) and bcryptjs |
| File storage | Vercel Blob: class recordings, chat attachments, teacher files and PDFs |
| Email | Resend |
| Video classes | JaaS (8x8.vc), Daily.co or meet.jit.si |
| Quran data | Quran.com API v4 |

---

## Getting started

### Prerequisites
- Node.js 18.17 or newer
- A PostgreSQL database, for example a free project on [Neon](https://neon.tech)
- A **public** Vercel Blob store (see [Environment variables](#environment-variables))

### Setup

```bash
# 1. Install dependencies (this also generates the Prisma client)
npm install

# 2. Create your environment file, then fill in the values
cp .env.example .env

# 3. Create the database tables
npx prisma db push

# 4. Create the first admin account (the password is printed once)
npm run create-admin -- admin@example.com "Academy Admin"

# 5. Start the development server
npm run dev
```

Open **http://localhost:3000** and sign in at `/login`.

---

## Environment variables

Copy `.env.example` to `.env` and fill in the values. The real `.env` is git-ignored, so never commit it.

| Variable | Required | What it is for |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by the app. On Neon, use the pooled connection. |
| `DIRECT_URL` | Yes | Direct, non-pooled connection used by the Prisma CLI (`prisma db push`). |
| `NEXTAUTH_SECRET` | Yes | Signs login sessions. Any long random string, for example from `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | Full URL of the site: `http://localhost:3000` locally, your live domain in production. |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob token. The store must be created with **Public** access, because uploads are public and a private store rejects them. |
| `RESEND_API_KEY` | Optional | Sends password-reset emails. Without it, the reset link is only printed in the server log. |
| `EMAIL_FROM` | Optional | Sender address for emails. Defaults to `Online Quran Academy <onboarding@resend.dev>`. |
| `JAAS_APP_ID`, `JAAS_KEY_ID`, `JAAS_PRIVATE_KEY` | Optional | JaaS (8x8.vc) API key for live classes. All three are needed. `JAAS_PRIVATE_KEY` is the contents of the downloaded `.pk` file. |
| `DAILY_API_KEY`, `DAILY_DOMAIN` | Optional | Daily.co, used for live classes only when JaaS is not configured. |
| `CRON_SECRET` | Recommended | Protects the `/api/admin/warmup` cron job. Vercel sends it automatically once it is set there. |
| `NEXT_PUBLIC_API_URL` | Optional | Base URL for the website's axios client (`src/lib/axios.js`). |

Vercel sets `VERCEL_URL` and `NODE_ENV` by itself.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server on port 3000. |
| `npm run build` | Generates the Prisma client and builds for production. |
| `npm start` | Runs the production build. |
| `npm run lint` | Runs ESLint. |
| `npm run create-admin -- <email> ["Full Name"]` | Creates an admin account and prints its password once. |
| `npx prisma db push` | Applies `prisma/schema.prisma` to the database. |

---

## Project structure

```
prisma/
  schema.prisma          Database models
  create-admin.mjs       Admin account script
  seed*.mjs              Sample data scripts
public/                  Website images and template assets
src/
  app/
    page.js              Website home page
    (pages)/             Website pages: about, courses, pricing, blogs, ...
    (auth)/              Login, sign-up and password reset
    app/admin/           Admin dashboard
    app/teacher/         Teacher dashboard
    app/student/         Student dashboard
    api/                 API route handlers
  components/            UI: class room, dashboard shell, messaging, website header and footer, ...
  lib/                   Auth, Prisma client, class rooms, JaaS and Daily, recordings, email, ...
  middleware.ts          Role-based protection for /app/*
vercel.json              Cron job: warms the admin caches every 5 minutes
```

---

## Deployment (Vercel)

1. Import this repository in Vercel, or connect it under **Project → Settings → Git**.
2. Add every variable from [Environment variables](#environment-variables) under **Project → Settings → Environment Variables**.
   - Set `NEXTAUTH_URL` to the production domain.
3. Connect a **public** Blob store to the project under **Storage**.
4. Deploy. The build runs `prisma generate && next build`.
5. Run `npx prisma db push` against the production database whenever `schema.prisma` changes.

The cron job in `vercel.json` calls `/api/admin/warmup` every 5 minutes to keep the admin pages fast.

---

## Troubleshooting

- **The site loads without styles, or shows 404s for `/_next/...` files.**
  - The `.next` folder is out of sync. This usually happens after running `npm run build` while `npm run dev` is still running, or with two dev servers open at once.
  - Fix it by stopping every dev server, deleting `.next`, and running `npm run dev` once.
- **`EPERM: operation not permitted` when running `prisma generate` or `prisma db push` on Windows.** The running dev server locks Prisma's engine file. Stop the dev server, run the command, then start it again.
- **Uploads fail with a CORS error in the browser.** The Blob store is private. Create a public store and use its token.
- **Port 3000 is in use.** Another dev server is already running. Stop it rather than starting a second one.
