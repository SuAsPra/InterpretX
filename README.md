# Narrative Portfolio - Connected Achievements Dashboard

A production-ready MERN stack web app that converts isolated achievements into a connected professional story.

Team of 4 participated in interpretX coding challenge. Members - Suriyan Loganathan 24BRS1009, Arjun 24BRS1232, Sairam 24BRS1347, Arunadithya Raguraman 24BRS1309

## Features

- Secure auth (signup, login, JWT, protected routes, persistent login)
- Achievement CRUD with user isolation
- Connection CRUD with relation types and story text
- Gallery view with search, filter, sort
- React Flow graph view of connected growth
- Chronological timeline view
- Narrative generation endpoint (`POST /api/narrative/generate`)
- Responsive dashboard UI with loading and empty states

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, React Router, Axios, Framer Motion, React Flow
- Backend: Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs

## Project Structure

- `backend/` - Express API, Mongo models, routes, controllers, auth middleware
- `frontend/` - React application, context-based auth, dashboard views

## Backend Setup

1. Open terminal in `backend/`
2. Install dependencies:
   - `npm install`
3. Copy env template:
   - `cp .env.example .env` (or create `.env` manually on Windows)
4. Set `.env` values:
   - `MONGO_URI=<your_mongodb_atlas_uri>`
   - `JWT_SECRET=<strong_secret>`
   - `PORT=5000`
   - `CLIENT_URL=http://localhost:5173`
5. Run backend:
   - `npm run dev`

## Frontend Setup

1. Open terminal in `frontend/`
2. Install dependencies:
   - `npm install`
3. Copy env template:
   - `cp .env.example .env` (or create `.env` manually on Windows)
4. Set `.env`:
   - `VITE_API_URL=http://localhost:5000`
5. Run frontend:
   - `npm run dev`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Achievements

- `POST /api/achievements`
- `GET /api/achievements`
- `PUT /api/achievements/:id`
- `DELETE /api/achievements/:id`

### Connections

- `POST /api/connections`
- `GET /api/connections`
- `DELETE /api/connections/:id`

### Narrative

- `POST /api/narrative/generate`

### Public Read-only

- `GET /api/public/achievements`
- `GET /api/public/connections`
- `POST /api/public/narrative/generate`
- `GET /api/public/profile/:username`
- `GET /api/public/profile/:username/achievements`
- `GET /api/public/profile/:username/connections`
- `POST /api/public/profile/:username/narrative/generate`

Guests can access `/u/:username` for a single user's read-only profile (graph/timeline/gallery). Login is required for add/edit/delete actions.

## Deployment

### Backend (Render)

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL`

### Frontend (Vercel)

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=<render_backend_url>`

## User Flow

Signup -> Login -> Add achievements -> Connect achievements -> View Gallery -> View Timeline -> View Graph -> Read Narrative Story
