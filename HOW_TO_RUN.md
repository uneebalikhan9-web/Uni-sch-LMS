# 🚀 Lancers Tech Nexus LMS - Setup Guide

Naye laptop par project chalane ke liye niche diye gaye steps follow karein.

---

## 1. Prerequisites (Zarori Tools)
Pehle ye do cheezen naye laptop mein install karein:
1.  **Node.js**: [https://nodejs.org/](https://nodejs.org/) (LTS version download karein)
2.  **MySQL Server (XAMPP)**: [https://www.apachefriends.org/](https://www.apachefriends.org/) (MySQL chalane ke liye XAMPP sabse asan hai)

---

## 2. Main Libraries (Ye kya kya use kar raha hai)
Jab aap `npm install` karenge, toh ye saari cheezen install hongi. Aapki maloomat ke liye key libraries ye hain:

### Backend Libraries:
*   **Express**: Server chalane ke liye.
*   **MySQL2**: Database se connect karne ke liye.
*   **JsonWebToken (JWT)**: Login aur security ke liye.
*   **Bcrypt**: Passwords ko safe (hash) karne ke liye.
*   **Socket.io**: Real-time Chatting ke liye.
*   **Nodemailer**: Emails aur OTP bhejne ke liye.
*   **Cors**: Frontend aur Backend ko aapas mein connect karne ki permission dene ke liye.

### Frontend Libraries:
*   **React**: Pura interface banane ke liye.
*   **Axios**: Backend se data mangwane ke liye.
*   **Lucide-React**: Khoobsurat Icons ke liye.
*   **Framer Motion**: Animations ke liye.
*   **Recharts**: Analytics aur Graphs dikhane ke liye.
*   **React Router**: Pages ke darmiyan navigate karne ke liye.
*   **React Hot Toast**: Choti notifications (Success/Error) dikhane ke liye.

---

## 2. Database Setup (MySQL)
1.  **XAMPP Control Panel** kholien aur **MySQL** ko "Start" kar dein.
2.  Browser mein `http://localhost/phpmyadmin` kholien.
3.  Ek naya database banayein (Naam rakhein: `test67` ya jo bhi aap `.env` mein rakhenge).

---

## 3. Backend Setup
Ab terminal (CMD ya VS Code Terminal) kholien aur `backend` folder mein jayein:

```bash
cd backend
```

1.  **Dependencies Install Karein:**
    ```bash
    npm install
    ```

2.  **Environment File (.env) Check Karein:**
    `backend` folder mein `.env` file dekhein aur usme database ki details sahi karein:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=test67
    PORT=5000
    ```

3.  **Database Tables Create Karein:**
    Maine ek automated script banayi hui hai jo saari tables aur demo data khud bana degi:
    ```bash
    node scripts/apply_ultimate_schema.js
    ```

4.  **Backend Start Karein:**
    ```bash
    npm start
    ```

---

## 4. Frontend Setup
Ab ek naya terminal kholien aur `frontend` folder mein jayein:

```bash
cd frontend
```

1.  **Dependencies Install Karein:**
    ```bash
    npm install
    ```

2.  **Frontend Start Karein:**
    ```bash
    npm run dev
    ```
    *Iske baad aapko ek link milega (e.g., http://localhost:5173), usay browser mein kholien.*

---

## 5. Login Details (Default Admin)
Jab project chal jaye, toh aap is account se login kar sakte hain:

*   **Email:** `nexus.admin@lancerstech.com`
*   **Password:** `LancersNexus@2026`

---

## 🛠 Troubleshooting (Agar koi masla aaye)
*   **Module not found:** Agar koi error aaye ke "module missing", toh `npm install` dubara chalayein.
*   **Database Error:** Check karein ke XAMPP mein MySQL "Green" (Start) hai ya nahi.
*   **Port 5000 busy:** Agar error aaye ke port 5000 busy hai, toh laptop restart karein ya task manager se purana node process band karein.

---
**Developed by Antigravity AI for Lancers Tech**
