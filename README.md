# 🎓 Lancers Tech LMS - Enterprise Institutional Management System

[![GitHub Repository](https://img.shields.io/badge/GitHub-Uni--sch--LMS-indigo?logo=github)](https://github.com/uneebalikhan9-web/Uni-sch-LMS.git)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange?logo=mysql)](https://www.mysql.com/)

**Lancers Tech LMS** is an enterprise-grade Institutional Management System (IMS) engineered for modern universities, colleges, and training academies. It features a clean glassmorphism UI, real-time academic analytics, multi-tenant RBAC architecture, and enterprise security hardening.

---

## 🛡️ Enterprise Security & Hardening Features

- **Strict Relational Data Integrity**: 100% managed MySQL transactions (`beginTransaction`, `commit`, `rollback`) with zero disabled foreign key checks.
- **File Upload Security & MIME Whitelisting**: Centralized `uploadSecurity` middleware with strict MIME verification, extension whitelisting (JPG, PNG, WebP, PDF, DOCX), UUID filename sanitization, and execution blocking.
- **API Rate Limiting & Anti-Abuse Protection**: Layered throttling on authentication, OTP verification, password reset, and public admission submissions.
- **Comprehensive Audit Trail**: Automated audit logging (`audit_logs` table) tracking sensitive actions, user roles, timestamps, and IP addresses.
- **Multi-Tenant Architecture**: Strict client and campus scoping across all query execution paths.
- **Paginated High-Scale Endpoints**: Standardized pagination metadata on large record endpoints (Challans, Admissions, Students, Grades).

---

## 🎭 Institutional Command Centers (Dashboards)

### 👑 Vice Chancellor / Master Admin Portal
* **Global Multi-Tenant Governance**: Monitor multiple universities, campuses, and branches from a centralized cockpit.
* **Strategic KPI Monitoring**: Real-time intake metrics, faculty performance indicators, and financial health summaries.
* **Administrative Provisioning**: Manage HODs, BD Agents, HR Managers, IT Admins, and system access.

### 🎓 Rectorate (Pro-VC) Dashboard
* **Institutional Overview**: High-level metrics for total enrollment, active research projects, and campus GPA averages.
* **Academic Strategy & Budget Governance**: Analytical charts for budget utilization and program success trajectories.
* **Faculty & Accreditation**: Faculty workload tracking, accreditation readiness (HEC/PEC compliance), and quality audits.

### 💼 Business Development (BD) Portal
* **Campus Lead Pipeline**: Manage institutional expansion opportunities and lead conversion funnels.
* **Recruitment Engine**: Manage job postings, talent acquisition pipelines, and candidate tracking.

### 🏢 HOD / Dean (Principal) Dashboard
* **Departmental Orchestration**: Manage faculty workloads, course distributions, and section assignments.
* **Academic Quality Control**: Monitor student success rates, teacher attendance, and course evaluations.
* **Automated Timetabling**: Dynamic schedule generation and room allocation.

### 👨‍🏫 Faculty (Teacher) Portal
* **Academic Delivery**: Subject-wise attendance tracking, assignment creation, and grading rubric management.
* **Virtual Cloud Labs**: Provision and monitor interactive lab environments for hands-on technical training.
* **Grade Management**: Direct grade calculation with automatic GPA/CGPA computation.

### 👨‍🎓 Student Portal
* **Academic Roadmap**: Access personalized timetables, attendance analytics, course outlines, and grade reports.
* **Digital Classroom**: Download course materials, submit assignments, and participate in real-time chat.
* **Financial Hub**: Download fee challans and monitor payment statuses.

### 🏛️ Registrar Office
* **Academic Records**: Secure management of student transcripts, degree verifications, and graduation audits.
* **Course & Enrollment Policies**: Enforce prerequisite checks, minimum credit rules, and semester registration windows.

### 💰 Accounts & Finance
* **Fee Collection Nexus**: Automated fee challan generation, partial payment tracking, and reconciliation reports.
* **Payroll Processing**: Faculty and staff salary slips with detailed allowances and tax deductions.

### 📑 Online Admissions Portal
* **Public Admission Form (`/student-admission`)**: Responsive 4-step wizard with live progress tracking, document validation, and photo upload.
* **Admissions Pipeline**: Multi-stage inquiry verification (Pending Fee -> Fee Verified -> Admitted).

---

## 🛠️ Technical Stack

### **Frontend**
- **React 18 & Vite**: Lightning-fast build pipeline and Hot Module Replacement (HMR).
- **Phosphor Icons**: Consistent, high-fidelity iconography.
- **Custom Responsive CSS**: Mobile-first design system with glassmorphic accents.
- **Chart.js & React-Chartjs-2**: Dynamic data visualization.

### **Backend**
- **Node.js & Express**: High-throughput REST API server.
- **Socket.io**: Real-time private chat and notification broadcast channels.
- **MySQL (mysql2/promise)**: Optimized connection pooling with transactional execution.
- **JWT (JSON Web Tokens) & Helmet**: Token-based authentication and secure HTTP headers.
- **Multer**: Secure multi-part upload handling with MIME whitelisting.

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- Node.js (v18.x or higher)
- MySQL Server (v8.0 or MariaDB 10.5+)

### 2. Clone Repository
```bash
git clone https://github.com/uneebalikhan9-web/Uni-sch-LMS.git
cd Uni-sch-LMS
```

### 3. Backend Setup
```bash
cd backend
npm install
# Configure your .env file with database credentials
npm start
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🌐 VPS Deployment Guide

To deploy or update on your production VPS:

```bash
# 1. Navigate to your project root on VPS
cd /path/to/Uni-sch-LMS

# 2. Pull the latest code
git remote set-url origin https://github.com/uneebalikhan9-web/Uni-sch-LMS.git
git pull origin main

# 3. Update & restart Backend
cd backend
npm install
pm2 restart all

# 4. Build Frontend
cd ../frontend
npm install
npm run build
```

---

## 📂 Repository Structure

```
Uni-sch-LMS/
├── backend/
│   ├── api/                 # Modular API endpoints (admissions, grades, challans, etc.)
│   ├── config/              # Database pool and environment configuration
│   ├── middleware/          # Auth (RBAC), uploadSecurity, rateLimit, cache
│   ├── utils/               # Audit logger, rollNumber generator
│   └── server.js            # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI widgets & navigation
│   │   ├── pages/           # Portals (SuperAdmin, Student, Teacher, Admissions, etc.)
│   │   ├── config/          # API base URL configuration
│   │   └── index.css        # Global design system tokens
│   └── vite.config.js       # Vite build & bundle optimizations
└── README.md
```

---

## 📜 License & Ownership

© 2026 **Lancers Tech LMS**. All Rights Reserved.  
Proprietary Institutional Management Software.
