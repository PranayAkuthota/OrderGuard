<div align="center">
  <div style="padding: 10px; border-radius: 10px; display: inline-block;">
    <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg" width="60" alt="OrderGuard Logo">
  </div>
  <br />
  <h1>OrderGuard</h1>
  <p><strong>Order Lifecycle & Inventory Consistency Engine</strong></p>
  <p>A full-stack, enterprise-grade e-commerce backend platform and seller dashboard designed to ensure consistent order processing and prevent race conditions in high-volume inventory systems.</p>
</div>

<hr />

## 🚀 Overview

OrderGuard is built to solve one of the hardest problems in e-commerce: **inventory consistency**. When multiple customers attempt to purchase the last available item simultaneously, race conditions can occur. OrderGuard utilizes atomic database operations and a strict state-machine architecture to ensure reliable, conflict-free order processing.

Coupled with a **beautiful, responsive React dashboard**, OrderGuard allows merchants to track inventory, fulfill orders, analyze customer trends, and manage their storefront.

---

## ✨ Features

### 🛡️ Robust Backend Engine
- **Atomic Inventory Updates**: Prevents overselling and race conditions when multiple orders are placed simultaneously.
- **Rule-Based Order State Machine**: Strict lifecycle enforcement (`PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` or `CANCELLED`).
- **Secure Authentication**: Role-based Access Control (RBAC) via JSON Web Tokens (JWT) for both `SELLER` and `CUSTOMER` roles.
- **20+ RESTful APIs**: Fully structured modular API endpoints for Products, Orders, Customers, and Authentication.

### 💻 Premium Merchant Dashboard
- **Real-Time Data Filtering**: Global search and debounced query bars to find specific orders or products instantly.
- **Modern Glassmorphism UI**: High-end interface designed with Tailwind CSS and Lucide React icons.
- **Analytics & Notifications**: Actionable insights on revenue, active buyers, and low-stock alerts.
- **Storefront & Checkout Integration**: Fully functional customer-facing catalog and cart mockups.
- **Dark Mode Support**: Seamless toggle between light and dark themes.

---

## 🛠 Tech Stack

### Frontend (Client)
- **Framework**: React 18 (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **State & Form Management**: React Hook Form, Custom Context APIs
- **Icons & Toast**: Lucide React, React Hot Toast

### Backend (Server)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT & bcryptjs
- **Architecture**: MVC Pattern (Models, Views/React, Controllers)

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the root directory:

`PORT` - The port your server runs on (e.g., `5001`)

`MONGO_URI` - Your MongoDB connection string (Atlas or Local)

`JWT_SECRET` - A secure random string for signing JWT tokens

**Frontend Environment:**
Inside the `frontend` folder, if you deploy or test remotely, ensure you provide:
`VITE_API_URL` - URL pointing to the deployed backend server.

---

## 💻 Run Locally

**1. Clone the project**

```bash
git clone https://github.com/PranayAkuthota/OrderGuard.git
cd OrderGuard
```

**2. Setup Backend**

```bash
# Install dependencies
npm install

# Create the .env file and add your MongoDB URI
touch .env

# Start the server (Node / Nodemon)
npm run dev
```

**3. Setup Frontend**

```bash
# Open a new terminal tab
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Your app will be available at `http://localhost:5176/`. 

---

## 🚢 Deployment to Render

OrderGuard is fully optimized for cloud deployment via [Render](https://render.com).

### Web Service (Backend)
1. Set the **Build Command** to `npm install`.
2. Set the **Start Command** to `node app.js`.
3. Add `MONGO_URI` and `JWT_SECRET` in the Environment Variables section.
4. Ensure MongoDB Atlas Network Access is set to allow connections from anywhere (`0.0.0.0/0`).

### Static Site (Frontend)
1. Set the **Root Directory** to `frontend`.
2. Set the **Build Command** to `npm install && npm run build`.
3. Set the **Publish Directory** to `dist`.
4. Add the `VITE_API_URL` environment variable pointing to your Web Service URL.
5. In the Render Dashboard, add a **Rewrite Rule** (`/*` ➔ `/index.html`) to support React Router.

---

## 📂 Project Structure

```text
orderguard/
├── controllers/          # Business logic for routes
├── models/               # Mongoose DB schemas (Order, Product, User)
├── routes/               # Express API endpoints
├── services/             # Specialized services (Rule Engine)
├── middleware/           # JWT auth and RBAC validation
├── app.js                # Server entry point
└── frontend/             # React Vite Application
    ├── src/
    │   ├── components/   # Reusable UI (Sidebar, Header, Table)
    │   ├── context/      # Auth & Theme Providers
    │   ├── layouts/      # Protected Route & Dashboard Layouts
    │   ├── pages/        # Main App Views (Login, Dashboard, Inventory)
    │   └── services/     # Axios API integrations
    └── tailwind.config.js
```

---

<div align="center">
  <p>Built with ❤️ by Pranaykumar Akuthota </p>
</div>
