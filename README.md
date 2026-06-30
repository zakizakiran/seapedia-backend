# Seapedia Backend

Backend API untuk platform SEAPEDIA — marketplace seafood yang menghubungkan Seller, Buyer, dan Driver.

## ✨ Features

- 🔐 **Authentication & Authorization** - JWT-based authentication dengan access token dan refresh token
- 👥 **Multi-Role System** - Satu user non-admin bisa memiliki lebih dari satu role (Seller, Buyer, Driver), dan bisa menambah role baru setelah registrasi
- 🔄 **Active Role Selection** - User wajib memilih active role untuk mengakses dashboard privat
- 👤 **User Management** - User registration, login, profile management dengan financial summary
- 🛡️ **Role-Based Access Control** - Protected endpoints berdasarkan **active role**, bukan sekadar daftar role
- 🏪 **Store Management** - Seller bisa membuat dan mengelola toko (maks. 1 toko per seller)
- 🛒 **Public Marketplace** - Katalog produk & toko publik dengan search, filter, dan pagination
- 🛍️ **Shopping Cart** - Keranjang belanja dengan aturan single-store checkout
- 💳 **Wallet System** - Dompet digital untuk buyer dengan top-up dan riwayat transaksi
- 📍 **Address Management** - Kelola alamat pengiriman buyer (CRUD + set default)
- 📦 **Order System** - Checkout, order management untuk buyer & seller, process order
- 🏷️ **Discount System** - Voucher dan promo diskon yang bisa dikombinasikan (Admin)
- 🚚 **Delivery System** - Driver bisa mengambil dan menyelesaikan job pengiriman
- 🛡️ **Admin Dashboard** - Monitoring seluruh ekosistem, simulasi waktu, proses overdue
- 📊 **Reports** - Laporan pengeluaran buyer dan pemasukan seller
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
- User bisa **menambah role baru** setelah registrasi via endpoint `POST /api/auth/add-role`.
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

> **Penting**: Semua endpoint di bawah ini menggunakan prefix `/api`. Contoh: endpoint `/auth/register` berarti URL lengkapnya adalah `http://localhost:8000/api/auth/register`.

### Endpoints Overview

