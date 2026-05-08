# 🚀 Lancers Tech LMS - Enterprise Institutional Management System

Lancers Tech LMS is a premium, high-performance Institutional Management System (IMS) engineered for modern educational organizations. It features a sophisticated glassmorphism UI, real-time academic analytics, and a multi-tenant role-based architecture designed to scale.

---

## 🎨 Design Philosophy
- **Modern Aesthetics**: Sleek glassmorphism UI with curated color palettes.
- **Responsive-First**: Fully optimized for Mobile, Tablet, and Desktop workflows.
- **Institutional Clarity**: High-density data visualization for rapid decision making.

---

## 🎭 Institutional Command Centers (Dashboards)

### 👑 Vice Chancellor (Super Admin) Portal
*   **Global Governance**: Monitor multiple campuses and departments from a single command center.
*   **Strategic KPI Monitoring**: Platform-wide statistics on student intake, faculty performance, and financial health.
*   **Administrative Provisioning**: Manage HODs, BD Agents, and high-level staff access.
*   **Institutional Strategy**: Track national & global rankings and strategic plan KPIs.

### 💼 Business Development (BD) Portal
*   **Lead Pipeline**: Track institutional leads from prospect to closed deals.
*   **Recruitment Engine**: Manage job postings and track applicant status.
*   **Global Analytics**: Access cross-departmental data to drive growth.

### 🏢 HOD / Dean (Principal) Dashboard
*   **Departmental Orchestration**: Manage faculty workloads, course assignments, and class sections.
*   **Academic Quality Control**: Monitor student success rates and teacher attendance.
*   **Automated Timetabling**: Dynamic generation of departmental class schedules.

### 👨‍🏫 Faculty (Teacher) Portal
*   **Academic Delivery**: Subject-wise attendance tracking and assignment management.
*   **Virtual Lab Nexus**: Provision and monitor high-performance Cloud Labs for technical training.
*   **Grading & Feedback**: Standardized grading system with automated progress report generation.

### 👨‍🎓 Student Portal
*   **Academic Roadmap**: Track personalized timetables, attendance trends, and grades.
*   **Digital Classroom**: Access course materials, submit assignments, and participate in institutional chat.
*   **Admin Hub**: Download fee challans and view qualitative performance feedback.

### 🏛️ Registrar Office
*   **Record Governance**: Secure management of student academic histories and degrees.
*   **Verification System**: Track degree issuance and serial number validation.
*   **Calendar Management**: Centralized control of the academic calendar and key deadlines.

### 💰 Accounts & Finance
*   **Revenue Management**: Automated fee challan generation and collection tracking.
*   **Payroll Nexus**: Process faculty salaries with detailed breakdown of allowances and deductions.
*   **Financial transparency**: Comprehensive reports on institutional cash flow and pending dues.

### 📑 Admissions & HR
*   **Enrollment Flow**: Manage new student applications and registration approvals.
*   **Faculty Lifecycle**: Manage employee records, leave requests, and professional profiles.
- **Recruitment Integration**: Seamlessly sync with BD portal for hiring new staff.

### 📚 Library & Labs
- **Inventory Control**: Track library book circulation, issuance, and overdue records.
- **Lab Management**: Scheduling, inventory, and experiment tracking for scientific labs.

### ⚙️ IT Admin
- **System Configuration**: Branding, email/SMTP setup, and user access control (RBAC).
- **Security & Logs**: Monitor system health, audit logs, and security protocols.

---

## 🛠️ Technical Stack

### **Frontend**
- **React 18 & Vite**: Ultra-fast component rendering and HMR.
- **Phosphor Icons**: High-fidelity iconography for professional UI.
- **Responsive CSS**: Custom-built responsive framework with glassmorphism utilities.
- **Chart.js**: Advanced data visualization for analytics.

### **Backend**
- **Node.js & Express**: High-concurrency API architecture.
- **Socket.io**: Real-time institutional chat and notification nexus.
- **MySQL**: Relational schema designed for institutional data integrity.
- **JWT Security**: Enterprise-grade authentication and session governance.

---

## 🚀 Getting Started

### 1. Database Setup
1.  Ensure MySQL is running.
2.  Import the schema from `backend/master_nexus_schema.sql`.
3.  Configure `.env` in the `backend` folder with your DB credentials.

### 2. Backend Installation
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Installation
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure
- **/frontend**: React-based dashboard systems.
- **/backend**: Express APIs and database models.
- **/backend/api**: Module-specific routing logic.
- **/backend/master_nexus_schema.sql**: Complete database definition.

---

© 2026 Lancers Tech. Proprietary Institutional Framework. All Rights Reserved.
