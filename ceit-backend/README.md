# CEIT Admin Portal Backend

This is a multi-tenant backend for the College of Engineering and Information Technology (CEIT) Admin Portal, inspired by Facebook's architecture. It uses Nile (PostgreSQL) for tenant isolation.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (via Nile)
- **ORM:** Drizzle ORM
- **Auth:** JWT & Bcrypt

## Setup

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   DATABASE_URL=your_nile_postgres_url
   JWT_SECRET=your_secret_key
   ```

3. **Database Migration:**
   Ensure your Nile database is ready. You can use Drizzle Kit to push the schema:
   ```bash
   npx drizzle-kit push
   ```

4. **Seed Departments:**
   Initialize the 5 CEIT departments in the database:
   ```bash
   pnpm run seed
   ```

5. **Run the Server:**
   ```bash
   pnpm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register`: Register a new admin (requires `name`, `email`, `password`, `departmentName`).
- `POST /auth/login`: Login as an admin (returns JWT token).

### Posts (Protected)
- `GET /posts`: Get all posts for the admin's department.
- `POST /posts`: Create a new post (requires `caption`, optional `imageUrl`).
- `DELETE /posts/:id`: Delete a post (only if it belongs to the admin's department).

## Multi-Tenancy Logic
- Each department (DIT, DIET, DAFE, DCEE, DCEA) is a **Tenant**.
- All data is isolated using `tenant_id`.
- Admins are bound to a specific `tenant_id` upon registration.
- The `authenticateToken` middleware extracts the `tenant_id` from the JWT, ensuring that all subsequent database queries are scoped to that tenant.
