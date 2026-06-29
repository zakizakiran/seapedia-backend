# Seapedia Backend

Backend API untuk platform SEAPEDIA — marketplace yang menghubungkan Seller, Buyer, dan Driver.

## ✨ Features

- 🔐 **Authentication & Authorization** - JWT-based authentication dengan access token dan refresh token
- 👥 **Multi-Role System** - Satu user non-admin bisa memiliki lebih dari satu role (Seller, Buyer, Driver)
- 🔄 **Active Role Selection** - User wajib memilih active role untuk mengakses dashboard privat
- 👤 **User Management** - User registration, login, profile management dengan financial summary placeholder
- 🛡️ **Role-Based Access Control** - Protected endpoints berdasarkan **active role**, bukan sekadar daftar role
- 🛒 **Public Marketplace** - Katalog produk publik dengan search dan filter, menampilkan info toko (marketplace multi-seller)
- ⭐ **Application Reviews** - Guest dan logged-in user bisa submit review/rating tentang pengalaman aplikasi
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

| Email               | Password    | Roles         | Active Role       |
| ------------------- | ----------- | ------------- | ----------------- |
| admin@seapedia.com  | Admin@1234  | ADMIN         | ADMIN (otomatis)  |
| demo@seapedia.com   | User@1234   | BUYER, SELLER | — (wajib pilih)   |
| seller@seapedia.com | Seller@1234 | SELLER        | SELLER (otomatis) |
| driver@seapedia.com | Driver@1234 | DRIVER        | DRIVER (otomatis) |
| buyer@seapedia.com  | Buyer@1234  | BUYER         | BUYER (otomatis)  |

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Endpoints Overview

