# Momentum

A full-stack **habit tracker** to build consistency with daily check-ins, streaks, charts, and activity heatmaps.

## Features

- JWT authentication (signup, login, logout)
- Create and manage habits with optional weekly targets
- Log daily completions per habit
- Dashboard with completion trends (Recharts) and GitHub-style heatmaps
- Streak and weekly completion stats

## Stack

React + Vite + Tailwind CSS + Recharts · Node.js + Express · SQLite (`momentum.db`)

## Quick start

```bash
npm run install:all
cp server/.env.example server/.env
npm run dev
```

Open http://localhost:5173 (API on port 3001).

## API

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/habits` | List habits |
| POST | `/api/habits` | Create habit |
| GET | `/api/habits/:id` | Get habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| GET | `/api/habits/dashboard` | Summary stats for charts |
| GET | `/api/entries` | List entries (optional `habitId`, `from`, `to`) |
| POST | `/api/entries` | Log completion (`habitId`, `date`, `completed`) |
| PUT | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |
