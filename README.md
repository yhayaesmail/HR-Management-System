```md
# HR Management System

![Project Status](https://img.shields.io/badge/Status-Under%20Development-yellow)
![Node.js](https://img.shields.io/badge/Node.js-16.x-green)
![Express](https://img.shields.io/badge/Express-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blueviolet)
![Prisma](https://img.shields.io/badge/Prisma-7.x-lightgrey)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

---

## Overview

The **HR Management System** is a backend-focused project that manages employees, authentication, attendance, and user data efficiently.  
It follows a **modular architecture** for scalability and maintainability, providing a solid foundation for future HR features like payroll and task management.

> ⚠️ Note: Auth, Users, and Attendance modules are fully implemented. Payroll and Tasks modules are under development.

---

## Goals

- Secure authentication and authorization using JWT  
- Employee management (CRUD operations)  
- Attendance tracking (check-in/check-out)  
- Modular, maintainable project structure  
- Foundation for Payroll and Task modules  

---

## Completed Modules

### Auth
- Handles registration, login, and JWT authentication  
- Input validation and structured error handling  

### Users
- CRUD operations for employee data  
- Validations and service layer logic  

### Attendance
- Tracks employee check-in/check-out  
- Validations and service-based architecture  

### Middlewares
- **Authentication** – protects routes  
- **Role-based** – manages access control  
- **Error** – central error handling  
- **Validation** – input validation  

### Utils
- **API Error Handler** – structured error responses  
- **JWT Utility** – token management  
- **Hash Utility** – password hashing  
- **Logger** – event logging  

### Config
- **Prisma** – database connection  
- **Environment Config** – secure environment variables  

---

## Planned Modules

- **Payroll** – automated salary calculations  
- **Tasks** – assignment, tracking, and management  

---

## Database Structure

Using **PostgreSQL** with **Prisma ORM**, the database schema is organized for multi-module HR management:

- **Users Table** – employee data and credentials  
- **Auth** – login and registration  
- **Attendance Table** – check-in/check-out records  
- **Payroll Table** – planned for salary tracking  
- **Tasks Table** – planned for task assignments  

---

## Project Structure

```

hr-management-system/
│
├── src/
│   ├── config/          # Prisma and environment configuration
│   ├── modules/         # Auth, Users, Attendance, Tasks, Payroll
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

- **Node.js** – backend runtime  
- **Express.js** – web framework  
- **PostgreSQL** – relational database  
- **Prisma** – ORM  
- **JWT** – authentication  
- **bcryptjs** – password hashing  
- **Joi** – input validation  
- **Winston** – logging  

---

## Setup & Installation

1. Clone the repository:
```bash
git clone https://github.com/yhayaesmail/hr-management-system.git
cd hr-management-system
````

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (`.env`):

```env
DATABASE_URL=postgresql://username:password@localhost:5432/hr_db
JWT_SECRET=your_jwt_secret
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



> 💡 **Note:** Auth, Users, and Attendance modules are fully functional. Payroll and Tasks modules are under development. Endpoint documentation will be added when the full project is complete.

```

---

