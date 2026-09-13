# Eventra

Eventra is a campus event platform where students can discover what's happening around campus, register for the events they want to attend, and manage everything from one place. Anyone can browse what's on; signing in unlocks registering for events, creating your own, and keeping track of your plans.

## What you can do

- **Browse campus events** - see what's coming up, filter between upcoming, past, or all events, and page through the full list.
- **View event details** - date, time, location, description, capacity, and how many spots are already taken.
- **Register in one click** - reserve your spot on an event page, and cancel later if your plans change. Registering twice for the same event or joining one that's already full isn't allowed, and the interface makes that clear.
- **Create and manage your own events** - publish an event with the details attendees need, and edit or remove it afterward. Only the person who created an event can change or delete it.
- **Keep track of what you've signed up for** - a personal "My Registrations" view lists every event you've registered for.
- **Manage your profile** - view your account details and update your name.
- **Sign up and log in securely** - accounts are protected with hashed passwords and session-based authentication, so only you can manage your own events and registrations.

Throughout the app, pages clearly show when something is loading, when something's gone wrong, when a list is empty, and ask for confirmation before a destructive action like deleting an event. The interface is responsive and works well on both desktop and mobile.

## How it works

Eventra is a web application with a browser-based frontend and a backend API behind it. When you sign up or log in, the backend issues a token that keeps you signed in as you browse. Event data, registrations, and capacity are all managed on the server, so rules like "no double registrations" and "no registering for a full event" are enforced reliably no matter what the browser does.

## Built with

- **Frontend:** React with Vite, for a fast, responsive single-page interface
- **Backend:** Node.js and Express, providing a REST API
- **Database:** MongoDB, for storing users, events, and registrations
- **Authentication:** token-based login with securely hashed passwords
- **Validation:** request data is validated on the server before it's ever saved

The application is containerized, and Docker is the recommended way to run it locally.

## Running it

Prefer to run it with Docker? The application is containerized, and setup instructions are available in [`docs/DOCKER_SETUP_AND_DEPLOYMENT.md`](docs/DOCKER_SETUP_AND_DEPLOYMENT.md).

If you'd rather run things directly with your own Node.js and MongoDB installs:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Copy `.env.example` to `.env` in both `backend/` and `frontend/`, fill in the values (a MongoDB connection string and a JWT secret for the backend, the API URL for the frontend), then start each app:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

By default the frontend runs at `http://localhost:5173` and the backend API at `http://localhost:4000`.

Note: Eventra's database requires MongoDB to be running as a replica set (a MongoDB Atlas cluster works out of the box), since registration and cancellation rely on multi-document transactions to keep event capacity accurate.
