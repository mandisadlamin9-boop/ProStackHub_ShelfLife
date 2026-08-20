# ShelfLife

ShelfLife is a full-stack personal reading tracker. Search for books, add them to your shelf, track your reading progress, and rate and review what you've read.

## Features

1. **Account system** — register and log in securely with hashed passwords and JWT-based authentication. Users search and add books via the Google Books API, which auto-fills cover, author, and ISBN.
2. **Reading status and progress** — track each book as Want to Read, Currently Reading, or Read, with a page-progress bar for books in progress.
3. **Ratings and reviews** — leave a personal rating (1–5) and written review for each finished book.
4. **Protected routes** — a user can only ever see or edit their own shelf.
5. **Reading stats** — see totals for books read, pages read, and average rating at a glance.

## Tech Stack

**Frontend**

- React (Vite)

**Backend**

- Node.js + Express
- Azure SQL Database (via `mssql`/Tedious)
- JWT authentication
- bcryptjs for password hashing

**External APIs**

- Google Books API for book search

**Deployment**

- Frontend: Vercel
- Backend: Render
- Database: Azure SQL Database (free tier, serverless)

## Project Structure

```
ProStackHub_ShelfLife/
├── client/          # React frontend (Vite)
└── server/          # Express backend
    ├── config/      # Database connection config
    ├── middleware/  # Auth middleware
    └── server.js    # API routes and server entry point
```

## Getting Started

### Prerequisites

- Node.js
- An Azure SQL Database (or compatible SQL Server instance)
- A Google Books API key

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```dotenv
DB_SERVER=your-server.database.windows.net
DB_DATABASE=your-database-name
DB_USER=your-admin-username
DB_PASSWORD=your-password
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
JWT_SECRET=your-jwt-secret
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
```

Run the server:

```bash
npm start
```

The API runs on `${API_URL}` by default.

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

## API Overview

| Method | Endpoint             | Description                                |
| ------ | -------------------- | ------------------------------------------ |
| GET    | `/api/books/search`  | Search for books                           |
| POST   | `/api/auth/register` | Create a new account                       |
| POST   | `/api/auth/login`    | Log in and receive a JWT                   |
| GET    | `/api/shelf`         | Get the logged-in user's shelf             |
| POST   | `/api/shelf`         | Add a book to the shelf                    |
| GET    | `/api/shelf/:id`     | Get a single shelf item                    |
| PATCH  | `/api/shelf/:id`     | Update status, progress, rating, or review |
| DELETE | `/api/shelf/:id`     | Remove a book from the shelf               |
| GET    | `/api/shelf/stats`   | Get reading statistics                     |

Routes marked as requiring auth expect a `Bearer` JWT in the `Authorization` header, obtained from `/api/auth/login`.

## Author

Built by Lihle Lungwase.
