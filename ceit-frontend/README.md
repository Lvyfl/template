# CEIT Admin Portal - Frontend

A modern, responsive frontend for the CEIT Admin Portal built with React, TypeScript, and Vite.

## Features

- 🔐 User Authentication (Login/Register)
- 🏢 Department-based Access Control
- 📝 Create, View, and Delete Posts
- 🎨 Modern UI with Dark/Light Mode Support
- 📱 Fully Responsive Design

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing
- **Axios** - HTTP Client

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:3000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── pages/
│   ├── Login.tsx         # Login page
│   ├── Register.tsx      # Registration page
│   ├── Dashboard.tsx     # Main dashboard
│   ├── Auth.css         # Auth pages styling
│   └── Dashboard.css    # Dashboard styling
├── App.tsx              # Main app component with routing
├── AuthContext.tsx      # Authentication context
├── api.ts               # API client configuration
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Available Departments

- DIT (Department of Information Technology)
- DIET (Department of Industrial Engineering Technology)
- DAFE (Department of Architecture and Fine Arts Engineering)
- DCEE (Department of Civil and Environmental Engineering)
- DCEA (Department of Chemical Engineering and Applied Chemistry)

## API Endpoints Used

- `POST /auth/register` - Register new admin
- `POST /auth/login` - Login
- `GET /posts` - Get department posts
- `POST /posts` - Create new post
- `DELETE /posts/:id` - Delete post

## Environment Configuration

The frontend connects to the backend at `http://localhost:3000` by default. To change this, modify the `API_URL` in `src/api.ts`.
