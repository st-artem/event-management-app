# Event Management System (PoC)

A full-stack Proof of Concept for an Event Management Application. 
This project allows users to discover public events, manage their own events (create, edit, delete), and track their schedule via an interactive calendar.

## Features Implemented
- **Authentication**: JWT-based session management, securely hashed passwords (Argon2).
- **Events (Public List)**: Discover, join, and leave events. Capacity validation ("Full" status).
- **Event Management**: Create events (with future-date validation), edit, and delete (organizer only).
- **My Events (Calendar)**: Monthly and Weekly views of organized and attended events.
- **Error Handling**: Custom global exception filter for normalized API error responses.
- **Seeding**: Automated database population on the first launch.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router DOM.
- **Backend**: Node.js, NestJS, PostgreSQL, TypeORM, Yup Validation, Swagger.
- **Infrastructure**: Docker & Docker Compose.

---

## Quick Start (Docker Setup)

The project is fully containerized. You can launch the Frontend, Backend, and Database with a single command.

### 1. Clone the repository
```bash
git clone https://github.com/st-artem/event-management-app.git
cd event-management-app
```

### 2. Environment Variables
The repository includes `.env.example` files. For a quick Docker launch, the default configurations in `docker-compose.yml` are ready to go. 
If you want to set them explicitly, copy the examples:
* `cp backend/.env.example backend/.env`
* `cp frontend/.env.example frontend/.env`

### 3. Launch the Application
Run the following command from the root directory:
```bash
docker-compose up --build
```

### 4. Access the App
* **Frontend (Web App):** http://localhost:5173
* **Backend API Base:** http://localhost:3000
* **Swagger API Docs:** http://localhost:3000/api

---

## Database Seeding & Default Credentials
On the first launch, the application automatically populates the PostgreSQL database with sample data (2 Users, 3 Public Events).

You can log in immediately using these test accounts:
1.  **Email:** `eduard@example.com` | **Password:** `password123` *(Organizer of 2 events)*
2.  **Email:** `test@example.com` | **Password:** `password123` *(Organizer of 1 event, participant in 1)*

---
Developed by st-artem.