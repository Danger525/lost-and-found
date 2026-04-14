# 🔍 Campus Lost & Found

A modern, professional web application designed to help university students and staff report, browse, and reclaim lost items on campus. Built with a focus on reliability, ease of use, and role-based management.

---

## 🚀 Live Demo
**[Link to your Render deployment here]**

---

## ✨ Features

- **🔐 Secure Authentication**: JWT and session-based authentication with password encryption (bcryptjs).
- **📋 Item Reporting**: Easily report lost or found items with detailed descriptions, locations, and images.
- **🖼️ Image Uploads**: Integrated image handling for proof of ownership.
- **🔎 Dynamic Search & Filter**: Filter items by category (Electronics, Documents, etc.), type (Lost/Found), or search by keywords.
- **🛡️ Admin Dashboard**: Role-based access for administrators to manage reports, verify claims, and maintain platform integrity.
- **📥 Claim System**: Submit claims for found items with contact details for verification.
- **🎨 Modern UI**: Responsive design built with SASS, featuring smooth transitions and clear call-to-actions.

---

## 🛠️ Tech Stack

- **Backend**: Node.js & Express.js
- **Frontend**: EJS (Embedded JavaScript Templates), SASS, Vanilla CSS
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT, bcryptjs, express-session, cookie-parser
- **Middleware**: connect-flash (for flash messages), multer (for file uploads)
- **Deployment**: Render / Vercel

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)

### 2. Clone the Repository
```bash
git clone https://github.com/Danger525/lost-and-found.git
cd lost-and-found
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
```

### 5. Compile Styles (SASS)
```bash
npm run sass:build
```

### 6. Run Locally
```bash
npm run dev
```

---

## 🚢 Deployment (Render)

The project is pre-configured for deployment on **Render**.

1. **Build Command**: `npm install && npm run sass:build`
2. **Start Command**: `npm start`
3. **Internal Port**: `3000` (or leave it to Render's default)

**Environment Variables on Render:**
Ensure you add `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET`, and `NODE_ENV=production` in the Render environment settings.

---

## 🤝 Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
Distributed under the ISC License. 