| Category              | Endpoint                            | Method | Auth           | Description                                            |
| --------------------- | ----------------------------------- | ------ | -------------- | ------------------------------------------------------ |
| **General**           | `/api/health`                       | GET    | ❌             | Check API health status                                |
| **Authentication**    | `/api/auth/register`                | POST   | ❌             | Register new user dengan multi-role                    |
|                       | `/api/auth/login`                   | POST   | ❌             | User login                                             |
|                       | `/api/auth/select-role`             | POST   | ✅             | Pilih active role                                      |
|                       | `/api/auth/add-role`                | POST   | ✅             | Tambah role baru ke akun                               |
|                       | `/api/auth/refresh-token`           | POST   | ❌             | Refresh access token                                   |
|                       | `/api/auth/logout`                  | DELETE | ✅             | User logout                                            |
|                       | `/api/auth/profile`                 | GET    | ✅             | Get user profile + financial summary                   |
| **Stores (Public)**   | `/api/stores`                       | GET    | ❌             | Public store listing (search, pagination)              |
|                       | `/api/stores/:id`                   | GET    | ❌             | Public store detail                                    |
| **Stores (Seller)**   | `/api/stores/seller`                | POST   | ✅ (SELLER)    | Buat profil toko (maks. 1 per seller)                  |
|                       | `/api/stores/seller`                | PUT    | ✅ (SELLER)    | Update nama dan deskripsi toko                         |
|                       | `/api/stores/seller/my-store`       | GET    | ✅ (SELLER)    | Tarik informasi toko milik seller                      |
| **Products (Public)** | `/api/products`                     | GET    | ❌             | Public product listing (search, filter, pagination)    |
|                       | `/api/products/:id`                 | GET    | ❌             | Public product detail dengan info toko                 |
| **Products (Seller)** | `/api/products/seller`              | POST   | ✅ (SELLER)    | Tambah produk ke toko                                  |
|                       | `/api/products/seller/:id`          | PUT    | ✅ (SELLER)    | Update produk (hanya milik seller tersebut)            |
|                       | `/api/products/seller/:id`          | DELETE | ✅ (SELLER)    | Hapus produk                                           |
|                       | `/api/products/seller/my-products`  | GET    | ✅ (SELLER)    | List semua produk milik toko seller                    |
| **Reviews**           | `/api/reviews`                      | GET    | ❌             | List application reviews (sort, pagination)            |
|                       | `/api/reviews`                      | POST   | ❌             | Submit application review (guest atau logged-in)       |
| **Wallets**           | `/api/wallets`                      | GET    | ✅ (BUYER)     | Lihat balance dan riwayat transaksi dompet             |
|                       | `/api/wallets/top-up`               | POST   | ✅ (BUYER)     | Dummy top-up balance wallet                            |
| **Addresses**         | `/api/addresses`                    | POST   | ✅ (BUYER)     | Tambah alamat pengiriman baru                          |
|                       | `/api/addresses`                    | GET    | ✅ (BUYER)     | List semua alamat milik buyer                          |
|                       | `/api/addresses/:id`                | GET    | ✅ (BUYER)     | Detail alamat tertentu                                 |
|                       | `/api/addresses/:id`                | PUT    | ✅ (BUYER)     | Update alamat                                          |
|                       | `/api/addresses/:id`                | DELETE | ✅ (BUYER)     | Hapus alamat                                           |
|                       | `/api/addresses/:id/default`        | PUT    | ✅ (BUYER)     | Jadikan alamat sebagai default utama                   |
| **Carts**             | `/api/carts`                        | GET    | ✅ (BUYER)     | Lihat isi keranjang dan subtotal                       |
|                       | `/api/carts/items`                  | POST   | ✅ (BUYER)     | Tambah produk atau update kuantitas di keranjang       |
|                       | `/api/carts/items/:productId`       | DELETE | ✅ (BUYER)     | Hapus produk tertentu dari keranjang                   |
|                       | `/api/carts`                        | DELETE | ✅ (BUYER)     | Kosongkan seluruh isi keranjang                        |
| **Orders**            | `/api/orders/summary`               | POST   | ✅ (BUYER)     | Dapatkan rincian harga sebelum konfirmasi checkout     |
|                       | `/api/orders`                       | POST   | ✅ (BUYER)     | Proses checkout dan buat pesanan baru                  |
|                       | `/api/orders/buyer`                 | GET    | ✅ (BUYER)     | Lihat daftar pesanan yang pernah dibuat buyer          |
|                       | `/api/orders/buyer/:id`             | GET    | ✅ (BUYER)     | Lihat detail suatu pesanan buyer                       |
|                       | `/api/orders/seller`                | GET    | ✅ (SELLER)    | Lihat daftar pesanan masuk ke toko seller              |
|                       | `/api/orders/seller/:id`            | GET    | ✅ (SELLER)    | Lihat detail pesanan yang masuk ke toko seller         |
|                       | `/api/orders/seller/:id/process`    | PATCH  | ✅ (SELLER)    | Proses status order dari PACKING ke WAITING_FOR_DRIVER |
| **Discounts**         | `/api/discounts/vouchers`           | POST   | ✅ (ADMIN)     | Buat voucher diskon                                    |
|                       | `/api/discounts/vouchers`           | GET    | ✅ (ADMIN)     | List semua voucher diskon                              |
|                       | `/api/discounts/vouchers/:id`       | GET    | ✅ (ADMIN)     | Detail voucher diskon                                  |
|                       | `/api/discounts/promos`             | POST   | ✅ (ADMIN)     | Buat promo diskon                                      |
|                       | `/api/discounts/promos`             | GET    | ✅ (ADMIN)     | List semua promo diskon                                |
|                       | `/api/discounts/promos/:id`         | GET    | ✅ (ADMIN)     | Detail promo diskon                                    |
| **Deliveries**        | `/api/deliveries/dashboard`         | GET    | ✅ (DRIVER)    | Dashboard driver (ringkasan pekerjaan)                 |
|                       | `/api/deliveries/available`         | GET    | ✅ (DRIVER)    | List job pengiriman yang tersedia                      |
|                       | `/api/deliveries/jobs/:id`          | GET    | ✅ (DRIVER)    | Detail job pengiriman                                  |
|                       | `/api/deliveries/jobs/:orderId/take`| POST   | ✅ (DRIVER)    | Ambil job pengiriman                                   |
|                       | `/api/deliveries/jobs/:id/complete` | PATCH  | ✅ (DRIVER)    | Selesaikan job pengiriman                              |
| **Admin**             | `/api/admin/dashboard`              | GET    | ✅ (ADMIN)     | Dashboard statistik admin                              |
|                       | `/api/admin/users`                  | GET    | ✅ (ADMIN)     | List semua user                                        |
|                       | `/api/admin/orders`                 | GET    | ✅ (ADMIN)     | List semua order                                       |
|                       | `/api/admin/overdue-orders`         | GET    | ✅ (ADMIN)     | List order yang sudah overdue                          |
|                       | `/api/admin/stores`                 | GET    | ✅ (ADMIN)     | List semua toko                                        |
|                       | `/api/admin/products`               | GET    | ✅ (ADMIN)     | List semua produk                                      |
|                       | `/api/admin/delivery-jobs`          | GET    | ✅ (ADMIN)     | List semua delivery job                                |
|                       | `/api/admin/overdue/process`        | POST   | ✅ (ADMIN)     | Proses order overdue (refund & return)                 |
|                       | `/api/admin/simulate-day`           | POST   | ✅ (ADMIN)     | Simulasi lompatan waktu                                |
|                       | `/api/admin/simulate-day/reset`     | POST   | ✅ (ADMIN)     | Reset simulasi waktu ke real time                      |
|                       | `/api/admin/time-info`              | GET    | ✅ (ADMIN)     | Info offset waktu simulasi                             |
| **Reports**           | `/api/reports/buyer/spending`       | GET    | ✅ (BUYER)     | Laporan total pengeluaran buyer                        |
|                       | `/api/reports/seller/income`        | GET    | ✅ (SELLER)    | Laporan total pemasukan seller                         |

