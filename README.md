# 📖 Online Quran Academy

A full-stack web application for managing an online Quran teaching academy — built with **Next.js 14**, **PostgreSQL (via Prisma ORM)**, and **Vercel Blob** for file storage.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | Full-stack framework (Frontend + Backend API) |
| **TypeScript** | Type-safe JavaScript |
| **PostgreSQL** | Main relational database |
| **Prisma ORM** | Database interaction (no raw SQL needed) |
| **NextAuth.js** | Authentication & session management |
| **Vercel Blob** | Cloud file & media storage |
| **Resend** | Email sending (password reset, notifications) |
| **Daily.co** | Live video class sessions |
| **TailwindCSS** | UI styling |
| **bcryptjs** | Password hashing |

---

## 👥 User Roles

The system has **4 types of users**, each with their own dashboard:

| Role | Dashboard | Description |
|---|---|---|
| **Admin** | `/app/admin` | Full control over the entire platform |
| **Teacher** | `/app/teacher` | Manage classes, students, notes, attendance |
| **Student** | `/app/student` | View courses, lessons, progress, schedule |
| **Parent** | — | Linked to child student accounts |

---

## 🗂️ Features Breakdown

### 🔐 Authentication
- Email/password login with **NextAuth.js**
- **Password reset** via email (Resend)
- Role-based access control (Admin, Teacher, Student, Parent)
- Middleware-protected routes

---

### 🛡️ Admin Panel (`/app/admin`)
- **Dashboard** — Overview stats (students, teachers, enrollments)
- **Teachers Management** — Add, view, manage teacher profiles
- **Students Management** — Add, view, manage student profiles
- **Courses Management** — Create and manage courses
- **Enrollments** — Enroll students into courses, assign teachers
- **Trials Management** — Manage trial class requests
- **Teacher Availability** — View/set teacher schedules
- **Teacher Attendance** — Monitor daily sign-in/sign-out
- **Recordings** — Watch/download all class recordings
- **Messages** — Internal messaging system
- **Payments** — Payment tracking
- **Reports** — Analytics and reporting
- **Settings** — Platform settings

---

### 👨‍🏫 Teacher Panel (`/app/teacher`)
- **Dashboard** — Today's classes, student list, quick stats
- **My Students** — View assigned students and their progress
- **Classes** — Upcoming and past class sessions
- **Live Class** — Join live video class via Daily.co
- **Lessons** — Create and assign lessons to students
- **Attendance** — Mark student attendance per class
- **My Workday** — Sign in/out for daily work tracking
- **Notes** — Personal notes (with optional PDF attachment)
- **Quran Tools** — Built-in Quran reference tools
- **Profile** — Update personal profile, upload documents
- **Messages** — Chat with students/admin

---

### 🎓 Student Panel (`/app/student`)
- **Dashboard** — Enrolled courses, upcoming classes
- **My Courses** — View enrolled courses and progress
- **Course Catalog** — Browse available courses
- **Schedule** — Weekly class schedule with booking slots
- **Lessons** — Access assigned lessons (video, audio, PDF)
- **Attendance** — View personal attendance records
- **Progress** — Track learning progress percentage
- **Live Class** — Join live class session
- **Quran Tools** — Built-in Quran reference
- **Profile** — Update personal info
- **Messages** — Chat with teacher/admin

---

## 🗄️ Database Models (PostgreSQL via Prisma)

