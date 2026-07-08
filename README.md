
# Task Management API

A lightweight, secure Task Management API with JWT authentication and a
minimal HTML/JS frontend. Built for the Lead Web Praxis Media Full Stack
Developer (Backend Focus) assessment.

**Stack:** Node.js, Express, TypeScript, PostgreSQL, JWT, bcrypt.

---

## 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ (running locally or accessible via connection string)

## 2. Setup (assume a fresh machine)

```bash
# 1. Clone the repo and install dependencies
git clone <your-repo-url>
cd task-management-api
npm install

# 2. Create the database
createdb taskdb
# or, from psql:
# CREATE DATABASE taskdb;

# 3. Configure environment variables
cp .env.example .env
# then edit .env and set DATABASE_URL / JWT_SECRET for your machine

# 4. Run migrations (creates users, tasks, revoked_tokens tables)
npm run migrate

# 5. Start the server
npm run dev        # development, auto-reloads on file changes
# or
npm run build && npm start   # production build
