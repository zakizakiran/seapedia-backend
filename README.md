# Seapedia Backend

Backend API untuk platform SEAPEDIA — marketplace yang menghubungkan Seller, Buyer, dan Driver.

## ✨ Features

- 🔐 **Authentication & Authorization** - JWT-based authentication dengan access token dan refresh token
- 👥 **Multi-Role System** - Satu user non-admin bisa memiliki lebih dari satu role (Seller, Buyer, Driver)
- 🔄 **Active Role Selection** - User wajib memilih active role untuk mengakses dashboard privat
- 👤 **User Management** - User registration, login, profile management
- 🛡️ **Role-Based Access Control** - Protected endpoints berdasarkan **active role**, bukan sekadar daftar role
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

Untuk membuat akun demo (Admin, Buyer+Seller, Driver, Buyer):

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

## 👥 Role System

SEAPEDIA memiliki **4 role akun**: `ADMIN`, `SELLER`, `BUYER`, `DRIVER`.

### Multi-Role Behavior

- Satu user non-admin **bisa memiliki lebih dari satu role** sekaligus (contoh: BUYER + SELLER).
- User dengan multi-role **wajib memilih active role** setelah login sebelum mengakses dashboard privat.
- **Authorization berdasarkan active role**, bukan seluruh daftar role yang dimiliki user.
- User single-role otomatis mendapatkan active role tanpa perlu memilih.

### Admin Behavior

- Admin ditangani berbeda dari multi-role non-admin.
- Saat login, Admin otomatis mendapatkan active role `ADMIN` tanpa role selection.
- Admin **tidak bisa dicampur** dengan role non-admin (akun Admin terpisah).
- Setup Admin dilakukan via **seed data**.

### Demo Accounts

| Email | Password | Roles | Active Role |
|-------|----------|-------|-------------|
| admin@seapedia.com | Admin@1234 | ADMIN | ADMIN (otomatis) |
| demo@seapedia.com | User@1234 | BUYER, SELLER | — (wajib pilih) |
| driver@seapedia.com | Driver@1234 | DRIVER | DRIVER (otomatis) |
| buyer@seapedia.com | Buyer@1234 | BUYER | BUYER (otomatis) |

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Endpoints Overview

| Category | Endpoint | Method | Auth | Description |
|----------|----------|--------|------|-------------|
| **General** | `/health` | GET | ❌ | Check API health status |
| **Authentication** | `/auth/register` | POST | ❌ | Register new user dengan multi-role |
| | `/auth/login` | POST | ❌ | User login |
| | `/auth/select-role` | POST | ✅ | Pilih active role |
| | `/auth/refresh-token` | POST | ❌ | Refresh access token |
| | `/auth/logout` | DELETE | ✅ | User logout |
| | `/auth/profile` | GET | ✅ | Get user profile + roles + active role |

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
  "name": "John Doe",
  "roles": ["BUYER", "SELLER"]
}
```

> **Catatan**: Field `roles` adalah array. Role yang tersedia untuk registrasi: `SELLER`, `BUYER`, `DRIVER`. Role `ADMIN` tidak bisa dipilih saat registrasi.

**Response Success (201) — Multi-role:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid12345...",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["BUYER", "SELLER"],
      "activeRole": null
    },
    "requiresRoleSelection": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Success (201) — Single-role:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid12345...",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["BUYER"],
      "activeRole": "BUYER"
    },
    "requiresRoleSelection": false,
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

**Response Success (200) — Multi-role (memerlukan role selection):**
```json
{
  "status": "success",
  "message": "Login successful. Please select an active role.",
  "data": {
    "user": {
      "id": "cuid12345...",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["BUYER", "SELLER"],
      "activeRole": null,
      "isActive": true,
      "createdAt": "2026-06-17T02:00:00.000Z",
      "updatedAt": "2026-06-17T02:00:00.000Z"
    },
    "requiresRoleSelection": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Success (200) — Single-role / Admin:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid12345...",
      "email": "admin@seapedia.com",
      "name": "System Admin",
      "roles": ["ADMIN"],
      "activeRole": "ADMIN",
      "isActive": true,
      "createdAt": "2026-06-17T02:00:00.000Z",
      "updatedAt": "2026-06-17T02:00:00.000Z"
    },
    "requiresRoleSelection": false,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> **Catatan**: Jika `requiresRoleSelection` bernilai `true`, user harus memanggil endpoint `POST /auth/select-role` sebelum mengakses endpoint yang dilindungi oleh role tertentu.

##### Select Active Role

```http
POST /auth/select-role
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "role": "BUYER"
}
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Active role set to 'BUYER'",
  "data": {
    "activeRole": "BUYER",
    "roles": ["BUYER", "SELLER"],
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> **Catatan**: Endpoint ini mengembalikan access token **baru** yang mengandung `activeRole` di payload JWT. Gunakan token baru ini untuk request selanjutnya.

**Response Error (400) — Role tidak dimiliki:**
```json
{
  "status": "fail",
  "message": "You do not have the 'DRIVER' role. Your roles: BUYER, SELLER"
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
      "roles": ["BUYER", "SELLER"],
      "activeRole": "BUYER",
      "isActive": true,
      "createdAt": "2026-06-17T02:00:00.000Z",
      "updatedAt": "2026-06-17T02:00:00.000Z"
    }
  }
}
```

## 🔒 Authorization

### Middleware

Endpoint privat dilindungi oleh 2 lapisan middleware:

1. **`authenticate`** — Verifikasi JWT access token. Menambahkan `req.user` dengan info user termasuk `roles[]` dan `activeRole`.
2. **`authorize(...roles)`** — Cek apakah `activeRole` user termasuk dalam daftar role yang diizinkan.

### Contoh Penggunaan

```javascript
const authenticate = require('./middlewares/auth.middleware');
const authorize = require('./middlewares/role.middleware');

// Hanya user dengan active role SELLER yang bisa akses
router.get('/seller/dashboard', authenticate, authorize('SELLER'), sellerController.dashboard);

// ADMIN atau SELLER bisa akses
router.get('/products', authenticate, authorize('ADMIN', 'SELLER'), productController.list);
```

### Error Responses

**401 — Belum Login:**
```json
{
  "status": "fail",
  "message": "Access token is required"
}
```

**403 — Belum Pilih Active Role:**
```json
{
  "status": "fail",
  "message": "No active role selected. Please select an active role before accessing this resource."
}
```

**403 — Active Role Tidak Diizinkan:**
```json
{
  "status": "fail",
  "message": "Active role 'BUYER' is not authorized to access this resource. Required: SELLER, ADMIN"
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
