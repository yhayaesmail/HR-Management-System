
````md
# HR Management System

## Overview

The **HR Management System** is a backend-focused project built to manage employees, authentication, attendance, payroll, and task assignments efficiently.  
The project follows a **modular architecture** to ensure scalability, maintainability, and professional coding standards.  

It includes:

- **Auth module** – secure registration, login, and JWT-based authentication.  
- **User/Employee management** – CRUD operations with validation and role-based access.  
- **Attendance tracking** – check-in/check-out and status management.  
- **Payroll management** – automatic salary calculation based on attendance.  
- **Task management** – task assignment, priority handling, and employee tracking.

---

## Goals

- Implement secure authentication and authorization using JWT.  
- Provide complete Employee CRUD functionality.  
- Enable attendance tracking with validations.  
- Automate payroll calculations for each employee monthly.  
- Assign and manage tasks with priorities and admin oversight.  
- Maintain a modular and maintainable project structure.

---

## Completed Modules

### 1. Auth

- Handles **registration** and **login** for employees and admins.  
- Generates **JWT access and refresh tokens**.  
- Middleware for **route protection** and **role-based authorization**.  
- Input validation using **Joi**.  
- Structured error handling with **custom APIError class**.  

### 2. Employee/User Management

- CRUD operations for Employee data.  
- Employee linked to User account (1:1 relation).  
- Fields include: `name`, `department`, `salary`, `phone`, `address`, `title`.  
- Admin can **create, update, delete** employees.  
- Employees can view their own data only.  

### 3. Attendance

- Track employee **check-in/check-out**.  
- Automatic status updates: `PRESENT`, `ABSENT`, etc.  
- Unique constraint on `[employeeId, date]` to prevent duplicates.  
- CreatedBy / UpdatedBy fields for audit tracking.  
- Employees see only their own attendance, admins see all.

### 4. Tasks

- Employees can see **tasks assigned to them**, sorted by **priority**.  
- Admin can **create tasks** for any employee.  
- Tracks: `status` (TODO/IN_PROGRESS/DONE), `priority` (LOW/MEDIUM/HIGH), `description`, `runningTaskDeadline`.  
- CreatedBy / UpdatedBy stored to track who assigned/updated the task.  

### 5. Payroll

- Automatically calculates **monthly payroll** based on attendance.  
- Fields: `baseSalary`, `deduction` (based on absent days), `bonus`, `finalSalary`.  
- Admin can generate payroll and retrieve **monthly reports**.  
- Tightly integrated with Employee and Attendance modules.  

---

## Middlewares

- **Authentication Middleware** – protects private routes using JWT.  
- **Role-based Middleware** – restricts certain actions to admins only.  
- **Error Handling Middleware** – centralized error response system.  
- **Validation Middleware** – validates request bodies using Joi schemas.

---

## Utilities

- **APIError** – structured error responses.  
- **JWT Utils** – generate and verify access/refresh tokens.  
- **Hash Utility** – secure password hashing with bcrypt.  
- **Logger** – logs events and errors for debugging and audit.  

---

## Database Structure

Built with **PostgreSQL** and **Prisma ORM**. Key tables:

- **User** – login credentials and roles.  
- **Employee** – personal and job information, linked to User.  
- **Attendance** – daily check-in/check-out, status, createdBy/updatedBy.  
- **Tasks** – task assignments with priority, deadlines, and audit fields.  
- **Payroll** – monthly salary calculations with deductions, bonuses, and final salary.

---

## Project Structure

```text
hr-management-system/
│
├── src/
│   ├── config/          # Prisma and environment configuration
│   ├── modules/         # Auth, Users, Attendance, Tasks, Payroll
│   │   ├── auth/
│   │   ├── employee/
│   │   ├── attendance/
│   │   ├── tasks/
│   │   └── payroll/
│   ├── middlewares/     # Auth, Role, Error, Validation
│   ├── routes/          # Main router
│   ├── utils/           # Error handling, JWT, hashing, logging
│   ├── app.js           # App setup
│   └── server.js        # Server entry point
├── prisma/              # Database schema
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
````

---

## Tech Stack

* **Node.js** – backend runtime
* **Express.js** – web framework
* **PostgreSQL** – relational database
* **Prisma** – ORM
* **JWT** – authentication
* **bcryptjs** – password hashing
* **Joi** – input validation
* **Winston** – logging

---

## Setup & Installation

1. Clone the repository:

```bash
git clone https://github.com/yhayaesmail/hr-management-system.git
cd hr-management-system
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/hr_management_system
JWT_REFRESH_SECRET=YOUR_SECRET
JWT_ACCESS_SECRET=YOUR_SECRET
```

4. Run database migrations and seed data:

```bash
npx prisma migrate dev
node seed.js
```

5. Start the development server:

```bash
npm run dev
```

---

## API Endpoints (Summary)

### Auth

* `POST /api/auth/register` – Register employee
* `POST /api/auth/login` – Login and get JWT
* `POST /api/auth/refresh` – Refresh token

### Employee

* `POST /api/employees` – Create employee (Admin)
* `GET /api/employees` – List all employees
* `GET /api/employees/:id` – Get employee by ID
* `PUT /api/employees/:id` – Update employee (Admin)
* `DELETE /api/employees/:id` – Delete employee (Admin)

### Attendance

* `POST /api/attendance/checkin` – Employee check-in
* `POST /api/attendance/checkout` – Employee check-out
* `GET /api/attendance` – List attendance records (Admin)

### Tasks

* `POST /api/tasks` – Assign task (Admin)
* `GET /api/tasks` – Get employee's tasks sorted by priority
* `PATCH /api/tasks/:id` – Update task status/priority
* `DELETE /api/tasks/:id` – Delete task (Admin)

### Payroll

* `POST /api/payroll/generate/:month/:year` – Generate monthly payroll (Admin)
* `GET /api/payroll/report/:month/:year` – Get monthly payroll report (Admin)

---

## Notes

* All **createdBy / updatedBy** fields track who performed actions (employee/admin).
* Employees see only their own data for attendance and tasks.
* Admins can manage all employees, tasks, and payroll.
* Modular architecture allows easy expansion (e.g., leaves, performance, notifications).

---

## License

MIT License

---

> ✅ Fully functional backend system with Auth, Users, Attendance, Payroll, and Tasks modules.
> Ready for production-ready improvements and frontend integration.

```

