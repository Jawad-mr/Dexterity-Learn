# Dexterity Learn — Complete MERN Stack Rewrite

**Dexterity Learn** is a modern, premium educational platform inspired by W3Schools, built with the **MERN Stack**. The application is designed mobile-first to feel like a native Android/iOS application with small spacing, smooth animations, rounded corners, and a premium minimal aesthetic.

---

## 🚀 Tech Stack

### Frontend
* **React.js (Vite)** — Single Page Application
* **React Router (HashRouter)** — Client-side navigation mapping
* **Tailwind CSS** — Utility-first responsive design tokens (with Dark Mode support)
* **Framer Motion** — Smooth micro-animations and native page sliders
* **Axios** — Backend API fetch engine with automatic JWT request interceptors
* **React Query (TanStack)** — Server-state caching and synchronization
* **PWA Support** — Built-in offline manifests and service-worker setups
* **Lucide Icons** — Consistent native-feel iconography

### Backend
* **Node.js & Express.js** — REST API endpoints
* **MongoDB & Mongoose** — Document mapping and schemas
* **JWT Authentication** — Secure session logins & verification tokens
* **Bcrypt** — Pre-save password hashing
* **Cloudinary & Multer** — Multi-part profile image uploading
* **Nodemailer** — Verification and password reset mail templates

---

## 💎 Core Features

1. **Sticky Top Navigation**: Fixed logo, notifications bell drawer with unread counters, profile avatars, and a debounced instant search bar mapping matches across courses, lessons, and books.
2. **Fixed Bottom Navigation**: Native tab-style bar featuring links to Home, Courses, Books, and Profile.
3. **Sliding Announcements**: Auto-sliding premium banner cards highlighting active course releases or system alerts.
4. **Course Syllabus & Quizzes**: Complete lesson directories, previous/next buttons, and interactive code playgrounds to write and execute code in a local console sandbox. Features multiple-choice lesson practice quizzes.
5. **Verified Certificates**: Fully completed free courses generate locked certificate claims. After a simulated checkout (₹499), users unlock an HTML/CSS printable credential modal.
6. **E-Book Reader**: Sepia/Light/Dark text viewer with customizable font sizes. Pages 1-3 are free; pages 4+ are securely redacted on the backend, triggering a paywall check.
7. **User Dashboard**: Streak counter, XP gauges, earned badge collections, transaction receipt history, bookmarks, and security profile configurations.
8. **Admin Panel (`/admin`)**: Passkey-secured lock screen (`admin123`) exposing revenue charts, DAU active metrics, and full CRUD grids to publish/draft courses, reorder lessons, create textbooks, and manage users.

---

## 📁 Directory Structure

```
Dexterity Learn/
├── backend/
│   ├── config/             # DB connection, Cloudinary, and Nodemailer configs
│   ├── controllers/        # Express handlers (Auth, Course, Book, Payment, Admin)
│   ├── middleware/         # Auth checkers, Multer configs, and Error handlers
│   ├── models/             # Mongoose schemas (User, Course, Lesson, Book, Payment, etc.)
│   ├── routes/             # REST endpoints (auth, courses, books, payments, admin)
│   ├── utils/              # JWT helpers and seed.js database seeder script
│   ├── uploads/            # Temporary disk storage for Multer
│   └── server.js           # Server runner entry point
│
└── frontend/
    ├── public/             # PWA web manifest.json and favicon logo
    ├── src/
    │   ├── components/     # TopNav (search/notif popups) and BottomNav bars
    │   ├── context/        # AuthContext (with Axios request interceptors) & ThemeContext
    │   ├── hooks/          # useSEO.js page tab titles dynamic updater
    │   ├── layouts/        # AppLayout viewport wrapping
    │   ├── pages/          # Home, Login, Signup, Syllabus, Reader, Dashboard, Admin panels
    │   ├── App.jsx         # Router mappings
    │   ├── index.css       # Tailwind stylesheet, glassmorphism templates, sepia reader prose
    │   └── main.jsx        # DOM mounting root
    ├── vite.config.js      # Dev proxy configured to route /api/ to backend (port 5000)
    └── tailwind.config.js  # Color HSL extension (slate, emerald, and teal)
```

---

## 🛠️ Installation & Setup

Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) running locally on your system.

### Step 1: Start the Backend REST API
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Initialize the database with mock courses, quizzes, multi-page books, and system users:
   ```bash
   npm run seed
   ```
4. Start the backend development server (listens on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### Step 2: Start the Frontend Client
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the React packages:
   ```bash
   npm install
   ```
3. Start the Vite server (listens on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

---

## 🔑 Seeder Credentials

Once you seed the database, you can log in with these default profiles to test the app:

* **Admin Portal Login**: `/admin` (Passkey check: `admin123`)
* **Admin Account**: `admin@dexteritylearn.com` / password: `admin123`
* **Student Account**: `student@dexteritylearn.com` / password: `user123`