---

### Endpoints

#### 1. General

##### Health Check

```http
GET /api/health
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "API is running well"
}
```

---

#### 2. Authentication

##### Register User

```http
POST /api/auth/register
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
POST /api/auth/login
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

> **Catatan**: Jika `requiresRoleSelection` bernilai `true`, user harus memanggil endpoint `POST /api/auth/select-role` sebelum mengakses endpoint yang dilindungi oleh role tertentu.

##### Select Active Role

```http
POST /api/auth/select-role
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

##### Add Role

```http
POST /api/auth/add-role
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "role": "SELLER"
}
```

> **Catatan**: Role yang bisa ditambahkan: `SELLER`, `BUYER`, `DRIVER`. Role `ADMIN` tidak bisa ditambahkan. Role yang sudah dimiliki tidak bisa ditambahkan ulang.

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Role 'SELLER' added and set as active role",
  "data": {
    "activeRole": "SELLER",
    "roles": ["BUYER", "SELLER"],
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Refresh Token

```http
POST /api/auth/refresh-token
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
DELETE /api/auth/logout
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
GET /api/auth/profile
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

> **Catatan**: `financialSummary` menampilkan data sesuai role yang dimiliki user.

---

#### 3. Stores (Public)

##### List Stores

```http
GET /api/stores?page=1&limit=12&search=laut
```

**Query Parameters:**

| Parameter | Type   | Default | Description                     |
| --------- | ------ | ------- | ------------------------------- |
| page      | number | 1       | Halaman pagination              |
| limit     | number | 12      | Jumlah toko per halaman         |
| search    | string | —       | Cari berdasarkan nama toko      |

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "stores": [
      {
        "id": "cuid...",
        "name": "Toko Laut Nusantara",
        "description": "Menjual hasil laut segar...",
        "createdAt": "2026-06-17T02:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

##### Store Detail

```http
GET /api/stores/:id
```

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "store": {
      "id": "cuid...",
      "name": "Toko Laut Nusantara",
      "description": "Menjual hasil laut segar...",
      "createdAt": "2026-06-17T02:00:00.000Z"
    }
  }
}
```

---

#### 4. Products (Public)

##### List Products

```http
GET /api/products?page=1&limit=12&search=udang&storeId=cuid...&category=segar
```

**Query Parameters:**

| Parameter | Type   | Default | Description                            |
| --------- | ------ | ------- | -------------------------------------- |
| page      | number | 1       | Halaman pagination                     |
| limit     | number | 12      | Jumlah produk per halaman              |
| search    | string | —       | Cari berdasarkan nama/deskripsi produk |
| storeId   | string | —       | Filter produk berdasarkan toko         |
| category  | string | —       | Filter produk berdasarkan kategori     |

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
        "category": null,
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
GET /api/products/:id
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
      "category": null,
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

---

#### 5. Application Reviews (Public)

> Review adalah tentang **pengalaman website/aplikasi SEAPEDIA**, bukan tentang produk/order spesifik. Guest (tanpa akun) maupun user yang sudah login boleh submit review.

##### List Reviews

```http
GET /api/reviews?page=1&limit=10&sort=newest
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
POST /api/reviews
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

---

#### 6. Stores (Seller)

##### Create Store

```http
POST /api/stores/seller
```

**Headers:**

```
Authorization: Bearer <access_token>
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
    "store": {
      "id": "cuid...",
      "name": "Toko Laut Nusantara",
      "description": "Menjual hasil laut segar."
    }
  }
}
```

##### Update Store

```http
PUT /api/stores/seller
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Toko Laut Nusantara Baru",
  "description": "Menjual hasil laut segar dan olahan."
}
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Store updated successfully",
  "data": {
    "store": {
      "id": "cuid...",
      "name": "Toko Laut Nusantara Baru",
      "description": "Menjual hasil laut segar dan olahan."
    }
  }
}
```

##### Get My Store

```http
GET /api/stores/seller/my-store
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
    "store": {
      "id": "cuid...",
      "name": "Toko Laut Nusantara",
      "description": "Menjual hasil laut segar."
    }
  }
}
```

---

#### 7. Products (Seller)

##### Create Product

```http
POST /api/products/seller
```

**Headers:**

```
Authorization: Bearer <access_token>
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
    "product": {
      "id": "cuid...",
      "name": "Udang Tiger",
      "price": 120000,
      "stock": 100
    }
  }
}
```

##### Update Product

```http
PUT /api/products/seller/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Udang Tiger Premium",
  "price": 125000,
  "stock": 150
}
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "product": {
      "id": "cuid...",
      "name": "Udang Tiger Premium",
      "price": 125000,
      "stock": 150
    }
  }
}
```

##### Delete Product

```http
DELETE /api/products/seller/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

