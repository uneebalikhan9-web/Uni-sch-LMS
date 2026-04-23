# Lancers Tech LMS - Technical Project Overview

This document provides a detailed technical summary of the **Lancers Tech LMS** (Learning Management System). It serves as a "Cheat Sheet" for understanding the architecture, features, and implementation details of the platform.

---

## 🚀 1. Technology Stack

The platform is built using a modern **MERN-like** architecture, but with **MySQL** for robust relational data management.

### **Frontend (Client Side)**
*   **Framework**: [React.js](https://react.dev/) (Vite-powered for high-speed builds).
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) — Used for a premium, responsive, and utility-first design system.
*   **Icons**: [Phosphor Icons](https://phosphoricons.com/) — Clean, consistent iconography throughout the dashboard.
*   **Data Fetching**: [Axios](https://axios-http.com/) — Handles all REST API communications.
*   **State Management**: React Hooks (useState, useEffect, useContext).
*   **Real-time Communication**: [Socket.io-client](https://socket.io/) — Used for live notifications and instant messaging.
*   **Analytics**: [Chart.js](https://www.chartjs.org/) — Visualizes student performance and attendance trends.
*   **Editor Support**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) — Integrated for coding labs and assignments.

### **Backend (Server Side)**
*   **Runtime**: [Node.js](https://nodejs.org/en)
*   **Web Framework**: [Express.js](https://expressjs.com/) — Fast, unopinionated web framework for Node.js.
*   **Database**: [MySQL](https://www.mysql.com/) — Relational database providing strong consistency and structure for academic data.
*   **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) — Secure, stateless authentication system.
*   **Password Hashing**: [Bcrypt](https://www.npmjs.com/package/bcrypt) — Industry-standard security for storing user passwords.
*   **File Uploads**: [Multer](https://www.npmjs.com/package/multer) — Handles physical file storage for assignments and student submissions.
*   **Emails**: [Nodemailer](https://nodemailer.com/) — Automates system emails (e.g., OTP for password resets).
*   **Real-time Logic**: [Socket.io](https://socket.io/) — Backend engine for pushing real-time updates to dashboards.

---

## 🏗️ 2. Core Architecture & API Design

### **Authentication Flow**
1.  **Sign-In**: Users (Student, Teacher, Admin, etc.) login via their respective endpoints.
2.  **JWT Token**: On success, the backend generates a signed JWT containing roles and `campus_id`.
3.  **Middleware**: Every protected API route uses a custom middleware (`authenticateToken`) to verify the JWT and enforce Role-Based Access Control (RBAC).

### **Data Isolation (Multi-Tenancy)**
The system is built to support different campuses and departments independently.
*   **Scoping**: Most database queries include a `WHERE campus_id = ?` clause.
*   **Isolation**: This ensures that an Admin from "Campus A" cannot see or modify data for "Campus B."

### **RESTful API Structure**
The backend code is highly modular:
*   `/api/auth.js`: Handles registration, login, and profile management.
*   `/api/teachers.js`, `/api/superadmin.js`, etc.: Role-specific CRUD operations.
*   `/api/assignments.js`: Complex logic for creation, publication, and deadline management.
*   `/api/attendance.js`: Tracking daily presence for batches and specific sessions.

---

## 🎓 3. Key Modules & Features

### **Dashboard Ecosystem**
The LMS provides personalized experiences for **6 Different Roles**:
1.  **Super Admin**: Global control over campuses, departments, and system-wide settings.
2.  **Admin**: Campus-specific management of staff and students.
3.  **BD (Business Development)**: Lead management and student admissions tracking.
4.  **Principal**: Higher-level academic oversight and reporting for their specific branch.
5.  **Teacher**: Class management, attendance taking, assignment grading, and real-time interaction.
6.  **Student**: Access to courses, schedules, assignment submissions, and progress tracking.

### **Academic Management**
*   **Assignment System**: Support for multiple file types, deadlines, and direct feedback from teachers.
*   **Attendance Matrix**: Visual interface for teachers to mark and update daily attendance.
*   **Academic Schedule (Timetable)**: Dynamic scheduling system to prevent class overlaps.
*   **Grades & Reports**: Automated calculation of GPAs and academic performance summaries.

### **Communication & Interaction**
*   **Real-time Chat**: Direct messaging between users with instant delivery.
*   **Live Notifications**: Alerts for new assignments, graded submissions, or system announcements.
*   **OTP Verification**: Secure verification for password resets and critical actions.

---

## 🛠️ 4. File Structure Summary

*   **[/backend/server.js](file:///c:/Users/I.s%20computer/Desktop/LMS/backend/server.js)**: The heart of the application, initializing the server and routes.
*   **[/backend/api/](file:///c:/Users/I.s%20computer/Desktop/LMS/backend/api/)**: Individual route handlers for each business logic module.
*   **[/frontend/src/pages/](file:///c:/Users/I.s%20computer/Desktop/LMS/frontend/src/pages/)**: All UI dashboards and standalone pages.
*   **[/frontend/src/config/api.js](file:///c:/Users/I.s%20computer/Desktop/LMS/frontend/src/config/api.js)**: Centralized Axios configuration for API URLs and headers.

---

> [!TIP]
> **Summary for Quick Pitch:** "This is a full-stack educational platform built for scale. It uses Node/Express and MySQL for a secure, data-driven backend, and React/Tailwind for a premium, high-speed frontend. It supports multi-campus isolation, real-time communication via Socket.io, and complex academic workflows across 6 specialized user roles."
