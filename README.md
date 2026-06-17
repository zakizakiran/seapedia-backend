# Seapedia Backend

Backend API untuk platform Seapedia.

## ✨ Features

- 🔐 **Authentication & Authorization** - JWT-based authentication dengan access token dan refresh token
- 👤 **User Management** - User registration, login, profile management
- 🛡️ **Data Security** - Protected endpoints dengan JWT authorization dan Role-Based Access Control
- ⚙️ **Data Validation** - Validasi input request menggunakan express-validator

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment Variables**: dotenv

## 📦 Prerequisites

Pastikan Anda telah menginstall:

- [Node.js](https://nodejs.org/) (v18 atau lebih tinggi)
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd seapedia-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root directory dan isi dengan konfigurasi berikut:

```env
# Database Configuration
DATABASE_URL="postgres://username:password@localhost:5432/seapedia_db"

# Server Configuration
PORT=8000
NODE_ENV=development

# JWT Configuration
JWT_ACCESS_SECRET=your_access_token_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12
```

**Catatan**: 
- Ganti `username` dan `password` dengan kredensial PostgreSQL Anda
- Ganti `your_access_token_secret_key_here` dan `your_refresh_token_secret_key_here` dengan secret key yang aman

### 4. Setup Database

#### a. Generate Prisma Client

```bash
npx prisma generate
```

#### b. Run Database Migration

```bash
npx prisma migrate dev
```

#### c. Run Database Seeding

Untuk membuat akun admin default:

```bash
npx prisma db seed
```

### 5. Jalankan Aplikasi

#### Development Mode (dengan nodemon)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

Server akan berjalan di `http://localhost:8000` (atau port yang Anda tentukan di `.env`)

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Endpoints Overview

| Category | Endpoint | Method | Auth Required | Description |
|----------|----------|--------|---------------|-------------|
| **General** | `/health` | GET | ❌ | Check API health status |
| **Authentication** | `/auth/register` | POST | ❌ | Register new user |
| | `/auth/login` | POST | ❌ | User login |
| | `/auth/refresh-token` | POST | ❌ | Refresh access token |
| | `/auth/logout` | DELETE | ✅ | User logout |
| | `/auth/profile` | GET | ✅ | Get user profile |

### Endpoints

#### 1. General

##### Health Check

```http
GET /health
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "API is running well"
}
```

#### 2. Authentication

##### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid12345...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2026-06-17T02:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid12345...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-06-17T02:00:00.000Z",
      "updatedAt": "2026-06-17T02:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Refresh Token

```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Logout

```http
DELETE /auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

##### Get User Profile

```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "cuid12345...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-06-17T02:00:00.000Z",
      "updatedAt": "2026-06-17T02:00:00.000Z"
    }
  }
}
```

## ⚠️ Common Issues & Solutions

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**: 
- Ganti PORT di file `.env`
- Atau matikan aplikasi yang menggunakan port tersebut

### Issue: Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:
- Pastikan PostgreSQL server berjalan
- Periksa konfigurasi DATABASE_URL di `.env`
- Pastikan credentials database benar

### Issue: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgres://user:pass@localhost:5432/seapedia_db |
| PORT | Server port | 8000 |
| NODE_ENV | Environment mode | development |
| JWT_ACCESS_SECRET | Secret key untuk access token | your_access_secret_here |
| JWT_REFRESH_SECRET | Secret key untuk refresh token | your_refresh_secret_here |
| JWT_ACCESS_EXPIRATION | Access token expiration | 15m |
| JWT_REFRESH_EXPIRATION | Refresh token expiration | 7d |
| BCRYPT_SALT_ROUNDS | Salt rounds for bcrypt hashing | 12 |

**Happy Coding! 🚀**
