# HR Management System — Backend API

A production-oriented **Node.js + Express** REST API for human-resource operations: authentication, employee records, attendance, task assignment, monthly payroll, and a public recruiting/hiring intake. Built with a modular architecture, Joi validation, centralized error handling, and Prisma ORM over PostgreSQL.

The repository ships with a **lightweight frontend demo** used to exercise and present the API to stakeholders; see the [Frontend demo](#frontend-demo) section — the API itself is the deliverable and is fully consumable with **Postman** or any HTTP client.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Option A: Docker Compose (recommended)](#option-a-docker-compose-recommended)
  - [Option B: Local development](#option-b-local-development)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Seeding](#seeding)
- [Authentication & Authorization](#authentication--authorization)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Frontend Demo](#frontend-demo)
- [Development Conventions](#development-conventions)
- [License](#license)

---

## Features

| Module      | Highlights |
|-------------|------------|
| **Auth**    | Login, refresh, logout. Access tokens (JWT) in memory/localStorage, refresh tokens in HTTP-only cookies. bcrypt password hashing. |
| **Employees** | Full CRUD (admin), pagination + search, employees scoped to their own record. 1:1 link between `User` and `Employee`. |
| **Attendance** | Daily check-in / check-out, auto status (`PRESENT`/`LATE`/`ABSENT`), unique `(employeeId, date)` to prevent duplicate punches, `createdBy`/`updatedBy` audit trail. |
| **Tasks** | Assign tasks to employees, priority + status lifecycle, `PATCH /status`, scoped reads (`/my`, `/employee/:id`). |
| **Payroll** | Monthly records with `baseSalary`, `bonus`, `deduction`, `finalSalary`; generation and reporting by month/year; employee self-service via `/my`. |
| **Hiring** | Public application intake (`POST /`), admin-only review pipeline (list with status filter + pagination, get/update/delete by email). |

---

## Tech Stack

- **Node.js** (>= 20) + **Express** (v5)
- **PostgreSQL** + **Prisma ORM** (v7)
- **JWT** (`jsonwebtoken`) — access + refresh tokens
- **bcryptjs** — password hashing
- **Joi** — request validation
- **Winston** — structured logging
- **Docker / docker-compose** — one-command environment

---

## Architecture

The project uses a **modular monolith** layout. Each feature lives in its own folder under `src/modules` and owns its complete vertical slice:

```
src/modules/<feature>/
├── <feature>.service.js      # business logic + data access (Prisma)
├── <feature>.controller.js   # HTTP layer: parse request → call service → respond
├── <feature>.route.js        # route wiring + middleware chain
└── <feature>.validation.js   # Joi schemas for body/query/params
```

All modules share:

- `src/middlewares/authMiddleware.js` — verifies the JWT access token
- `src/middlewares/authorizeRole.js` — role-based guards (`ADMIN`)
- `src/middlewares/validate.middleware.js` — Joi validation for `body`, `query`, `params`
- `src/middlewares/errorHandler.js` + `src/utils/APIError.js` — centralized, structured errors
- `src/utils/` — `jwtUtils`, `hashing`, `logger`, `asyncHandler`

Controllers stay thin; all business rules live in services, keeping them independently testable.

---

## Project Structure

```text
hr-management-system/
│
├── src/
│   ├── config/
│   │   └── prisma.js              # Prisma client singleton
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── authorizeRole.js
│   │   ├── errorHandler.js
│   │   └── validate.middleware.js
│   ├── modules/
│   │   ├── auth/                  # auth.routes.js, auth.service.js, ...
│   │   ├── employee/
│   │   ├── attendance/
│   │   ├── tasks/
│   │   ├── payroll/
│   │   └── Hiring/                # hiring.service.js, controller, route, validation
│   ├── routes/
│   │   └── index.js               # mounts all modules under /api
│   ├── utils/
│   │   ├── APIError.js
│   │   ├── asyncHandler.js
│   │   ├── hashing.js
│   │   ├── jwtUtils.js
│   │   └── logger.js
│   ├── app.js                     # express app assembly
│   └── server.js                  # entry point
├── prisma/
│   ├── schema.prisma
│   └── migrations/                # versioned SQL migrations
├── frontend/                      # lite demo UI (see "Frontend Demo")
├── docker-compose.yml
├── Dockerfile
├── seed.js                        # creates the admin user
├── dataseed.js                    # sample employees/payroll/tasks/attendance/hiring
├── prisma.config.ts
└── package.json
```

---

## Getting Started

### Option A: Docker Compose (recommended)

Run the API, its PostgreSQL database, and migrations with one command:

```bash
docker compose up -d --build
```

On startup the container runs `prisma migrate deploy` (via the entrypoint), so the schema is applied automatically. The API listens on `http://localhost:4500` and the database is exposed on `localhost:5432` (isolated from any host Postgres instance).

Check status and logs:

```bash
docker compose ps
docker compose logs -f api
```

### Option B: Local development

Prerequisites: Node.js >= 20 and a reachable PostgreSQL instance.

```bash
# 1. Install dependencies
npm install

# 2. Create .env (see Environment Variables) and point DATABASE_URL at your database

# 3. Validate the schema, generate the client, and apply migrations
npx prisma validate
npx prisma generate
npx prisma migrate deploy        # or: npx prisma migrate dev (dev workflow)

# 4. Seed base + sample data
node seed.js                     # admin@example.com / admin123
node dataseed.js                 # optional sample employees, payroll, tasks, attendance, hiring

# 5. Start the dev server (auto-restart on change)
npm run dev
```

The server starts on the `PORT` in `.env` (default `4500`).

---

## Environment Variables

| Variable               | Description                                              | Example |
|------------------------|----------------------------------------------------------|---------|
| `DATABASE_URL`         | Prisma connection string to PostgreSQL                   | `postgresql://user:pass@db:5432/hr_management_system` |
| `PORT`                 | HTTP port for the API                                    | `4500` |
| `NODE_ENV`             | `development` / `production`                             | `development` |
| `JWT_ACCESS_SECRET`    | Secret for signing access tokens (10 min)                | *(long random string)* |
| `JWT_REFRESH_SECRET`   | Secret for signing refresh tokens (7 days)               | *(long random string)* |
| `SHADOW_DATABASE_URL`  | Shadow DB used by `prisma migrate dev` only              | *(optional, local dev)* |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Docker Compose DB bootstrap values | |

> Keep secrets out of the repository. Generate strong random values, e.g. `openssl rand -hex 32`.

---

## Database Schema

Managed entirely through Prisma (`prisma/schema.prisma`). Key models:

- **User** — credentials (`email`, `password`), `role` (`ADMIN`/`EMPLOYEE`), `isActive`.
- **Employee** — HR record (`name`, `department`, `title`, `salary`, `phone`, `address`), `userId` unique FK → User.
- **Attendance** — `date`, `checkIn`, `checkOut`, `status`, unique `(employeeId, date)`, `createdBy`/`updatedBy`.
- **Tasks** — `title`, `description`, `priority`, `status`, `runningTaskDeadline`, `createdBy`/`updatedBy`.
- **Payroll** — `baseSalary`, `bonus`, `deduction`, `finalSalary`, `month`, `year`.
- **Hiring** — public application: `firstName`, `lastName`, `email`, `education`, `graduateYear`, `experience`, `position`, `coverLetter`, `status` (`WAITING`/`INTERVIEWED`/`PASSED`/`REJECTED`).

Migrations are versioned under `prisma/migrations` and applied with `prisma migrate deploy`.

---

## Seeding

Two standalone scripts (run inside the container with `docker compose exec api node <script>`):

| Script       | Purpose |
|--------------|---------|
| `seed.js`    | Idempotent: creates the admin account (`admin@example.com` / `admin123`). |
| `dataseed.js`| Wipes and recreates sample rows: 8 employees with login accounts (`employee123`), current-month payroll, today's attendance, tasks, and hiring applications. |

Example inside Docker:

```bash
docker compose exec api node seed.js
docker compose exec api node dataseed.js
```

---

## Authentication & Authorization

- **Access token** (JWT, ~10 min) is returned in the login response body and must be sent as `Authorization: Bearer <token>` on protected routes.
- **Refresh token** is set as an HTTP-only cookie (`httpOnly: true`) on login and rotated via `POST /api/auth/refresh`.
- **Role guards**: admin-only routes use `authMiddleware` + `authorizeRole("ADMIN")`. Employee-scoped routes (`/my`, `/employee/:id`) resolve records through `req.user` so users can never read another employee's data.
- Passwords are hashed with bcrypt; never stored or returned in plaintext.

---

## API Reference

Base URL: `http://localhost:4500/api` (or `http://localhost:5173/api` through the frontend dev proxy).

All responses follow a consistent envelope:

```json
{ "success": true, "data": { ... } }
```

Errors return `{ "success": false, "message": "...", "errors": [...] }` with the appropriate HTTP status.

### Auth

| Method | Endpoint          | Access | Description |
|--------|-------------------|--------|-------------|
| POST   | `/auth/login`     | Public | Sign in, returns access token + sets refresh cookie |
| POST   | `/auth/refresh`   | Cookie | Rotate access token from the refresh cookie |
| POST   | `/auth/logout`    | Auth   | Revoke refresh token / clear cookie |

### Employees

| Method | Endpoint           | Access | Description |
|--------|--------------------|--------|-------------|
| POST   | `/employees`       | ADMIN  | Create employee (also creates the linked User) |
| GET    | `/employees`       | Auth   | Paginated list, optional search (`name`/`department`) |
| GET    | `/employees/:id`   | Auth   | Single employee (employees see only their own) |
| PUT    | `/employees/:id`   | ADMIN  | Update employee |
| DELETE | `/employees/:id`   | ADMIN  | Delete employee (and its User) |

### Attendance

| Method | Endpoint             | Access | Description |
|--------|----------------------|--------|-------------|
| POST   | `/attendance/check-in`  | Auth | Punch in for today (dedupes per `(employeeId, date)`) |
| POST   | `/attendance/check-out` | Auth | Punch out |
| GET    | `/attendance/my`        | Auth | Current user's records |
| GET    | `/attendance/today`     | Auth | Today's records (all for admins, own for employees) |
| GET    | `/attendance/employee/:id` | ADMIN | Records for a specific employee |

### Tasks

| Method | Endpoint                 | Access | Description |
|--------|--------------------------|--------|-------------|
| POST   | `/tasks`                 | ADMIN  | Assign a task to an employee |
| GET    | `/tasks`                 | Auth   | List tasks (all for admins, own for employees) |
| GET    | `/tasks/my`              | Auth   | Current user's tasks |
| GET    | `/tasks/employee/:employeeId` | ADMIN | Tasks for a specific employee |
| GET    | `/tasks/:id`             | Auth   | Single task |
| PUT    | `/tasks/:id`             | ADMIN  | Update task |
| PATCH  | `/tasks/:id/status`      | Auth   | Update status (`TODO`/`IN_PROGRESS`/`DONE`) |
| DELETE | `/tasks/:id`             | ADMIN  | Delete task |

### Payroll

| Method | Endpoint                       | Access | Description |
|--------|--------------------------------|--------|-------------|
| POST   | `/payroll`                     | ADMIN  | Create payroll record |
| GET    | `/payroll`                     | Auth   | List payroll records |
| GET    | `/payroll/my`                  | Auth   | Current user's payslips |
| GET    | `/payroll/employee/:employeeId` | ADMIN | Payslips for one employee |
| POST   | `/payroll/generate/:month/:year` | ADMIN | Generate payroll for the month |
| GET    | `/payroll/report/:month/:year`  | ADMIN | Monthly payroll report |
| GET    | `/payroll/:id`                 | Auth   | Single record |
| PUT    | `/payroll/:id`                 | ADMIN  | Update record |
| DELETE | `/payroll/:id`                 | ADMIN  | Delete record |

### Hiring (Recruiting)

| Method | Endpoint            | Access | Description |
|--------|---------------------|--------|-------------|
| POST   | `/hiring`           | Public | Submit an application |
| GET    | `/hiring`           | ADMIN  | Paginated list with `page`, `limit`, `status` filters |
| GET    | `/hiring/:email`    | ADMIN  | Application by applicant email |
| PATCH  | `/hiring/:email`    | ADMIN  | Update status (`WAITING`/`INTERVIEWED`/`PASSED`/`REJECTED`) |
| DELETE | `/hiring/:email`    | ADMIN  | Delete an application |

---

## Error Handling

- Controllers throw `APIError(statusCode, message, details)`; a global `errorHandler` middleware formats the response and logs it via Winston.
- Joi validation failures surface as `400` with a machine-readable `errors` array.
- Prisma known-request errors are mapped to `404`/`409` where appropriate (e.g. duplicate email, missing record).
- Async route handlers are wrapped with `asyncHandler` so rejected promises always reach the error middleware.

---

## Live Demo

The project is deployed and running right now — no setup required:

| Piece | URL |
|---|---|
| **Frontend (demo UI)** | https://hr-management-system-frontend-brown.vercel.app/ |
| **Backend (REST API)** | https://hr-management-system-blush.vercel.app/api/health |

**Sign in with:** `admin@example.com` / `admin123`

You can also log in as any seeded employee (e.g. `omar@example.com` / `employee123`) to see the employee-scoped views (own tasks, own attendance, check-in/check-out).

> Note: the free serverless tier spins down after inactivity, so the first request after a pause can take a few seconds to wake up.

---

## Frontend Demo

> **The `frontend/` folder is a lightweight demo only.** It exists to demonstrate and test the API against the client alongside tools like **Postman** — it is not the deliverable and makes **zero backend changes**.

- React + Vite SPA (port `5173`) that proxies `/api` to the backend at `http://localhost:4500`, so it always exercises the real API.
- Includes **skeleton loading states** so you can visually confirm that data actually flows from the database.
- Covers every module: login, employees, attendance, payroll, tasks, hiring.

Quick start:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Sign in with `admin@example.com` / `admin123`, or any seeded employee (`omar@example.com` / `employee123`) to see the employee-scoped views.

For API-level testing, import the endpoints above into **Postman**, log in to obtain a token, and attach it as a `Bearer` token — no UI required.

---

## Development Conventions

- **Vertical-slice modules**: service / controller / route / validation per feature; shared concerns live in `middlewares/` and `utils/`.
- **Thin controllers**: validation + role checks are handled by middleware; services own all business logic.
- **Validation everywhere**: every `body`, `query`, and `params` shape is defined by a Joi schema.
- **Audit fields**: `createdBy` / `updatedBy` track who performed each write.
- **Migrations**: schema changes go through versioned Prisma migrations; `prisma migrate deploy` is the production path.
- **Secrets**: never commit real secrets; use `.env` (git-ignored) and strong random values.

---

## License

MIT