##### Get My Products

```http
GET /api/products/seller/my-products?page=1&limit=12&search=udang
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                    |
| --------- | ------ | ------- | ------------------------------ |
| page      | number | 1       | Halaman pagination             |
| limit     | number | 12      | Jumlah produk per halaman      |
| search    | string | —       | Cari berdasarkan nama produk   |

---

#### 8. Wallets (Buyer)

##### Get Wallet Details

```http
GET /api/wallets
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
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
POST /api/wallets/top-up
```

**Headers:**

```
Authorization: Bearer <access_token>
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
  "success": true,
  "message": "Wallet topped up successfully",
  "data": {
    "balance": 150000
  }
}
```

---

#### 9. Addresses (Buyer)

##### Create Address

```http
POST /api/addresses
```

**Headers:**

```
Authorization: Bearer <access_token>
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

**Response Success (201):**

```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "id": "cuid...",
    "title": "Rumah",
    "recipientName": "John Doe",
    "phoneNumber": "08123456789",
    "fullAddress": "Jl. Raya No. 123, Jakarta",
    "isDefault": true
  }
}
```

##### Get All Addresses

```http
GET /api/addresses
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
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

##### Get Address by ID

```http
GET /api/addresses/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "cuid...",
    "title": "Rumah",
    "recipientName": "John Doe",
    "phoneNumber": "08123456789",
    "fullAddress": "Jl. Raya No. 123, Jakarta",
    "isDefault": true
  }
}
```

##### Update Address

```http
PUT /api/addresses/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Kantor",
  "recipientName": "John Doe",
  "phoneNumber": "08123456789",
  "fullAddress": "Jl. Sudirman No. 456, Jakarta"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": "cuid...",
    "title": "Kantor",
    "recipientName": "John Doe",
    "phoneNumber": "08123456789",
    "fullAddress": "Jl. Sudirman No. 456, Jakarta",
    "isDefault": true
  }
}
```

##### Delete Address

```http
DELETE /api/addresses/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

