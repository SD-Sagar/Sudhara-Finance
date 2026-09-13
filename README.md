# Sudhara Finance Prototype

Sudhara Finance is a comprehensive, full-stack web application designed for micro-finance management. It allows administrators to seamlessly manage loan requests, track installment payments automatically, and approve user registrations. Customers can request loans dynamically, view their active installments, and manage their profile.

This project is built using a **Monorepo architecture**, separating the frontend (React + Vite) and the backend (Node.js + Express + MongoDB).

## Features
- **Admin Dashboard**: Approve registrations, approve loan requests and set up tailored installment schedules, deactivate/activate customers, and search customers.
- **Customer Dashboard**: Request loans, check installment due dates, track late fees/fines, and view the entire payment history in an expandable layout.
- **Automated Installments**: The backend algorithm breaks down loan durations into weekly or monthly installments.
- **Notifications**: Automated email notifications for user approvals, loan approvals, and registration requests.
- **File Uploads**: Cloudinary integration for Aadhaar, PAN, Voter ID, and passport photo uploads.
- **Secure Authentication**: JWT with HTTP-only cookies and bcrypt for password hashing. Role-based access control (Admin & Customer).

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS (v4), Redux Toolkit, React Router DOM, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Cloud**: Cloudinary (Image Hosting), Nodemailer (Email Delivery)

---

## Local Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (or a MongoDB Atlas URI)
- A **Cloudinary** account (for image uploads)
- A **Gmail / SMTP** account (for sending emails)

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd Sudhara
```

### 3. Backend Setup
Navigate into the backend folder, install dependencies, and setup your `.env`.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (e.g. `backend/.env`) and add the following variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sudhara
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (e.g. Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_digit_app_password
```

**Seed the Admin Account:**
To log in for the first time, you must create the master Admin user:
```bash
npm run seed
```
*(This will generate the user `admin@sudharafinance.com` with password `password123`)*

### 4. Frontend Setup
Navigate into the frontend folder and install dependencies.

```bash
cd ../frontend
npm install
```
*(Vite proxies API calls to `localhost:5000` automatically via `vite.config.js`)*

---

## Running the Application Locally

You need two separate terminal windows/tabs to run the stack.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*The backend server should start on `http://localhost:5000` and connect to MongoDB.*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*The frontend React app will start on `http://localhost:5173`.*

### Accessing the Portals:
- **Admin Login**: `http://localhost:5173/admin/login` (Use `admin@sudharafinance.com` / `password123`)
- **Customer Landing/Login**: `http://localhost:5173/` (or create a new customer via the admin dashboard or the public registration form).