| Category           | Endpoint                       | Method | Auth        | Description                                                |
| ------------------ | ------------------------------ | ------ | ----------- | ---------------------------------------------------------- |
| **General**        | `/health`                      | GET    | ❌          | Check API health status                                    |
| **Authentication** | `/auth/register`               | POST   | ❌          | Register new user dengan multi-role                        |
|                    | `/auth/login`                  | POST   | ❌          | User login                                                 |
|                    | `/auth/select-role`            | POST   | ✅          | Pilih active role                                          |
|                    | `/auth/refresh-token`          | POST   | ❌          | Refresh access token                                       |
|                    | `/auth/logout`                 | DELETE | ✅          | User logout                                                |
|                    | `/auth/profile`                | GET    | ✅          | Get user profile + roles + active role + financial summary |
| **Store (Seller)** | `/stores`                      | POST   | ✅ (SELLER) | Buat profil toko (maksimal 1 toko per seller)              |
|                    | `/stores`                      | PUT    | ✅ (SELLER) | Update nama dan deskripsi toko                             |
|                    | `/stores/my-store`             | GET    | ✅ (SELLER) | Tarik informasi toko milik seller                          |
| **Products**       | `/products`                    | GET    | ❌          | Public product listing (search, filter, pagination)        |
|                    | `/products/:id`                | GET    | ❌          | Public product detail dengan info toko                     |
|                    | `/products/seller`             | POST   | ✅ (SELLER) | Tambah produk ke toko (hanya jika sudah punya toko)        |
|                    | `/products/seller/:id`         | PUT    | ✅ (SELLER) | Update produk (hanya milik seller tersebut)                |
|                    | `/products/seller/:id`         | DELETE | ✅ (SELLER) | Hapus produk                                               |
|                    | `/products/seller/my-products` | GET    | ✅ (SELLER) | List semua produk khusus milik toko seller tersebut        |
| **Reviews**        | `/reviews`                     | GET    | ❌          | List application reviews (sort, pagination)                |
|                    | `/reviews`                     | POST   | ❌          | Submit application review (guest atau logged-in)           |
| **Wallets**        | `/wallets/my-wallet`           | GET    | ✅ (BUYER)  | Lihat balance dan riwayat transaksi dompet                 |
|                    | `/wallets/top-up`              | POST   | ✅ (BUYER)  | Dummy top-up balance wallet                                |
| **Addresses**      | `/addresses`                   | POST   | ✅ (BUYER)  | Tambah alamat pengiriman baru                              |
|                    | `/addresses`                   | GET    | ✅ (BUYER)  | List semua alamat milik buyer                              |
|                    | `/addresses/:id`               | PUT    | ✅ (BUYER)  | Update alamat                                              |
|                    | `/addresses/:id`               | DELETE | ✅ (BUYER)  | Hapus alamat                                               |
|                    | `/addresses/:id/default`       | PATCH  | ✅ (BUYER)  | Jadikan alamat sebagai default utama                       |
| **Carts**          | `/carts`                       | GET    | ✅ (BUYER)  | Lihat isi keranjang dan subtotal                           |
|                    | `/carts/items`                 | POST   | ✅ (BUYER)  | Tambah produk atau update kuantitas di keranjang           |
|                    | `/carts/items/:productId`      | DELETE | ✅ (BUYER)  | Hapus produk tertentu dari keranjang                       |
| **Orders**         | `/orders/summary`              | POST   | ✅ (BUYER)  | Dapatkan rincian harga sebelum konfirmasi checkout         |
|                    | `/orders`                      | POST   | ✅ (BUYER)  | Proses checkout dan buat pesanan baru                      |
|                    | `/orders/buyer`                | GET    | ✅ (BUYER)  | Lihat daftar pesanan yang pernah dibuat buyer              |
|                    | `/orders/buyer/:id`            | GET    | ✅ (BUYER)  | Lihat detail suatu pesanan buyer                           |
|                    | `/orders/seller`               | GET    | ✅ (SELLER) | Lihat daftar pesanan masuk ke toko seller                  |
|                    | `/orders/seller/:id`           | GET    | ✅ (SELLER) | Lihat detail pesanan yang masuk ke toko seller             |
|                    | `/orders/seller/:id/process`   | PATCH  | ✅ (SELLER) | Proses status order dari PACKING ke WAITING_FOR_DRIVER     |
| **Discounts**      | `/discounts/vouchers`          | POST   | ✅ (ADMIN)  | Buat voucher diskon                                        |
|                    | `/discounts/vouchers`          | GET    | ✅ (ADMIN)  | List semua voucher diskon                                  |
|                    | `/discounts/vouchers/:id`      | GET    | ✅ (ADMIN)  | Detail voucher diskon                                      |
|                    | `/discounts/promos`            | POST   | ✅ (ADMIN)  | Buat promo diskon                                          |
|                    | `/discounts/promos`            | GET    | ✅ (ADMIN)  | List semua promo diskon                                    |
|                    | `/discounts/promos/:id`        | GET    | ✅ (ADMIN)  | Detail promo diskon                                        |
| **Reports**        | `/reports/buyer/spending`      | GET    | ✅ (BUYER)  | Laporan total pengeluaran buyer                            |
|                    | `/reports/seller/income`       | GET    | ✅ (SELLER) | Laporan total pemasukan seller                             |

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
      "activeRole": "SELLER",
      "isActive": true,
      "financialSummary": {
        "buyer": {
          "walletBalance": 0,
          "totalSpending": 0
        },
        "seller": {
          "totalIncome": 0,
          "store": {
            "id": "cuid...",
            "name": "Nama Toko"
          }
        }
      },
      "createdAt": "2026-06-17T02:00:00.000Z",
      "updatedAt": "2026-06-17T02:00:00.000Z"
    }
  }
}
```

> **Catatan**: `financialSummary` menampilkan data sesuai role yang dimiliki user. Nilai wallet/income/earnings saat ini adalah placeholder (0) dan akan diimplementasikan di level selanjutnya.

#### 3. Products (Public)

##### List Products

```http
GET /products?page=1&limit=12&search=udang&storeId=cuid...
```

**Query Parameters:**

| Parameter | Type   | Default | Description                            |
| --------- | ------ | ------- | -------------------------------------- |
| page      | number | 1       | Halaman pagination                     |
| limit     | number | 12      | Jumlah produk per halaman              |
| search    | string | —       | Cari berdasarkan nama/deskripsi produk |
| storeId   | string | —       | Filter produk berdasarkan toko         |

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "cuid...",
        "name": "Ikan Tuna Segar",
        "description": "Ikan tuna segar kualitas ekspor...",
        "price": 85000,
        "stock": 50,
        "imageUrl": null,
        "storeId": "cuid...",
        "createdAt": "2026-06-17T02:00:00.000Z",
        "updatedAt": "2026-06-17T02:00:00.000Z",
        "store": {
          "id": "cuid...",
          "name": "Toko Laut Nusantara"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

##### Product Detail

```http
GET /products/:id
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "product": {
      "id": "cuid...",
      "name": "Ikan Tuna Segar",
      "description": "Ikan tuna segar kualitas ekspor...",
      "price": 85000,
      "stock": 50,
      "imageUrl": null,
      "storeId": "cuid...",
      "createdAt": "2026-06-17T02:00:00.000Z",
      "updatedAt": "2026-06-17T02:00:00.000Z",
      "store": {
        "id": "cuid...",
        "name": "Toko Laut Nusantara",
        "description": "Menjual berbagai hasil laut segar...",
        "createdAt": "2026-06-17T02:00:00.000Z"
      }
    }
  }
}
```

#### 4. Application Reviews (Public)

> Review adalah tentang **pengalaman website/aplikasi SEAPEDIA**, bukan tentang produk/order spesifik. Guest (tanpa akun) maupun user yang sudah login boleh submit review.

##### List Reviews

```http
GET /reviews?page=1&limit=10&sort=newest
```

**Query Parameters:**

| Parameter | Type   | Default | Description                           |
| --------- | ------ | ------- | ------------------------------------- |
| page      | number | 1       | Halaman pagination                    |
| limit     | number | 10      | Jumlah review per halaman             |
| sort      | string | newest  | Urutan: `newest`, `highest`, `lowest` |

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "cuid...",
        "reviewerName": "Budi Santoso",
        "rating": 5,
        "comment": "Marketplace seafood terbaik!",
        "createdAt": "2026-06-17T02:00:00.000Z"
      }
    ],
    "stats": {
      "averageRating": 4.2,
      "totalReviews": 5
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

##### Submit Review

```http
POST /reviews
```

**Request Body:**

```json
{
  "reviewerName": "Nama Reviewer",
  "rating": 5,
  "comment": "Aplikasi SEAPEDIA sangat membantu!"
}
```

> **Catatan**: Jika request menyertakan header `Authorization: Bearer <token>`, review akan dikaitkan dengan userId user yang login. Jika tidak, review dicatat sebagai guest review.

**Response Success (201):**

```json
{
  "status": "success",
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "id": "cuid...",
      "reviewerName": "Nama Reviewer",
      "rating": 5,
      "comment": "Aplikasi SEAPEDIA sangat membantu!",
      "userId": null,
      "createdAt": "2026-06-17T02:00:00.000Z"
    }
  }
}
```

#### 5. Stores (Seller)

##### Create Store

```http
POST /stores
```

**Request Body:**

```json
{
  "name": "Toko Laut Nusantara",
  "description": "Menjual hasil laut segar."
}
```

**Response Success (201):**

```json
{
  "status": "success",
  "message": "Store created successfully",
  "data": {
    "id": "cuid...",
    "name": "Toko Laut Nusantara",
    "description": "Menjual hasil laut segar."
  }
}
```

##### Update Store

```http
PUT /stores
```

**Request Body:**

```json
{
  "name": "Toko Laut Nusantara Baru",
  "description": "Menjual hasil laut segar dan olahan."
}
```

##### Get My Store

```http
GET /stores/my-store
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "id": "cuid...",
    "name": "Toko Laut Nusantara",
    "description": "Menjual hasil laut segar."
  }
}
```

#### 6. Products (Seller)

##### Create Product

```http
POST /products/seller
```

**Request Body:**

```json
{
  "name": "Udang Tiger",
  "description": "Udang segar per kg.",
  "price": 120000,
  "stock": 100,
  "imageUrl": null
}
```

**Response Success (201):**

```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "id": "cuid...",
    "name": "Udang Tiger",
    "price": 120000,
    "stock": 100
  }
}
```

##### Update Product

```http
PUT /products/seller/:id
```

**Request Body:**

```json
{
  "name": "Udang Tiger Premium",
  "price": 125000,
  "stock": 150
}
```

##### Delete Product

```http
DELETE /products/seller/:id
```

##### Get My Products

```http
GET /products/seller/my-products
```

#### 7. Wallets (Buyer)

##### Get Wallet Details

```http
GET /wallets/my-wallet
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "id": "cuid...",
    "balance": 150000,
    "transactions": [
      {
        "id": "cuid...",
        "amount": 150000,
        "type": "TOP_UP",
        "description": "Dummy top up",
        "createdAt": "2026-06-17T02:00:00.000Z"
      }
    ]
  }
}
```

##### Top Up Wallet

```http
POST /wallets/top-up
```

**Request Body:**

```json
{
  "amount": 150000
}
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Wallet topped up successfully",
  "data": {
    "balance": 150000
  }
}
```

#### 8. Addresses (Buyer)

##### Create Address

```http
POST /addresses
```

**Request Body:**

```json
{
  "title": "Rumah",
  "recipientName": "John Doe",
  "phoneNumber": "08123456789",
  "fullAddress": "Jl. Raya No. 123, Jakarta"
}
```

##### Get All Addresses

```http
GET /addresses
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "cuid...",
      "title": "Rumah",
      "recipientName": "John Doe",
      "phoneNumber": "08123456789",
      "fullAddress": "Jl. Raya No. 123, Jakarta",
      "isDefault": true
    }
  ]
}
```

#### 9. Carts (Buyer)

##### Get Cart Summary

```http
GET /carts
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "id": "cuid...",
    "storeId": "cuid...",
    "subtotal": 85000,
    "items": [
      {
        "id": "cuid...",
        "productId": "cuid...",
        "quantity": 1,
        "product": {
          "name": "Ikan Tuna Segar",
          "price": 85000,
          "imageUrl": null
        }
      }
    ]
  }
}
```

##### Add/Update Cart Item

```http
POST /carts/items
```

**Request Body:**

```json
{
  "productId": "cuid...",
  "quantity": 2
}
```

> **Catatan**: Jika produk berasal dari toko yang berbeda dengan isi cart saat ini, request akan ditolak (400 Bad Request) untuk menjaga aturan _Single-Store Checkout_.

#### 10. Orders (Buyer & Seller)

##### Get Checkout Summary (Buyer)

```http
POST /orders/summary
```

**Request Body:**

```json
{
  "addressId": "cuid...",
  "deliveryMethod": "NEXT_DAY"
}
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "subtotal": 85000,
    "deliveryFee": 30000,
    "tax": 10200,
    "total": 125200
  }
}
```

##### Create Order / Checkout (Buyer)

```http
POST /orders
```

**Request Body:**

```json
{
  "addressId": "cuid...",
  "deliveryMethod": "NEXT_DAY"
}
```

**Response Success (201):**

```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "id": "cuid...",
    "status": "PACKING",
    "subtotal": 85000,
    "deliveryFee": 30000,
    "tax": 10200,
    "total": 125200
  }
}
```

##### Process Order (Seller)

```http
PATCH /orders/seller/:id/process
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Order processed successfully",
  "data": {
    "id": "cuid...",
    "status": "WAITING_FOR_DRIVER"
  }
}
```

#### 11. Discounts (Admin)

##### Create Voucher

```http
POST /discounts/vouchers
```

**Request Body:**

```json
{
  "code": "SUMMER10K",
  "discountAmount": 10000,
  "expiryDate": "2024-12-31T23:59:59.000Z",
  "remainingUsage": 100
}
```

**Response Success (201):**

```json
{
  "status": "success",
  "data": {
    "voucher": {
      "id": "cuid...",
      "code": "SUMMER10K",
      "discountAmount": 10000,
      "remainingUsage": 100
    }
  }
}
```

#### 12. Reports

##### Get Buyer Spending Report

```http
GET /reports/buyer/spending
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "totalSpent": 1500000,
    "orders": [
      {
        "id": "cuid...",
        "total": 250000,
        "createdAt": "2024-03-15T10:00:00.000Z"
      }
    ]
  }
}
```

##### Get Seller Income Report

```http
GET /reports/seller/income
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "totalIncome": 5000000,
    "orders": [
      {
        "id": "cuid...",
        "subtotal": 100000,
        "createdAt": "2024-03-15T10:00:00.000Z"
      }
    ]
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
const authenticate = require("./middlewares/auth.middleware");
const authorize = require("./middlewares/role.middleware");

// Hanya user dengan active role SELLER yang bisa akses
router.get(
  "/seller/dashboard",
  authenticate,
  authorize("SELLER"),
  sellerController.dashboard,
);

// ADMIN atau SELLER bisa akses
router.get(
  "/products",
  authenticate,
  authorize("ADMIN", "SELLER"),
  productController.list,
);
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

| Variable               | Description                    | Example                                         |
| ---------------------- | ------------------------------ | ----------------------------------------------- |
| DATABASE_URL           | PostgreSQL connection string   | postgres://user:pass@localhost:5432/seapedia_db |
| PORT                   | Server port                    | 8000                                            |
| NODE_ENV               | Environment mode               | development                                     |
| JWT_ACCESS_SECRET      | Secret key untuk access token  | your_access_secret_here                         |
| JWT_REFRESH_SECRET     | Secret key untuk refresh token | your_refresh_secret_here                        |
| JWT_ACCESS_EXPIRATION  | Access token expiration        | 15m                                             |
| JWT_REFRESH_EXPIRATION | Refresh token expiration       | 7d                                              |
| BCRYPT_SALT_ROUNDS     | Salt rounds for bcrypt hashing | 12                                              |

## 📖 Business Rules & Logics

### 1. Behavior Single-Store Checkout

Sistem keranjang (Cart) dirancang dengan model **Single-Store Checkout** yang artinya:

- Pembeli (Buyer) hanya bisa memiliki produk dari **SATU toko (Store) yang sama** di dalam keranjang belanja pada satu waktu.
- Jika keranjang sudah berisi produk dari Toko A, lalu Buyer mencoba memasukkan produk dari Toko B, maka sistem akan menolak (Return 400 Bad Request) dan menyarankan agar keranjang dikosongkan/di-checkout terlebih dahulu.
- Aturan ini diterapkan agar ongkos kirim (Delivery Fee) dan penugasan Driver (Delivery Job) bisa dilakukan dalam rute tunggal dari 1 titik asal ke titik tujuan.

### 2. Aturan Kombinasi Diskon & Perhitungan Pajak (PPN 12%)

Saat Checkout (baik di endpoint `/orders/summary` maupun `/orders`), perhitungannya mematuhi tata urutan berikut:

1. **Subtotal**: Jumlah seluruh harga produk dikali kuantitasnya di keranjang.
2. **Diskon**:
   - Jika ada **Promo** (Otomatis dipakai jika kondisi terpenuhi): Memotong persentase % dari Subtotal.
   - Jika ada **Voucher** (Manual input kode): Memotong persentase % atau nominal flat dari _(Subtotal - Potongan Promo)_.
   - **Limitasi**: Promo dan Voucher **BISA** dikombinasikan (ditumpuk).
3. **Pajak (Tax 12%)**:
   - Pajak sebesar 12% dihitung dari **Subtotal SETELAH DIPOTONG Diskon**. (Contoh: `0.12 * (Subtotal - Promo Discount - Voucher Discount)`)
4. **Delivery Fee**: Biaya pengiriman berdasarkan tipe pengiriman (`INSTANT`: Rp 50.000, `NEXT_DAY`: Rp 20.000, `REGULAR`: Rp 15.000).
5. **Total Biaya**: `(Subtotal - Diskon Promo - Diskon Voucher) + Pajak (12%) + Delivery Fee`

### 3. Aturan Driver Earning (Penghasilan Driver)

- Order yang selesai dikirim (Driver menekan `status: COMPLETED` pada endpoint Delivery), maka **100% Delivery Fee** dari pesanan tersebut akan langsung ditambahkan secara utuh ke saldo Wallet Driver. Seapedia tidak memotong komisi dari Delivery Fee.

### 4. Overdue SLA & Simulasi Waktu

Setiap pesanan yang masuk ke proses `PACKING`, `WAITING_FOR_DRIVER`, dan `DELIVERING` memiliki batas waktu (SLA / Service Level Agreement) otomatisasi batal:

- **INSTANT**: 1 Hari (1x24 Jam)
- **NEXT_DAY**: 2 Hari (2x24 Jam)
- **REGULAR**: 7 Hari (7x24 Jam)

Jika lewat batas tersebut, admin dapat memicu `POST /api/admin/overdue/process`:

- Status order otomatis berubah menjadi **RETURNED**.
- Saldo (Total Biaya) akan **dikembalikan 100% (Refund) ke Wallet Buyer**.
- Stok barang akan kembali ke Toko.
- Tugas _driver_ (jika ada) akan berstatus `COMPLETED` tanpa membatalkan akun driver.

**Simulasi Waktu (Time Simulation)**:
Karena menunggu SLA untuk pengetesan terlalu lama, Backend menyediakan utility in-memory time offset pada endpoint `/api/admin/simulate-day`. Admin dapat menambahkan "+3 Hari" ke memori server. Hal ini akan menggeser jarum jam internal Seapedia tanpa mengubah waktu sistem PC/Server betulan, sehingga _cron job/overdue processor_ mengira batas SLA telah lewat.

## 🛡️ Security Measures

Aplikasi SEAPEDIA dikeraskan (Hardened) terhadap berbagai kerentanan keamanan:

1. **SQL Injection Prevention**: Seluruh akses database dieksekusi melalui **Prisma ORM** yang mengabstraksi query dan memisahkan paramerization. Prisma melarang query text secara langsung (tanpa _raw_) yang menjadi celah utama SQL Injection.
2. **Cross-Site Scripting (XSS) Prevention**: Semua payload inputan yang ditampilkan ke ranah publik (misal: Komentar di Review Aplikasi, Nama Produk, Deskripsi Produk, Nama Toko, Deskripsi Toko) di-escape secara eksplisit menggunakan custom `escapeHtml` utility sebelum disimpan ke database, menghilangkan efek perenderan tag `<script>`.
3. **Input Validation**: Seluruh interaksi API tervalidasi sangat ketat di level Router menggunakan ekosistem `express-validator` sebelum menyentuh Controller. Contoh: Harga tidak boleh negatif, email harus valid, rating wajib 1-5.
4. **Session Management (Logout & Revocation)**: Logout tidak hanya menghapus JWT token dari _client-side_, tetapi menghapus baris `refreshToken` di tabel database yang membuat upaya login dari device lama tidak akan bisa diperbarui (Revoked).
5. **RBAC Hardening**: Middleware `authorize('ROLE')` memastikan perizinan peran tidak memanipulasi _query_. Active Role dilampirkan langsung secara _cryptographically-signed_ dalam payload _Access Token_.
6. **Resource Ownership Isolation**: Buyer A tidak akan pernah bisa mengakses riwayat Order Buyer B (diatur di `order.service.js`), begitu pula Seller tidak dapat menghapus Product dari etalase Seller lain.

## 🧪 E2E Demo & Testing Guide

Untuk mendemonstrasikan keseluruhan ekosistem Seapedia, lakukan flow berikut menggunakan klien sejenis Postman/Thunder Client:

1. **Jalankan Uji Otomatis (100% Pass)**:
   ```bash
   npm run test
   ```
2. **Jalankan Seeder (Demo Data)**:
   ```bash
   npx prisma db seed
   ```
3. **Mulai Perjalanan sebagai Buyer**: Login dengan `buyer@seapedia.com`, catat token. Buat Alamat `POST /addresses`, Top-up dompet `POST /wallets/top-up`.
4. **Checkout Single-Store**: Tambahkan produk demo ke keranjang `POST /carts/items`, dan lakukan Checkout `POST /orders` menggunakan opsi INSTANT.
5. **Proses sebagai Seller**: Login dengan `seller@seapedia.com`, panggil `PATCH /orders/seller/:id/process` agar status menjadi `WAITING_FOR_DRIVER`.
6. **Ekspedisi sebagai Driver**: Login dengan `driver@seapedia.com`, cari job `GET /deliveries/available`, ambil job `POST /deliveries/:id/take`, dan ubah status hingga `COMPLETED`. Pastikan Wallet driver Anda sekarang berisi Rp 50.000.
7. **Simulasi Overdue Admin**: Login dengan `admin@seapedia.com`. Lakukan lompatan waktu 3 hari kedepan menggunakan `POST /api/admin/simulate-day`. Kemudian jalankan `POST /api/admin/overdue/process`. Periksa endpoint Dashboard untuk membuktikan ada order yang RETURNED dan direfund.
