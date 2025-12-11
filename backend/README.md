# 🎬 BookMyShow Backend - Movie Ticket Booking System

A production-ready RESTful API for a movie ticket booking platform. Built with Node.js and Express.js, this backend handles complex concurrent bookings, prevents overbooking through database-level locking, and ensures ACID compliance. The system is architected for scalability and security.

## ✨ Core Features

### Booking Management
- **Concurrent Booking Handling** - Database transactions and locks prevent race conditions and overbooking
- **Automatic Expiry** - Pending bookings automatically expire after 2 minutes using background services
- **Real-time Availability** - Seat availability updates instantly across concurrent users
- **Booking Confirmation** - Multi-step booking workflow with confirmation mechanism

### Content Management  
- **Movie Management** - Full CRUD operations for movies with metadata (duration, genre, rating)
- **Show Management** - Complex show setup with multiple pricing tiers (standard, premium)
- **Dynamic Seat Layout** - Configurable seat arrangements with multiple seat types

### Security & Integration
- **JWT Authentication** - Secure token-based authentication with configurable expiry
- **CORS Configuration** - Environment-based CORS setup for production domains
- **Password Security** - bcryptjs hashing with salt rounds
- **Input Validation** - Server-side validation on all endpoints
- **Error Handling** - Comprehensive error responses with meaningful messages

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 16+ |
| **Framework** | Express.js | 4.18+ |
| **Database** | PostgreSQL | 12+ |
| **ORM/Query** | node-postgres (pg) | 8.11+ |
| **Authentication** | JWT + bcryptjs | Latest |
| **Environment** | dotenv | 16+ |
| **Hosting** | Vercel | Serverless |

## 📋 Prerequisites

- **Node.js** 16+ (compatible with Vercel serverless environment)
- **npm** or **yarn**
- **PostgreSQL** database (Render Cloud PostgreSQL recommended)
- **Git** for version control

## 🚀 Development Setup (Local)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file with your configuration:

```bash
cp .env.example .env
```

**Development `.env` example:**
```env
# Database (Local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/bookmyshow_db

# Server
PORT=5000
NODE_ENV=development

# CORS - Allow frontend on localhost
CORS_ORIGIN=http://localhost:5174,http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=7d

# Booking Configuration  
BOOKING_EXPIRY_MINUTES=2
```

### 4. Initialize the Database

```bash
npm run db:init
```

Creates tables:
- `users` - User accounts with authentication
- `movies` - Movie catalog with metadata
- `shows` - Show instances with pricing tiers
- `seats` - Individual seat records with availability
- `bookings` - Booking transactions with status tracking

### 5. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000` with auto-reload on file changes.

### 6. Verify Setup

```bash
# Test API health
curl http://localhost:5000/api/health
```

Expected response:
```json
{ "success": true, "message": "Server is running" }
```

## 📚 API Documentation

### Base URL

```
Local Development:  http://localhost:5000/api
Production (Vercel): https://bookmyshow-backend.vercel.app/api
```

### Health Check Endpoint

```http
GET /health
```

Returns server status. Used for monitoring and deployment verification.

---

## 🔐 Authentication Endpoints

### User Registration
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "9876543210"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "isAdmin": false,
    "createdAt": "2024-12-01T10:30:00Z"
  }
}
```

### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543211"
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

---

## 🎬 Movie Management Endpoints

### Get All Movies
```http
GET /api/movies
GET /api/movies?genre=Action&search=Avatar

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Avatar: The Way of Water",
      "description": "...",
      "genre": "Sci-Fi",
      "rating": 7.8,
      "duration": 192,
      "releaseDate": "2022-12-16",
      "posterUrl": "https://...",
      "createdAt": "2024-12-01T10:30:00Z"
    }
  ],
  "total": 10,
  "page": 1
}
```

### Get Movie Details
```http
GET /api/movies/:movieId

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Avatar: The Way of Water",
    ...
  }
}
```

### Create Movie (Admin Only)
```http
POST /api/movies
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "New Movie",
  "description": "Movie description",
  "genre": "Action",
  "rating": 8.5,
  "duration": 150,
  "releaseDate": "2024-12-15",
  "posterUrl": "https://..."
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