##### Set Default Address

```http
PUT /api/addresses/:id/default
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Default address updated successfully",
  "data": {
    "id": "cuid...",
    "title": "Rumah",
    "isDefault": true
  }
}
```

---

#### 10. Carts (Buyer)

##### Get Cart Summary

```http
GET /api/carts
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
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
POST /api/carts/items
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "productId": "cuid...",
  "quantity": 2
}
```

> **Catatan**: Jika produk berasal dari toko yang berbeda dengan isi cart saat ini, request akan ditolak (400 Bad Request) untuk menjaga aturan _Single-Store Checkout_.

##### Remove Cart Item

```http
DELETE /api/carts/items/:productId
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Clear Cart

```http
DELETE /api/carts
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

#### 11. Orders (Buyer & Seller)

##### Get Checkout Summary (Buyer)

```http
POST /api/orders/summary
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "addressId": "cuid...",
  "deliveryMethod": "NEXT_DAY",
  "discountCode": "SUMMER10K"
}
```

> **Catatan**: Field `discountCode` bersifat opsional. Jika diisi, sistem akan mencari voucher atau promo aktif yang sesuai dengan kode tersebut.

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "subtotal": 85000,
    "deliveryFee": 20000,
    "discount": 10000,
    "tax": 9000,
    "total": 104000
  }
}
```

##### Create Order / Checkout (Buyer)

```http
POST /api/orders
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "addressId": "cuid...",
  "deliveryMethod": "NEXT_DAY",
  "discountCode": "SUMMER10K"
}
```

> **Catatan**: Field `discountCode` bersifat opsional. Delivery method yang tersedia: `INSTANT`, `NEXT_DAY`, `REGULAR`.

**Response Success (201):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "cuid...",
    "status": "PACKING",
    "subtotal": 85000,
    "deliveryFee": 20000,
    "discount": 10000,
    "tax": 9000,
    "total": 104000
  }
}
```

##### Get Buyer Orders

```http
GET /api/orders/buyer
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Get Buyer Order Detail

```http
GET /api/orders/buyer/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Get Seller Orders

```http
GET /api/orders/seller
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Get Seller Order Detail

```http
GET /api/orders/seller/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Process Order (Seller)

```http
PATCH /api/orders/seller/:id/process
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Order processed successfully",
  "data": {
    "id": "cuid...",
    "status": "WAITING_FOR_DRIVER"
  }
}
```

---

#### 12. Discounts (Admin)

##### Create Voucher

```http
POST /api/discounts/vouchers
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "code": "SUMMER10K",
  "discountAmount": 10000,
  "discountPercent": null,
  "expiryDate": "2026-12-31T23:59:59.000Z",
  "remainingUsage": 100
}
```

> **Catatan**: Voucher bisa memiliki `discountAmount` (nominal flat) ATAU `discountPercent` (persentase 0-100). Keduanya opsional tetapi salah satu harus diisi.

**Response Success (201):**

```json
{
  "status": "success",
  "message": "Voucher created successfully",
  "data": {
    "voucher": {
      "id": "cuid...",
      "code": "SUMMER10K",
      "discountAmount": 10000,
      "discountPercent": null,
      "remainingUsage": 100,
      "expiryDate": "2026-12-31T23:59:59.000Z"
    }
  }
}
```

##### List Vouchers

```http
GET /api/discounts/vouchers
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Get Voucher Detail

```http
GET /api/discounts/vouchers/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Create Promo

