# 🍽️ Dish Dashboard

A full-stack web app to manage and display dish information, with live real-time updates — even when data changes happen directly on the backend.

## Features
- 📋 View all dishes with image, name, and published status
- 🔄 Toggle a dish's published/unpublished state from the dashboard
- ⚡ Real-time sync across all open clients via Socket.IO
- 🛠️ Updates reflect instantly even if the database is changed directly (not through the UI)

## Tech Stack
- **Backend:** Node.js, Express.js, Socket.IO
- **Frontend:** React.js (Vite)
- **Database:** JSON-based storage (`db.json`)

## How It Works
1. The frontend fetches the dish list via REST on load.
2. Toggling a dish calls a PATCH API, which updates the database.
3. A file watcher on the backend detects *any* change to the database — from the API or a manual edit — and broadcasts the update to every connected client over Socket.IO.
4. All dashboards stay in sync in real time, regardless of where the change originated.

## Getting Started

### Backend
```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:4000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

## API Endpoints

| Method | Endpoint                  | Description                     |
|--------|----------------------------|----------------------------------|
| GET    | `/api/dishes`              | Fetch all dishes                |
| PATCH  | `/api/dishes/:id/toggle`   | Toggle a dish's published status|

## Project Structure
dish-app/

├── backend/
│   ├── server.js
│   ├── db.json
│   └── package.json
└── frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