### Update Movie (Admin Only)
```http
PUT /api/movies/:movieId
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "rating": 8.7
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

### Delete Movie (Admin Only)
```http
DELETE /api/movies/:movieId
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "Movie deleted successfully"
}
```

---

## 🎪 Show Management Endpoints

### Get Upcoming Shows
```http
GET /api/shows/upcoming/list

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "movieId": 1,
      "movieTitle": "Avatar: The Way of Water",
      "showDate": "2024-12-15",
      "showTime": "19:30:00",
      "screenName": "Screen 1",
      "totalSeats": 100,
      "availableSeats": 45,
      "standardPrice": 200,
      "premiumPrice": 300
    }
  ]
}
```

### Get Shows by Movie
```http
GET /api/shows/movie/:movieId

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "movieId": 1,
      "showDate": "2024-12-15",
      "showTime": "19:30:00",
      ...
    }
  ]
}
```

### Get Show with Seat Details
```http
GET /api/shows/:showId

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "movieId": 1,
    "showDate": "2024-12-15",
    "showTime": "19:30:00",
    "totalSeats": 100,
    "availableSeats": 45,
    "standardPrice": 200,
    "premiumPrice": 300,
    "seats": [
      {
        "id": 101,
        "showId": 1,
        "seatNumber": "A1",
        "row": "A",
        "column": "1",
        "isAvailable": true,
        "seatType": "standard"
      }
    ]
  }
}
```

### Create Show (Admin Only)
```http
POST /api/shows
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "movieId": 1,
  "showDate": "2024-12-15",
  "showTime": "19:30:00",
  "screenName": "Screen 1",
  "totalSeats": 100,
  "standardPrice": 200,
  "premiumPrice": 300
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

---

## 🎫 Booking Endpoints
{
  "success": true,
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "title": "Inception",
      "show_date": "2023-12-15",
      ...
    }
  ]
}
```

## Bookings Endpoints

### Book Seats (User)
```http
POST /api/bookings
Content-Type: application/json

