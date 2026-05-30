# SalesPro SRMS — Sales Record Management System
### SalesPro Ltd | Huye District, Southern Province, Rwanda

A full-stack web application for managing electronic equipment sales, customers, products, and generating reports.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| HTTP Client | Axios |
| Charts | Recharts |

---

## Project Structure

```
SRMS/
├── backend-project/          # Node.js + Express API
│   ├── models/               # Mongoose models
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Product.js
│   │   └── Sale.js
│   ├── routes/               # Express routes
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── products.js
│   │   ├── sales.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend-project/         # React.js + Vite
    ├── src/
    │   ├── api/index.js       # Axios API calls
    │   ├── context/           # React Context
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/             # Page components
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CustomersPage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── SalesPage.jsx
    │   │   └── ReportsPage.jsx
    │   ├── components/
    │   │   └── Layout.jsx     # Sidebar + navbar
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally (or MongoDB Atlas URI)
- npm or yarn

---

### Step 1: Backend Setup

```bash
cd backend-project
npm install
```

Edit `.env` if needed:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/SRMS
JWT_SECRET=srms_salespro_secret_key_2026
JWT_EXPIRE=7d
```

Start the backend:
```bash
npm run dev
# or
npm start
```

Backend runs at: `http://localhost:5000`

---

### Step 2: Frontend Setup

```bash
cd frontend-project
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Features

### Authentication
- User Registration (username, email, password, role)
- User Login with JWT
- Protected routes
- Persistent sessions with localStorage

### Dashboard
- Summary statistics (customers, products, sales, revenue)
- Weekly revenue line chart
- Recent sales list
- Quick navigation links

### Customers (Full CRUD)
- Add new customer
- View all customers (searchable table)
- Edit customer details
- Delete customer

### Products (Full CRUD)
- Add new product
- View products as cards (searchable)
- Edit product
- Delete product

### Sales (Full CRUD - as required)
- Record new sale with multiple product lines
- Auto-calculate total amount
- View all sales
- Edit sale
- Delete sale
- Click-to-expand invoice detail

### Reports
- Daily / Weekly / Monthly toggle
- Revenue trend bar chart
- Payment methods pie chart
- Top products by revenue
- Full sales table for the period

### UI/UX
- Dark mode toggle (persists across sessions)
- Fully responsive (mobile, tablet, desktop)
- Tailwind CSS with custom design system
- Outfit + Syne Google Fonts
- Smooth animations & transitions
- Toast notifications

---

## API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Customers
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/customers | Get all |
| POST | /api/customers | Create |
| PUT | /api/customers/:id | Update |
| DELETE | /api/customers/:id | Delete |

### Products
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/products | Get all |
| POST | /api/products | Create |
| PUT | /api/products/:id | Update |
| DELETE | /api/products/:id | Delete |

### Sales
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/sales | Get all |
| POST | /api/sales | Create |
| PUT | /api/sales/:id | Update |
| DELETE | /api/sales/:id | Delete |

### Reports
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/reports/summary | Dashboard summary |
| GET | /api/reports/daily | Daily report |
| GET | /api/reports/weekly | Weekly report |
| GET | /api/reports/monthly | Monthly report |

---

## Default Test Credentials

After registering your first account, you can create an admin:
- Role: `admin`
- Role: `sales_officer`

---

## Entity Relationship

```
Customer 1 ──────< Sale >────── Product
   (customerNumber)  (invoiceNumber)  (productCode)
```

- One Customer can have many Sales
- One Sale can include many Products
- ERD follows third normal form

---

*Built for SalesPro Ltd National Practical Exam 2026*
