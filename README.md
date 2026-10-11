# Sudhara Women Development Organization (SWDO)

A full-stack Microfinance platform built to manage loans, customers, installments, and fines efficiently.

## Core Features & Capabilities

### 1. Customer Portal
- **Multilingual Support**: Switch seamlessly between English and Bengali interfaces.
- **Secure Authentication**: JWT-based secure login and registration system.
- **Dynamic Dashboard**: View active loans, pending requests, and installment schedules.
- **Loan Applications**: Apply for new loans with varying durations (weeks or months).
- **Payment Guidance**: Easy access to transaction contact numbers for submitting payments.

### 2. Admin Dashboard
- **Robust Security**: Protected by strict rate-limiting to prevent brute force attacks.
- **Smart Notification System**: A dynamic, responsive notification bell that alerts admins to new registrations, pending loans, and urgent/overdue installments. Notifications can be clicked to automatically navigate to the relevant section.
- **Advanced Customer Management**:
  - Approve or reject new customer registrations.
  - Manually configure a customer's CIBIL score (150-800 range).
  - Edit customer profiles and upload missing documents.
  - View detailed loan histories with calculated totals.
- **Flexible Loan & Penalty Logic**:
  - Automatically calculates upcoming due dates.
  - Generates fines based on whether the loan is weekly or monthly (rather than strict daily accumulation).
  - CIBIL score penalties accurately reflect the loan cycle frequency.
  - Custom Payment Dates: Admins can back-date installment payments to ensure customers aren't unfairly penalized for legacy records.
  - Bulk Mark as Paid: Select multiple unpaid installments and record payment in one step with customizable payment date and method.
  - Loan Rejection & Reapplication: Admins can reject loan requests with a single click, instantly updating the customer dashboard with a "REJECTED" status and freeing the customer to submit a new loan request.
- **WhatsApp / SMS Instant Notification System**:
  - Interactive popup modal triggered automatically upon key admin actions (Loan Approval, Loan Rejection, Installment Marked Paid, and Bulk Payments).
  - Pre-formatted copyable message template complete with Customer Name, Customer ID, action details, timestamp, and company domain (`swdo.in`).
  - Persistent message buttons across loan cards and payment records allowing admins to re-open and copy notification messages anytime with a single tap.
- **Document Generation**: Export customer loan schedules and individual payment receipts directly to PDF.

### 3. SEO & Deployment
- Fully deployed on Vercel (Frontend) and Render (Backend).
- Mapped to custom domain `swdo.in` via GoDaddy DNS.
- Robust SEO: Integrated `sitemap.xml`, `robots.txt`, and rich Open Graph tags for WhatsApp/Facebook sharing.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Security**: Helmet, Express-Rate-Limit, secure HTTP-only cookies

## Deployment Architecture
- The backend relies on MongoDB Atlas for data persistence, secured via IP Whitelisting.
- The frontend (`swdo.in`) is continuously deployed via Vercel, connected to the backend via standard REST APIs.
