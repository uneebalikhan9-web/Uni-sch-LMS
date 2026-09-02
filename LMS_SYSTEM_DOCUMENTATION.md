# 📘 Lancers Tech LMS — Complete Enterprise System Documentation

---

## 📌 Executive Summary

**Lancers Tech LMS** is a modern, modular, and enterprise-grade **Institutional Management System (IMS)** designed for universities, colleges, and educational institutes. The system streamlines all academic, administrative, financial, and student operations through specialized role-based command centers, real-time analytics, and automated workflows.

---

## 🏛️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18 + Vite)                       │
│  - Plus Jakarta Sans Typography   - Custom Glassmorphism Theme          │
│  - Responsive Mobile/Tablet/PC   - Real-time Socket.io Chat Client      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / REST / WebSockets
┌────────────────────────────────────▼────────────────────────────────────┐
│                       BACKEND API (Node.js + Express)                   │
│  - Multi-Tenant RBAC Middleware   - Upload Security & MIME Whitelisting │
│  - API Rate Limiting & Throttling - Real-time Socket.io Server          │
│  - Persistent Audit Logger        - Automated GPA/CGPA Engine           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ MySQL Connection Pool (mysql2)
┌────────────────────────────────────▼────────────────────────────────────┐
│                         DATABASE (MySQL Relational)                     │
│  - 35+ Normalized Tables          - Foreign Key Constraint Integrity    │
│  - Transaction Management         - Audit Log Activity Trail            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Role-Based Portals & Modules

The platform is divided into **12 core functional modules** (excluding MasterAdmin):

```
1.  👑 Super Admin / Vice Chancellor Portal
2.  🎓 Rectorate (Pro-VC / Academic Governance)
3.  🏢 Principal / Dean / HOD Portal
4.  👨‍🏫 Faculty (Teacher) Portal
5.  👨‍🎓 Student Portal
6.  🏛️ Registrar Office
7.  💰 Accounts & Finance Portal
8.  📑 Online Admissions & Public Portal
9.  👔 Human Resources (HR) Portal
10. 💼 Business Development (BD) & Outreach Portal
11. 📚 Library Management Portal
12. 🔬 Virtual Cloud Labs & Training Portal
```

---

## 1. 👑 Super Admin (Vice Chancellor) Portal

The highest institutional authority portal for governing multi-campus operations, strategic planning, and overall policy enforcement.

### 🌟 Key Features:
* **Multi-Campus Governance**: Centralized monitoring of all university campuses, affiliated colleges, and regional centers.
* **Executive KPI Dashboard**: Real-time counters for Total Students, Active Faculty, Program Counts, and Institutional Revenue.
* **Campus Provisioning & Management**: Add, edit, configure, or suspend campus locations with custom branding, quotas, and address details.
* **Role Provisioning & User Management**: Create and manage high-level officers:
  * Principals / HODs
  * Deans / Rectors
  * Registrar Officers
  * Finance Managers
  * HR Managers
  * IT Administrators
* **Institutional Academic Calendar**: Setup academic years, semester start/end dates, examination windows, and official holidays.
* **System Health & Audit Logs**: Real-time tracking of platform performance, user sessions, and critical operations.

---

## 2. 🎓 Rectorate (Pro-VC / Academic Strategy) Portal

Dedicated command center for academic leadership, research governance, faculty workloads, and HEC/accreditation quality assurance.

### 🌟 Key Features:
* **Academic Strategy & Quality Monitoring**: Program-wise success trajectories, student retention rates, and GPA distribution curves.
* **Budget & Financial Governance**: High-level tracking of department budget allocations, capital expenditures, and revenue trends.
* **Faculty Workload & Productivity**: Real-time oversight of teaching hours, research output, publications, and departmental staffing ratios.
* **Research & Innovation Nexus**: Management of ongoing academic research grants, principal investigators (PIs), and funding metrics.
* **Accreditation & Compliance (HEC / PEC)**: Audit compliance indicators, program accreditation renewal dates, and quality assurance checkpoints.

---

## 3. 🏢 Principal / Dean / HOD Dashboard

The operational engine for managing department-level academics, faculty assignments, timetables, and admissions.

### 🌟 Key Features:
* **Departmental Course Allocation**: Assign courses and sections to specific faculty members.
* **Section & Class Scheduling**: Manage class sections, assigned lecture halls, and maximum capacity limits.
* **Automated Timetabling**: Visual class schedule builder with automatic room conflict and teacher double-booking prevention.
* **Admission Approvals Pipeline (3-Stage Verification)**:
  1. *Pending Review*: Review incoming applicant details and documents.
  2. *Fee Clearance Verification*: Confirm payment of admission/registration vouchers.
  3. *Final Principal Admission*: Auto-generate student profile, roll number, and credentials with a single click.
* **Attendance & Performance Oversight**: Track daily student attendance percentages and flag students falling below required thresholds (e.g., 75%).
* **Faculty Monitoring**: Overview of syllabus completion, lecture delivery records, and pending grading submissions.

---

## 4. 👨‍🏫 Faculty (Teacher) Portal

A purpose-built workspace for professors and lecturers to manage classroom delivery, evaluations, and student engagement.