{
  "userId": "user123",
  "showId": 1,
  "seatIds": [1, 2, 3]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "booking_reference": "BMV1701234567ABCDE",
    "show_id": 1,
    "user_id": "user123",
    "seat_ids": [1, 2, 3],
    "total_price": 450,
    "status": "PENDING",
    "expires_at": "2023-12-15T19:32:00Z",
    ...
  }
}
```

### Confirm Booking (User)
```http
PATCH /api/bookings/:id/confirm

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "CONFIRMED",
    "confirmed_at": "2023-12-15T19:30:45Z",
    ...
  },
  "message": "Booking confirmed successfully"
}
```

### Get Booking by ID (User)
```http
GET /api/bookings/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "booking_reference": "BMV1701234567ABCDE",
    ...
  }
}
```

### Get Booking by Reference (User)
```http
GET /api/bookings/reference/:reference

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "booking_reference": "BMV1701234567ABCDE",
    ...
  }
}
```

### Get User Bookings (User)
```http
GET /api/bookings/user/:userId

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_reference": "BMV1701234567ABCDE",
      "movie_title": "Inception",
      "show_date": "2023-12-15",
      "show_time": "19:30:00",
      ...
    }
  ]
}
```

## 🔒 Concurrency & Race Condition Prevention

The system uses PostgreSQL transactions with row-level locking (`SELECT FOR UPDATE`) to ensure:

1. **Atomic Operations**: Entire booking process is atomic
2. **Isolation**: Concurrent requests don't interfere with each other
3. **Consistency**: No overbooking is possible
4. **Durability**: All confirmed bookings are safely persisted

### Implementation Details:

- When a user books seats, the show record is locked
- All seat records for those specific seats are locked
- Seats already booked by others are detected and booking fails
- Seats are updated atomically
- Available seat count is decremented

Example flow:
```
1. BEGIN TRANSACTION
2. SELECT show FOR UPDATE (lock the show)
3. SELECT seats FOR UPDATE (lock the seats)
4. Check if seats are available
5. INSERT booking record
6. UPDATE seats as booked
7. UPDATE available_seats count
8. COMMIT (all operations succeed) or ROLLBACK (if any step fails)
```

## 📊 Database Schema

### Movies Table
```sql
- id (PRIMARY KEY)
- title (VARCHAR 255)
- description (TEXT)
- genre (VARCHAR 100)
- rating (DECIMAL 3,1)
- duration_minutes (INT)
- poster_url (VARCHAR 500)
- release_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Shows Table
```sql
- id (PRIMARY KEY)
- movie_id (FOREIGN KEY → movies)
- show_date (DATE)
- show_time (TIME)
- screen_name (VARCHAR 50)
- total_seats (INT)
- available_seats (INT)
- price_standard (DECIMAL 10,2)
- price_premium (DECIMAL 10,2)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Seats Table
```sql
- id (PRIMARY KEY)
- show_id (FOREIGN KEY → shows)
- seat_row (CHAR 1)
- seat_number (INT)
- seat_type (VARCHAR 50)
- is_booked (BOOLEAN)
- booking_id (FOREIGN KEY → bookings)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(show_id, seat_row, seat_number)
```

### Bookings Table
```sql
- id (PRIMARY KEY)
- booking_reference (VARCHAR 20, UNIQUE)
- show_id (FOREIGN KEY → shows)
- user_id (VARCHAR 100)
- seat_ids (INT[])
- total_price (DECIMAL 10,2)
- status (VARCHAR 50: PENDING/CONFIRMED/FAILED)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- confirmed_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## ⏰ Automatic Booking Expiry

- PENDING bookings automatically expire after 2 minutes
- Expiry check runs every minute in the background
- Expired bookings are marked as FAILED
- Seats are released back to available pool
- Available seat count is restored

## 🧪 Testing with Postman

1. Import the `postman-collection.json` file into Postman
2. Update the `base_url` variable: `http://localhost:5000/api`
3. Test endpoints in sequence:
   - Create a movie
   - Create a show for that movie
   - Get show with seats
   - Book seats
   - Confirm booking
   - Check booking status

See `POSTMAN_GUIDE.md` for detailed Postman testing instructions.

## 🚀 Deployment to Render

### Backend Deployment:
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL`: Your Render PostgreSQL URL
   - `NODE_ENV`: production
   - `PORT`: 5000 (auto-detected by Render)
4. Set build command: `npm install`
5. Set start command: `npm start`

### Database Deployment:
1. Create a new PostgreSQL database on Render
2. Note the connection URL
3. Use it in your backend's `DATABASE_URL` environment variable

## 📖 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── controllers/
│   │   └── index.js             # Route handlers
│   ├── middlewares/
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── index.js             # CORS & logging
│   ├── models/
│   │   └── index.js             # Database queries
│   ├── routes/
│   │   ├── movies.js            # Movie routes
│   │   ├── shows.js             # Show routes
│   │   └── bookings.js          # Booking routes
│   ├── services/
│   │   └── index.js             # Business logic
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   └── index.js                 # Express app setup
├── database/
│   └── init.js                  # Database initialization
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 |
| `BOOKING_EXPIRY_MINUTES` | Minutes before pending booking expires | 2 |

## 📝 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common HTTP Status Codes:
- `200 OK` - Successful GET/PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Missing/invalid parameters
- `404 Not Found` - Resource not found
- `409 Conflict` - Seats already booked
- `500 Internal Server Error` - Server error

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly with Postman
4. Create a pull request

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Note**: This is a production-ready backend API. For frontend integration, ensure the `CORS_ORIGIN` environment variable matches your frontend's domain.
