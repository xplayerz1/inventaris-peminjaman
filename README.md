# 📦 Sistem Inventaris dan Peminjaman Barang

Aplikasi web untuk mengelola inventaris barang dan proses peminjaman dengan fitur chat real-time antara pengguna dan admin.

## 🌟 Fitur Utama

### Untuk User

- **Register & Login** - Daftar akun baru atau masuk dengan akun yang sudah ada
- **Browse Items** - Melihat daftar barang yang tersedia untuk dipinjam
- **Request Loan** - Mengajukan permintaan peminjaman barang
- **My Loans** - Melihat status dan riwayat peminjaman
- **Chat with Admin** - Berkomunikasi langsung dengan admin

### Untuk Admin

- **Manage Items** - Tambah, edit, dan hapus barang inventaris
- **Pending Requests** - Menyetujui atau menolak permintaan peminjaman
- **Active Loans** - Menandai barang yang sudah dikembalikan
- **Loan History** - Melihat seluruh riwayat peminjaman per user
- **Chat Inbox** - Merespons pesan dari pengguna

## 🛠️ Teknologi

| Layer     | Teknologi                                          |
| --------- | -------------------------------------------------- |
| Frontend  | React 18, Vite, TailwindCSS, Apollo Client         |
| Backend   | Node.js, Express, Apollo Server, GraphQL           |
| Database  | PostgreSQL 15 (2 database: auth_db & inventory_db) |
| Container | Docker & Docker Compose                            |

## 📋 Alur Penggunaan

### Alur User

```
1. Register/Login
        ↓
2. Browse Items (lihat barang tersedia)
        ↓
3. Request Loan (pilih tanggal pinjam & kembali)
        ↓
4. Tunggu Approval dari Admin
        ↓
5. Status: Approved → Active (barang dipinjam)
        ↓
6. Kembalikan barang ke Admin
        ↓
7. Status: Returned
```

### Alur Admin

```
1. Login
        ↓
2. Cek Pending Requests
        ↓
3. Approve/Reject permintaan
        ↓
4. Monitor Active Loans
        ↓
5. Mark as Returned ketika barang dikembalikan
```

## 🚀 Instalasi dengan Docker

### Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) terinstall dan running
- Git (untuk clone repository)

### Langkah Instalasi

#### 1. Clone Repository

```bash
git clone https://github.com/ZIKK23/Edu-connect.git
cd inventaris-peminjaman
```

#### 2. Setup Environment File

```bash
# Copy file environment template
cp .env.example .env
```

File `.env` sudah berisi konfigurasi default yang siap digunakan.

#### 3. Jalankan Docker Compose

```bash
docker-compose up -d --build
```

Perintah ini akan:

- Build dan jalankan 4 container (auth_db, inventory_db, backend, frontend)
- Setup database PostgreSQL dengan schema dan seed data secara otomatis
- Menjalankan aplikasi

#### 4. Tunggu Hingga Selesai

Proses pertama kali memakan waktu 2-5 menit. Cek status dengan:

```bash
docker-compose ps
```

Semua container harus berstatus `Up` atau `healthy`.

#### 5. Akses Aplikasi

- **Frontend:** http://localhost:8000
- **Backend GraphQL:** http://localhost:4001/graphql

## 👤 Akun Default

| Role   | Email                | Password |
| ------ | -------------------- | -------- |
| Admin  | admin@inventaris.com | admin123 |
| User 1 | user1@example.com    | admin123 |
| User 2 | user2@example.com    | admin123 |
| User 3 | user3@example.com    | admin123 |

## 🔧 Perintah Docker Berguna

```bash
# Jalankan semua container
docker-compose up -d

# Stop semua container
docker-compose down

# Lihat logs backend
docker logs inventaris-backend --tail 50

# Lihat logs frontend
docker logs inventaris-frontend --tail 50

# Rebuild setelah perubahan code
docker-compose up -d --build

# Reset database (hapus semua data)
docker-compose down -v
docker-compose up -d --build
```

## 📁 Struktur Project

```
inventaris-peminjaman/
├── backend/               # Node.js + GraphQL server
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── resolvers/     # GraphQL resolvers
│   │   ├── schema/        # GraphQL type definitions
│   │   └── middleware/    # Auth middleware
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts (Auth, Toast)
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
│   ├── Dockerfile
│   └── package.json
├── database/              # Database files
│   ├── auth-schema.sql    # Auth DB schema
│   ├── auth-seed.sql      # Auth DB seed data
│   ├── inventory-schema.sql # Inventory DB schema
│   └── inventory-seed.sql # Inventory DB seed data
├── .env.example           # Environment template
├── docker-compose.yml     # Docker orchestration
└── README.md              # This file
```

## 🔐 Environment Variables

Edit file `.env` untuk konfigurasi:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres123

# Ports
BACKEND_PORT=4001
FRONTEND_PORT=8000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-me
```

## ❓ Troubleshooting

### Container tidak mau start

```bash
# Cek logs untuk error
docker-compose logs

# Restart semua
docker-compose down
docker-compose up -d --build
```

### Database connection error

```bash
# Pastikan database container healthy
docker-compose ps

# Tunggu sampai status: healthy (bisa 30-60 detik)
```

### Port sudah digunakan

Edit port di `.env`:

```env
BACKEND_PORT=4002
FRONTEND_PORT=8001
```

### Fresh install tidak bisa login

Database schema dan seed sudah otomatis dijalankan saat container pertama kali dibuat. Jika ada masalah:

```bash
# Reset total
docker-compose down -v
docker-compose up -d --build
```

---

**Dibuat dengan ❤️ menggunakan React, Node.js, GraphQL, dan PostgreSQL**
