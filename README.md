# 🏢 Inventory Stock Management Microservices System

> **A production-ready, full-stack inventory and order management system with intelligent business logic**

[![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)](https://microservices.io/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED)](https://www.docker.com/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Services](#services)
- [Business Logic](#business-logic)
- [Testing](#testing)
- [Technology Stack](#technology-stack)

---

## 🌟 Overview

A comprehensive **microservices-based inventory management system** featuring:
- ✅ **Stock Reservation System** - Prevents overselling
- ✅ **Order Lifecycle Management** - Complete workflow with status tracking
- ✅ **Automatic Low Stock Alerts** - Smart inventory monitoring
- ✅ **Audit Trails** - Complete history of all operations
- ✅ **Microservices Communication** - Inter-service validation and coordination
- ✅ **Real-time Analytics** - Inventory and order insights

This is **not just CRUD** - it's a production-ready system with real business logic!

---

## 🎯 Key Features

### Stock Management
- ✅ **Stock Reservation** - Reserve stock for pending orders
- ✅ **Automatic Stock Deduction** - Deduct when order ships
- ✅ **Stock Release** - Return stock on order cancellation
- ✅ **Movement Tracking** - Complete audit trail of all stock changes
- ✅ **Multi-location Support** - Warehouse management

### Order Processing
- ✅ **Workflow Validation** - Only valid status transitions allowed
- ✅ **Customer Validation** - Verify customer before order creation
- ✅ **Product Validation** - Check products exist and are available
- ✅ **Stock Availability Check** - Prevent orders with insufficient stock
- ✅ **Automatic Totals Calculation** - Subtotal + tax + shipping
- ✅ **Status History** - Complete audit trail

### Inventory Intelligence
- ✅ **Low Stock Alerts** - Automatic detection when below reorder level
- ✅ **Reorder Suggestions** - Intelligent purchase recommendations
- ✅ **Analytics Dashboard** - Real-time inventory metrics
- ✅ **Stock History** - View all movements for any product

### Supplier Management
- ✅ **Purchase Orders** - Create and track supplier orders
- ✅ **Stock Receiving** - Receive and update inventory
- ✅ **Supplier Tracking** - Manage supplier relationships

---

## 🏗️ Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                     http://localhost:5173                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
        ┌───────────────────┴──────────────────┐
        │                                       │
┌───────▼─────────┐                  ┌─────────▼──────────┐
│  User Service   │                  │   Order Service    │
│   Port 3001     │◄────────────────►│    Port 3005       │
└─────────────────┘                  └─────────┬──────────┘
        │                                       │
        │                            ┌──────────▼──────────┐
┌───────▼─────────┐                 │ Inventory Service   │
│ Product Service │◄────────────────┤    Port 3003        │
│   Port 3002     │                 └──────────┬──────────┘
└─────────────────┘                            │
        │                            ┌──────────▼──────────┐
┌───────▼─────────┐                 │  Supplier Service   │
│   PostgreSQL    │◄────────────────┤    Port 3004        │
│   Container     │                 └─────────────────────┘
└─────────────────┘
```

### Database Architecture

Each service has its own PostgreSQL database:
- `user_db` - Users, authentication
- `product_db` - Products, categories
- `inventory_db` - Stock, movements, alerts
- `order_db` - Orders, order items, status history
- `supplier_db` - Suppliers, purchase orders

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **Docker** >= 20.x
- **Docker Compose** >= 2.x
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Inventory Stock Management Microservices System"
```

### 2. Start Backend Services

```bash
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL database
- All 5 microservices
- Automatic database initialization

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### 4. Verify Services

```bash
# Check all services are healthy
docker ps

# Check specific service
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Product Service
curl http://localhost:3003/health  # Inventory Service
curl http://localhost:3004/health  # Supplier Service
curl http://localhost:3005/health  # Order Service
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | 🚀 Quick start guide and key features |
| **[FEATURES_SUMMARY.md](FEATURES_SUMMARY.md)** | 📋 Complete feature list and implementation details |
| **[BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)** | 🧠 Technical documentation of business logic |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | 🧪 Step-by-step testing instructions |
| **[backend/README.md](backend/README.md)** | 🔧 Backend setup and API documentation |
| **[frontend/README.md](frontend/README.md)** | 🎨 Frontend setup and development guide |

---

## 🔧 Services

### 1. User Service (Port 3001)
- User registration and authentication
- Role management (Admin, Manager, Customer)
- User profiles

**Key Endpoints:**
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user

### 2. Product Catalog Service (Port 3002)
- Product management
- Category management
- Product variants (size, color, etc.)

**Key Endpoints:**
- `POST /api/products` - Create product
- `GET /api/products` - List products
- `GET /api/categories` - List categories

### 3. Inventory Service (Port 3003)
- Stock management
- Stock reservations
- Low stock alerts
- Reorder suggestions
- Stock movement tracking

**Key Endpoints:**
- `POST /api/inventory/bulk-check` - Check stock availability
- `POST /api/inventory/reserve` - Reserve stock
- `POST /api/inventory/confirm-deduction` - Deduct stock
- `GET /api/inventory/alerts` - Get low stock alerts
- `GET /api/inventory/analytics` - Get inventory analytics

### 4. Supplier Service (Port 3004)
- Supplier management
- Purchase order creation
- Delivery tracking

**Key Endpoints:**
- `POST /api/suppliers` - Create supplier
- `POST /api/purchase-orders` - Create purchase order
- `GET /api/purchase-orders` - List POs

### 5. Order Service (Port 3005)
- Order creation with validation
- Order lifecycle management
- Status transitions with business rules
- Order history and tracking

**Key Endpoints:**
- `POST /api/orders` - Create order (with full validation)
- `GET /api/orders` - List orders
- `PATCH /api/orders/:id/status` - Update order status

---

## 🧠 Business Logic

### Stock Reservation Flow

```
1. Customer creates order
   ↓
2. Validate customer, products, stock
   ↓
3. Reserve stock in inventory
   ↓
4. Create order with "pending" status
   ↓
5. Admin ships order
   ↓
6. Deduct actual stock
   ↓
7. Check if stock low → Create alert
```

### Order Status Lifecycle

```
pending → confirmed → processing → shipped → delivered → completed
    ↓          ↓           ↓           ↓          ↓
cancelled  cancelled   cancelled   returned   returned → refunded
```

**Status Rules:**
- Each transition validated
- Stock operations triggered automatically
- Complete audit trail maintained

### Low Stock Management

```
Stock Deducted → Check Level → Below Threshold?
                                      ↓
                              Create Alert
                                      ↓
                          Calculate Reorder Quantity
                                      ↓
                         Create Purchase Suggestion
```

**See [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md) for complete details**

---

## 🧪 Testing

### Manual Testing

Use Thunder Client, Postman, or cURL to test APIs.

**Example: Create Order with Stock Reservation**

```bash
POST http://localhost:3005/api/orders
Content-Type: application/json

{
  "customer_id": 5,
  "shipping_address": "123 Test Street",
  "payment_method": "credit_card",
  "payment_status": "paid",
  "items": [
    {
      "product_id": 4,
      "sku": "SKU-001",
      "product_name": "Product Name",
      "quantity": 10,
      "unit_price": 100.00
    }
  ]
}
```

**Verify Stock Reserved:**
```bash
GET http://localhost:3003/api/inventory/product/4
# Check: reserved_quantity should be 10
```

**See [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete test scenarios**

---

## 💻 Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **ORM:** Raw SQL queries (with pg driver)
- **Validation:** Joi
- **Logging:** Winston
- **Containerization:** Docker & Docker Compose

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** React Icons

### DevOps
- **Containers:** Docker
- **Orchestration:** Docker Compose
- **Hot Reload:** Nodemon (backend), Vite HMR (frontend)
- **Database:** PostgreSQL in Docker

---

## 📊 Database Schema

### Key Tables

**inventory**
- `quantity` - Total stock
- `reserved_quantity` - Stock reserved for pending orders
- `reorder_level` - Minimum stock threshold
- `max_stock_level` - Maximum stock capacity

**stock_alerts**
- Automatic low stock alerts
- Status tracking (active/resolved)

**reorder_suggestions**
- Automatic purchase recommendations
- Calculated based on max_stock_level

**order_status_history**
- Complete audit trail of order changes
- Tracks who, when, and what changed

**See [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md) for complete schema**

---

## 🔐 Environment Variables

### Backend Services

```env
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/inventory_db

# Server
PORT=3003
NODE_ENV=development

# Service URLs (for inter-service communication)
USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-catalog-service:3002
INVENTORY_SERVICE_URL=http://inventory-service:3003
SUPPLIER_SERVICE_URL=http://supplier-service:3004
ORDER_SERVICE_URL=http://order-service:3005
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check service logs
docker logs order-service --tail 50
docker logs inventory-service --tail 50

# Restart services
docker-compose restart

# Rebuild if code changed
docker-compose up --build
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Connect to database
docker exec -it ims-postgres psql -U postgres -d inventory_db

# Check tables exist
\dt
```

### Frontend Not Loading

```bash
# Check if services are accessible
curl http://localhost:3001/health
curl http://localhost:3003/health
curl http://localhost:3005/health

# Check frontend logs
cd frontend
npm run dev
```

---

## 📈 Future Enhancements

- [ ] Event-driven architecture with message queues
- [ ] Email/SMS notifications
- [ ] Advanced analytics and forecasting
- [ ] Multi-warehouse support
- [ ] Barcode scanning integration
- [ ] Mobile app
- [ ] API gateway
- [ ] Service mesh
- [ ] Kubernetes deployment

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- Microservices architecture patterns
- Domain-driven design principles
- Clean code practices
- REST API best practices

---

## 📞 Support

For issues or questions:
1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Review [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)
3. Check service logs: `docker logs <service-name>`
4. Create an issue on GitHub

---

**Built with ❤️ for production-grade microservices**

---

## 🎯 Quick Links

- [Quick Reference](QUICK_REFERENCE.md) - Get started fast
- [Features Summary](FEATURES_SUMMARY.md) - See what's included
- [Business Logic](BUSINESS_LOGIC.md) - Understand the system
- [Testing Guide](TESTING_GUIDE.md) - Test everything
- [Backend Setup](backend/README.md) - Backend details
- [Frontend Setup](frontend/README.md) - Frontend details

---

**Version:** 2.0.0  
**Last Updated:** November 2025  
**Status:** Production Ready ✅