```http
POST /api/discounts/promos
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "code": "PROMO_NATAL",
  "discountAmount": null,
  "discountPercent": 10,
  "expiryDate": "2026-12-31T23:59:59.000Z"
}
```

> **Catatan**: Promo juga bisa memiliki `discountAmount` (nominal flat) ATAU `discountPercent` (persentase 0-100).

**Response Success (201):**

```json
{
  "status": "success",
  "message": "Promo created successfully",
  "data": {
    "promo": {
      "id": "cuid...",
      "code": "PROMO_NATAL",
      "discountAmount": null,
      "discountPercent": 10,
      "expiryDate": "2026-12-31T23:59:59.000Z"
    }
  }
}
```

##### List Promos

```http
GET /api/discounts/promos
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Get Promo Detail

```http
GET /api/discounts/promos/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

---

#### 13. Deliveries (Driver)

##### Get Driver Dashboard

```http
GET /api/deliveries/dashboard
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
    "totalJobs": 5,
    "completedJobs": 3,
    "activeJobs": 2,
    "totalEarnings": 150000
  }
}
```

##### Get Available Jobs

```http
GET /api/deliveries/available
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
    "jobs": [
      {
        "id": "cuid...",
        "deliveryMethod": "INSTANT",
        "deliveryFee": 50000,
        "status": "WAITING_FOR_DRIVER",
        "store": {
          "name": "Toko Laut Nusantara"
        },
        "address": {
          "fullAddress": "Jl. Raya No. 123, Jakarta"
        }
      }
    ]
  }
}
```

##### Get Job Detail

```http
GET /api/deliveries/jobs/:id
```

**Headers:**

```
Authorization: Bearer <access_token>
```

##### Take Job

```http
POST /api/deliveries/jobs/:orderId/take
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (201):**

```json
{
  "status": "success",
  "message": "Job taken successfully",
  "data": {
    "deliveryJob": {
      "id": "cuid...",
      "orderId": "cuid...",
      "driverId": "cuid...",
      "status": "TAKEN",
      "earnings": 50000
    }
  }
}
```

##### Complete Job

```http
PATCH /api/deliveries/jobs/:id/complete
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Job completed successfully",
  "data": {
    "deliveryJob": {
      "id": "cuid...",
      "status": "COMPLETED",
      "earnings": 50000
    }
  }
}
```

---

#### 14. Admin

##### Get Dashboard Stats

```http
GET /api/admin/dashboard
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
    "stats": {
      "totalUsers": 5,
      "totalStores": 2,
      "totalProducts": 10,
      "totalOrders": 3,
      "totalRevenue": 500000
    }
  }
}
```

##### Get All Users

```http
GET /api/admin/users
```

##### Get All Orders

```http
GET /api/admin/orders
```

##### Get Overdue Orders

```http
GET /api/admin/overdue-orders
```

##### Get All Stores

```http
GET /api/admin/stores
```

##### Get All Products

```http
GET /api/admin/products
```

##### Get All Delivery Jobs

```http
GET /api/admin/delivery-jobs
```

##### Process Overdue Orders

```http
POST /api/admin/overdue/process
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Processed 2 overdue orders",
  "data": {
    "processed": 2,
    "details": []
  }
}
```

##### Simulate Day (Advance Time)

```http
POST /api/admin/simulate-day
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "days": 3
}
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Time advanced by 3 day(s)",
  "data": {
    "simulatedTime": "2026-07-03T02:00:00.000Z",
    "offsetDays": 3,
    "offsetMs": 259200000
  }
}
```

##### Reset Simulated Time

```http
POST /api/admin/simulate-day/reset
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Success (200):**

```json
{
  "status": "success",
  "message": "Simulated time reset to real time",
  "data": {
    "simulatedTime": "2026-06-30T02:00:00.000Z",
    "offsetDays": 0,
    "offsetMs": 0
  }
}
```

##### Get Time Info

```http
GET /api/admin/time-info
```

**Headers:**

```
Authorization: Bearer <access_token>
```

---

#### 15. Reports

##### Get Buyer Spending Report