### 🌟 Key Features:
* **Course & Section Cockpit**: Direct access to assigned courses, class rosters, and student contact cards.
* **Daily Class Attendance**: Quick 1-click attendance marking (Present, Absent, Late, Excused) with historical revision tracking.
* **Assignment Management**:
  * Create assignments with title, instructions, deadlines, and maximum points.
  * Secure file attachment uploads (PDF, DOCX, ZIP).
  * Student submission viewer with download links and submission timestamps.
  * Grade and provide individualized qualitative feedback.
* **Examinations & Grading System**:
  * Enter Midterm, Final, Quiz, Assignment, and Lab marks.
  * Automatic calculation of Total Percentage and Grade Points (GPA 4.0 scale) based on institutional grade policies.
  * Batch grade submission and publication to student transcripts.
* **Virtual Cloud Lab Integration**: Assign interactive coding and simulation exercises to classes.

---

## 5. 👨‍🎓 Student Portal

The personalized learner hub providing students with full visibility into their academic journey, coursework, and campus life.

### 🌟 Key Features:
* **Personalized Academic Dashboard**: Real-time view of current semester GPA, cumulative CGPA, attendance summary, and announcements.
* **Class Schedule & Timetable**: Day-by-day interactive timetable showing class timing, lecture hall, and instructor name.
* **Digital Classroom**:
  * Course materials and lecture notes downloads.
  * Active assignments with submission deadlines.
  * Multi-format file submission (PDF, DOCX, ZIP, Images).
  * Real-time view of graded assignments with teacher remarks.