| Model | Description |
|---|---|
| `User` | All users (Student, Teacher, Admin, Parent) |
| `Course` | Quran courses with levels and pricing |
| `CourseTeacher` | Many-to-many: courses and teachers |
| `Lesson` | Course lessons (text, video, audio, file) |
| `LessonAssignment` | Teacher assigns lessons to specific students |
| `LessonCompletion` | Tracks which lessons a student completed |
| `Enrollment` | Student enrolled in a course |
| `EnrollmentAvailability` | Student's available time slots |
| `BookingSlot` | Teacher's recurring class schedule |
| `BookingAttendance` | Per-date attendance for each booking |
| `Class` | Scheduled class session |
| `Attendance` | Student attendance per class |
| `Message` | Chat messages (with file/image/voice attachments) |
| `UserAvailability` | Teacher's weekly availability |
| `TrialAssignment` | Trial class assigned to a teacher |
| `TeacherFile` | Teacher's uploaded documents (Vercel Blob) |
| `TeacherAttendance` | Teacher daily sign-in/sign-out |
| `TeacherNote` | Teacher's personal notes |
| `ClassRecording` | Recorded class videos (Vercel Blob) |
| `ParentChild` | Parent linked to child student |
| `Session` | Auth login sessions |
| `PasswordResetToken` | Secure password reset tokens |

---

## 📁 File Storage (Vercel Blob)

Vercel Blob is used to store dynamic user-uploaded files:

- 🎥 **Class recordings** (teacher's screen + audio)
- 📄 **Teacher documents** (resume, certificates)
- 📎 **Message attachments** (images, files, voice notes)
- 📝 **Teacher note attachments** (PDF files)

> **Note:** Static assets (logo, banners, icons) are stored in the `public/` folder.

---

## 📡 API Routes (`/api`)

| Route | Purpose |
|---|---|
| `/api/auth` | NextAuth login/logout/session |
| `/api/signup` | New user registration |
| `/api/users` | User CRUD operations |
| `/api/students` | Student management |
| `/api/teachers` | Teacher management |
| `/api/admins` | Admin management |
| `/api/courses` | Course CRUD |
| `/api/enrollments` | Enrollment management |
| `/api/lessons` | Lesson CRUD and assignment |
| `/api/classes` | Class scheduling |
| `/api/attendance` | Attendance marking |
| `/api/booking-attendance` | Booking-based attendance |
| `/api/bookings` | Booking slot management |
| `/api/messages` | Messaging system |
| `/api/trials` | Trial class management |
| `/api/upload` | File upload to Vercel Blob |
| `/api/teacher` | Teacher-specific APIs |
| `/api/admin` | Admin-specific APIs |
| `/api/health` | Health check endpoint |

---

## 🛠️ Running Locally

```bash
# Install dependencies
npm install

# Run development server (Frontend + Backend together)
npm run dev
```

App runs at: **http://localhost:3000**

---

## ⚙️ Environment Variables Required

Create a `.env` file in the root with the following:

```env
# PostgreSQL Database (e.g., from Neon.tech)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# NextAuth
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Resend (Email)
RESEND_API_KEY=re_...
```

---

## 📋 Tomorrow's Plan — Environment Setup

The project is fully built but needs **new credentials** to run properly. Here is what needs to be done:

### Step 1 — PostgreSQL via Neon.tech (Free)
- [ ] Go to https://neon.tech
- [ ] Sign up with GitHub
- [ ] Create a new project: `online-quran-academy`
- [ ] Copy `DATABASE_URL` and `DIRECT_URL` from the dashboard

### Step 2 — Vercel Blob Storage (Free)
- [ ] Go to https://vercel.com
- [ ] Sign up / log in
- [ ] Go to **Dashboard → Storage → Blob → Create Store**
- [ ] Copy `BLOB_READ_WRITE_TOKEN`

### Step 3 — Create `.env` File
- [ ] Create `.env` in project root
- [ ] Add all credentials from Step 1 and Step 2
- [ ] Add `NEXTAUTH_SECRET` (any random long string)

### Step 4 — Push Database Schema
```bash
npx prisma db push
```
- [ ] This will auto-create all tables in PostgreSQL (no SQL needed!)

### Step 5 — Run the App
```bash
npm run dev
```
- [ ] App should be fully running at `http://localhost:3000`

---

> 💡 **No backend code changes needed** — just add the `.env` file and run `prisma db push`. Everything else is already configured!