```http
GET /api/reports/buyer/spending
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
    "totalSpent": 1500000,
    "orders": [
      {
        "id": "cuid...",
        "total": 250000,
        "createdAt": "2026-06-15T10:00:00.000Z"
      }
    ]
  }
}
```

##### Get Seller Income Report

```http
GET /api/reports/seller/income
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
    "totalIncome": 5000000,
    "orders": [
      {
        "id": "cuid...",
        "subtotal": 100000,
        "createdAt": "2026-06-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

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

Saat Checkout (baik di endpoint `/api/orders/summary` maupun `/api/orders`), perhitungannya mematuhi tata urutan berikut:

1. **Subtotal**: Jumlah seluruh harga produk dikali kuantitasnya di keranjang.
2. **Diskon**:
   - Jika ada **Promo** (Otomatis dipakai jika kondisi terpenuhi): Memotong persentase % atau nominal flat dari Subtotal.
   - Jika ada **Voucher** (Manual input kode via `discountCode`): Memotong persentase % atau nominal flat dari _(Subtotal - Potongan Promo)_.
   - **Limitasi**: Promo dan Voucher **BISA** dikombinasikan (ditumpuk).
3. **Pajak (Tax 12%)**:
   - Pajak sebesar 12% dihitung dari **Subtotal SETELAH DIPOTONG Diskon**. (Contoh: `0.12 * (Subtotal - Promo Discount - Voucher Discount)`)
4. **Delivery Fee**: Biaya pengiriman berdasarkan tipe pengiriman (`INSTANT`: Rp 50.000, `NEXT_DAY`: Rp 20.000, `REGULAR`: Rp 15.000).
5. **Total Biaya**: `(Subtotal - Diskon Promo - Diskon Voucher) + Pajak (12%) + Delivery Fee`

### 3. Aturan Driver Earning (Penghasilan Driver)

- Order yang selesai dikirim (Driver menekan `status: COMPLETED` pada endpoint `PATCH /api/deliveries/jobs/:id/complete`), maka **100% Delivery Fee** dari pesanan tersebut akan langsung ditambahkan secara utuh ke saldo Wallet Driver. Seapedia tidak memotong komisi dari Delivery Fee.

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
Karena menunggu SLA untuk pengetesan terlalu lama, Backend menyediakan utility in-memory time offset pada endpoint `POST /api/admin/simulate-day`. Admin dapat menambahkan "+3 Hari" ke memori server. Hal ini akan menggeser jarum jam internal Seapedia tanpa mengubah waktu sistem PC/Server betulan, sehingga _cron job/overdue processor_ mengira batas SLA telah lewat. Untuk mereset simulasi waktu, gunakan `POST /api/admin/simulate-day/reset`.

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
3. **Mulai Perjalanan sebagai Buyer**: Login dengan `buyer@seapedia.com`, catat token. Buat Alamat `POST /api/addresses`, Top-up dompet `POST /api/wallets/top-up`.
4. **Checkout Single-Store**: Tambahkan produk demo ke keranjang `POST /api/carts/items`, dan lakukan Checkout `POST /api/orders` menggunakan opsi INSTANT.
5. **Proses sebagai Seller**: Login dengan `seller@seapedia.com`, panggil `PATCH /api/orders/seller/:id/process` agar status menjadi `WAITING_FOR_DRIVER`.
6. **Ekspedisi sebagai Driver**: Login dengan `driver@seapedia.com`, cari job `GET /api/deliveries/available`, ambil job `POST /api/deliveries/jobs/:orderId/take`, dan ubah status hingga `COMPLETED` via `PATCH /api/deliveries/jobs/:id/complete`. Pastikan Wallet driver Anda sekarang berisi Rp 50.000.
7. **Simulasi Overdue Admin**: Login dengan `admin@seapedia.com`. Lakukan lompatan waktu 3 hari kedepan menggunakan `POST /api/admin/simulate-day`. Kemudian jalankan `POST /api/admin/overdue/process`. Periksa endpoint `GET /api/admin/dashboard` untuk membuktikan ada order yang RETURNED dan direfund. Gunakan `POST /api/admin/simulate-day/reset` untuk mengembalikan waktu ke real time.