* **Official Academic Transcript**:
  * Semester-wise course breakdown with Credit Hours, Letter Grades, and Grade Points.
  * Academic standing indicator (Good Standing, Dean's Honor List, Probation, Warning).
* **Financial Center**:
  * Download printable fee challan vouchers with barcode/reference number.
  * View payment history and fee clearance status.
* **Face Attendance Check-in**: Integrated AI-powered face verification for contactless classroom and campus attendance.
* **Campus Chat**: Instant messaging with teachers, course peers, and administrative helpdesks.

---

## 6. 🏛️ Registrar Office Portal

The institutional registry responsible for academic records integrity, graduation audits, and statutory compliance.

### 🌟 Key Features:
* **Student Permanent Records (SIR)**: Searchable database of all enrolled, alumni, suspended, and graduated students.
* **Degree & Transcript Governance**:
  * Official transcript generation with secure serial verification codes.
  * Degree issuance and graduation audit checklists (credit hours met, minimum CGPA check, financial clearance).
* **Enrollment & Prerequisite Rule Engine**:
  * Define prerequisite course chains (e.g., *Programming Fundamentals* must be passed before *Data Structures*).
  * Configure minimum/maximum credit hour limits per semester (e.g., 12 to 18 credits).
  * Semester add/drop course approval windows.
* **Classroom & Facility Allocation**: Manage physical campus infrastructure, lecture halls, capacity, and smart lab equipment.

---

## 7. 💰 Accounts & Finance Portal

Complete institutional financial operations management from tuition billing to faculty payroll and expense reporting.

### 🌟 Key Features:
* **Fee Structure Management**: Define semester tuition fees, admission charges, lab funds, and examination dues per program.
* **Automated Fee Challan Generator**:
  * Single student challan generation.
  * Batch/Bulk challan generation for entire departments or semesters.
  * Custom due dates and late payment surcharge rules.
* **Fee Reconciliation**:
  * Search and verify challans by Challan Number, Roll Number, or Student Name.
  * Update payment records (Cash, Bank Transfer, Online Payment Gateway).
  * Automatic synchronization with admission pipeline and student portal.
* **Faculty & Staff Payroll Engine**:
  * Monthly salary generation with detailed breakdown: Basic Pay, House Rent, Medical, Transport, and Tax Deductions.
  * Printable salary slips and payroll summary sheets.
* **Financial Analytics & Cash Flow Reports**:
  * Total Collected Revenue vs. Outstanding Dues.
  * Department-wise revenue distribution charts.

---

## 8. 📑 Public Admissions & Online Application Portal

A publicly accessible, modern multi-step online admissions gateway designed for smooth student intake.

### 🌟 Key Features:
* **4-Step Intuitive Wizard (`/student-admission`)**:
  1. **Personal Information**: Full Name, Father's Name, DOB, Gender, CNIC / B-Form, Religion, Nationality, and Photo Upload.
  2. **Contact & Address**: Phone Number, Email, Residential Address, City, and Emergency Contact Person details.
  3. **Academic Background**: Previous Qualification (Matric, FSc, O/A Levels, BS), Board/University, Year of Passing, Marks/GPA.
  4. **Program & Shift Selection**: Academic program choices, preferred shifts (Morning, Evening, Weekend), and special notes.
* **Live Progress Indicator**: Interactive progress bar and completion percentage tracker.
* **Client & Server-Side Security**:
  * Real-time field validation with green check indicators.
  * Rate-limited submission endpoint (`applyLimiter`: max 10 requests / 15 mins) preventing bot spam.
  * Secure photo upload with MIME type enforcement (JPEG/PNG/WebP, max 4MB).
* **Confirmation & Reference Generation**: Instant application confirmation screen with unique Reference Tracking ID (`#100XXX`) and printable summary copy.

---

## 9. 👔 Human Resources (HR) Portal

Managing the entire employee lifecycle for faculty, administrative staff, and technical personnel.

### 🌟 Key Features:
* **Employee Directory**: Profile management including CNIC, qualification, designation, department, joining date, and contract type.
* **Leave Management System**:
  * Leave application submission (Casual, Sick, Annual, Maternity, Study leave).
  * Multi-level approval workflow (HOD -> HR Manager).
  * Live leave balance tracking.
* **Designations & Department Hierarchy**: Standardized institutional staffing levels and reporting structures.

---

## 10. 💼 Business Development (BD) & Outreach Portal

Driving institutional growth, campus partnerships, and student intake campaigns.

### 🌟 Key Features:
* **Campus Lead Pipeline**: Stage-wise lead tracking (Lead In -> Meeting Scheduled -> Proposal Sent -> MOU Signed).
* **Recruitment & Job Postings**: Create academic job openings, accept candidate CVs, and track hiring stages.
* **Outreach Analytics**: Conversion analytics for marketing campaigns and school outreach programs.

---

## 11. 📚 Library Management Portal

Centralized library cataloging and circulation system.

### 🌟 Key Features:
* **Book Catalog**: Searchable inventory of books by ISBN, Title, Author, Category, and Shelf Location.
* **Circulation & Borrowing**: Issue and return processing for students and faculty.
* **Overdue Tracking & Fines**: Automated calculation of overdue library fines.

---

## 12. 🔬 Virtual Cloud Labs & Training Portal

Advanced hands-on technical learning environment directly accessible inside the browser.

### 🌟 Key Features:
* **Interactive Code Player & Monaco Editor**: In-browser coding environments supporting modern languages and frameworks.
* **Lab Curriculum & Experiments**: Structured step-by-step programming tasks and automated test runners.
* **Progress Tracking**: Real-time completion logs for teachers and students.

---

## 💬 Real-Time Institutional Chat & Messaging

* **Socket.io Powered**: Sub-millisecond latency for direct 1-on-1 and course-wide messaging.
* **Typing Indicators & Online Status**: Real-time presence indicators.
* **Security & Role Restrictions**: Controlled chat rooms preventing unauthorized spam.

---

## 🔒 Security, Compliance & System Hardening

| Security Layer | Implementation Details |
| :--- | :--- |
| **Authentication** | JWT (JSON Web Tokens) with secret signing and expiration policies. |
| **Password Protection** | Salted bcrypt password hashing (10 rounds). |
| **Data Integrity** | 100% managed MySQL transactions (`commit`/`rollback`). **Zero disabled foreign key checks**. |
| **File Upload Security** | Centralized `uploadSecurity.js` with strict MIME whitelisting, UUID renaming, and executable blocking. |
| **Rate Limiting** | Strict IP-based rate limiters on Sign-in, Sign-up, Password Reset, and Public Admissions. |
| **Audit Logging** | Persistent `audit_logs` table recording User ID, Role, Action, Target Entity, IP, and Timestamps. |
| **Tenant Isolation** | Strict SQL scoping by `client_id` and `campus_id` to prevent multi-tenant data leakage. |
| **XSS & HTTP Security** | Helmet security headers, sanitized inputs, and parameterized prepared statements against SQLi. |

---

## 📊 Database Schema Summary (Core Tables)

```sql
users                         -- Central user accounts (email, password, role, campus_id)
campuses                      -- Institutional campuses / branches
programs                      -- Academic degree programs (BSCS, BSAI, etc.)
courses                       -- Course registry with credit hours & codes
course_sections               -- Semester class sections & assigned instructors
enrollments                   -- Student-to-course semester registrations
students                      -- Student profiles (roll number, GPA, academic status)
employees                     -- Faculty and staff profiles
attendance                    -- Daily lecture attendance records
assignments                   -- Course homework & projects
student_submissions           -- Student uploaded files and teacher grades
challans                      -- Tuition fee challans and payment statuses
admission_requests            -- Public admission inquiries & pipeline stages
grade_policies                -- Institutional grading scales (A, B, C, GPA)
course_final_grades           -- Published final course marks & letter grades
student_semester_records      -- Semester GPA (SGPA) and Cumulative CGPA
audit_logs                    -- Compliance and security action audit trail
chat_messages                 -- Real-time Socket.io chat history
library_books                 -- Library inventory catalog
```

---

## 🚀 Quick Deployment Guide

### Local Development
```bash
# 1. Backend
cd backend
npm install
npm start

# 2. Frontend
cd ../frontend
npm install
npm run dev
```

### Production VPS Deployment
```bash
cd /path/to/Uni-sch-LMS
git pull origin main

# Backend
cd backend
npm install
pm2 restart all

# Frontend
cd ../frontend
npm install
npm run build
```

---

## 📄 License & Proprietary Rights
© **Lancers Tech LMS**. All Rights Reserved.  
Proprietary Institutional Management System Framework.
