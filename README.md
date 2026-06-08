# 📁 File Uploader

A full-stack cloud storage application inspired by Google Drive, built with **Node.js**, **Express**, **Prisma**, **PostgreSQL**, **Passport.js**, **Supabase Storage**, and **EJS**.

Users can securely upload, organize, manage, and share files through a clean file management interface with nested folder navigation and expiring public share links.

---

## 🔐 Overview

**File Uploader** is a personal cloud storage platform where authenticated users can:

- Upload files securely
- Organize files into folders
- Create nested folder structures
- Edit and manage files
- Download uploaded files
- View file metadata
- Share folders publicly through temporary links

Shared folders support:

- **Read-only access**
- **Nested folder traversal**
- **Secure file downloads**
- **Expiration-based access**
- **Scoped security boundaries**

---

## 🚀 Features

### Authentication & Sessions

- Session-based authentication using **Passport.js**
- Persistent login sessions using **Prisma Session Store**
- Secure password hashing with **bcrypt**
- Protected routes for authenticated users
- Login / Register flow

### File Management

- Upload files using **Multer**
- Cloud file storage with **Supabase Storage**
- File validation support
- Download uploaded files
- View file details:
  - Name
  - MIME type
  - Upload date
  - File size
- Rename files
- Delete files

### Folder System

- Create folders
- Rename folders
- Delete folders
- Nested folder hierarchy
- Recursive folder traversal
- Breadcrumb navigation
- Root folder system per user

### Share Links (Extra Credit)

- Share folders publicly
- Expiring share links (1 day, 10 days, etc.)
- Public read-only access
- Navigate nested folders inside shared links
- Download shared files securely
- Prevent access outside the shared folder tree

---

## 🧱 Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

### Authentication

- Passport.js
- express-session
- @quixo3/prisma-session-store
- bcryptjs

### File Handling

- Multer
- Supabase Storage

### Frontend

- EJS
- Vanilla CSS
- Responsive mobile-first UI

---

### Guest (Unauthenticated)

Can:

- Access shared folder links
- Navigate shared folders
- Download shared files
- Read shared content only

Cannot:

- Modify folders
- Upload files
- Access private storage

### Authenticated User

Can:

- Upload files
- Create folders
- Rename folders/files
- Delete folders/files
- Download files
- View file details
- Share folders publicly

---

## 📌 Core Routes

### Home

| Route | Description |
|--------|-------------|
| `/` | Landing page |

### Authentication

| Route | Description |
|--------|-------------|
| `/register` | Register account |
| `/login` | Login user |
| `/logout` | Logout user |

### Folders

| Route | Description |
|--------|-------------|
| `/folders/:id` | View folder |
| `/folders/:id/new` | Create folder form |
| `/folders/:id` | Create folder |
| `/folders/:id/edit` | Edit folder form |
| `/folders/:id/edit` | Update folder |
| `/folders/:id/delete` | Delete folder |

### Files

| Route | Description |
|--------|-------------|
| `/files/upload/:folderId` | Upload form |
| `/files/upload/:folderId` | Upload file |
| `/files/:id` | View file details |
| `/files/:id/edit` | Edit file form |
| `/files/:id/edit` | Update file |
| `/files/:id/delete` | Delete file |
| `/files/:id/download` | Download file |

### Sharing

| Route | Description |
|--------|-------------|
| `/share/folder/:id` | Create share link |
| `/share/:token` | Access shared folder |
| `/share/:token/file/:fileId` | Download shared file |

---

## 🌱 What I Learned

This project helped strengthen my understanding of:

- Authentication with Passport.js
- Session persistence with Prisma Session Store
- File uploads using Multer
- Cloud storage integration using Supabase
- Recursive folder tree traversal
- Route protection and scoped authorization
- Public sharing systems
- Secure download flows
- MVC architecture in Express
- Relational modeling with Prisma
- Building responsive interfaces using EJS + CSS

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgresql_database_url

SESSION_SECRET=your_session_secret

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
````

---

## ⚙️ Setup

Only run the commands below after creating a PostgreSQL database and configuring your environment variables.

Install dependencies:

```bash
npm install
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Create storage buckets on supabase
```bash

node "db createBucket.js"
```

Start the application:

```bash
node app.js
```

Or in development mode:

```bash
npm run dev
```