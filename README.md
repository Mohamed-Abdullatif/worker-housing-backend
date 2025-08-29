# Worker Housing System Backend

A comprehensive backend API system for managing worker housing facilities, providing services for grocery ordering, maintenance requests, invoicing, and user management with multi-language support (English/Arabic).

## 🏠 Overview

The Worker Housing System Backend is a Node.js-based REST API that serves as the backbone for a complete worker accommodation management platform. It provides essential services for residents, administrators, and workers to manage daily operations efficiently.

## ✨ Key Features

### 🔐 Authentication & User Management
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, Resident, Worker)
- **Automatic username generation** based on name and room number
- **User account activation/deactivation**
- **Multi-language support** (English/Arabic)

### 🛒 Grocery Ordering System
- **Complete grocery catalog** with categories (food, beverages, cleaning, other)
- **Real-time inventory management** with stock tracking
- **Order lifecycle management** (pending → processing → ready → delivered)
- **Payment method support** (cash, room charge)
- **Order filtering and search** by status, room, date range
- **Bilingual product descriptions**

### 🔧 Maintenance Management
- **Maintenance request system** with categorized issues (plumbing, electrical, furniture, appliance, other)
- **Priority-based requests** (low, medium, high, urgent)
- **Request assignment** to maintenance staff
- **Status tracking** with completion timestamps
- **Image upload support** for visual documentation
- **Notes and communication** system between users and staff

### 💰 Invoice & Billing System
- **Automated invoice generation** with unique numbering
- **Flexible billing categories** (rent, utilities, groceries, maintenance, other)
- **Payment status tracking** (pending, paid, overdue)
- **Due date management** with automatic calculations
- **Invoice search and filtering**

### 📄 PDF Generation & Reports
- **Invoice PDF generation** with QR codes for verification
- **Grocery order receipts** with detailed item breakdown
- **Monthly reports** for administrative overview
- **Professional document formatting**

### 🔔 Notification System
- **Multi-channel notifications** (push notifications, email)
- **Firebase Cloud Messaging** integration for mobile apps
- **Automated notifications** for order status, maintenance updates
- **Email notifications** with HTML formatting
- **Notification history and read status**

### 📊 API Documentation
- **Swagger/OpenAPI 3.0** interactive documentation
- **Comprehensive endpoint documentation** with examples
- **Authentication examples** and response schemas
- **Live API testing** interface

## 🛠 Technology Stack

- **Runtime:** Node.js with Express.js framework
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer middleware
- **PDF Generation:** PDFKit library
- **QR Code:** QRCode library
- **Push Notifications:** Firebase Admin SDK
- **Email:** Nodemailer
- **API Documentation:** Swagger UI Express
- **Security:** Helmet, CORS, bcryptjs
- **Development:** Nodemon, Jest for testing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd worker-housing-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/worker-housing

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Firebase Configuration (Optional - for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Email Configuration (Optional - for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 4. Database Setup

#### Start MongoDB
```bash
# Using system service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Populate Sample Data
```bash
# Populate the database with sample data
node populate-db.js
```

This will create:
- **12 users** (2 admins, 5 residents, 5 workers)
- **Sample grocery items** with stock
- **Sample orders, invoices, maintenance requests**
- **Notifications**

### 5. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will automatically find an available port starting from 5000.

## 📚 API Documentation

### Access Interactive Documentation
Once the server is running, visit:
```
http://localhost:5000/api-docs
```

### Authentication
All API endpoints (except registration and login) require authentication via JWT token:

```bash
# Include in headers
Authorization: Bearer your_jwt_token_here
```

### Main API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

#### Grocery Management
- `GET /api/grocery/items` - Get all grocery items
- `POST /api/grocery/items` - Create new item (Admin only)
- `PUT /api/grocery/items/:id` - Update item (Admin only)
- `DELETE /api/grocery/items/:id` - Delete item (Admin only)
- `POST /api/grocery/orders` - Create new order
- `GET /api/grocery/orders` - Get orders (filtered by user role)
- `PUT /api/grocery/orders/:id/status` - Update order status (Admin only)

#### Maintenance Management
- `POST /api/maintenance` - Create maintenance request
- `GET /api/maintenance` - Get maintenance requests (filtered by user role)
- `GET /api/maintenance/:id` - Get specific maintenance request
- `PUT /api/maintenance/:id/status` - Update request status (Admin only)
- `PUT /api/maintenance/:id/assign` - Assign request to worker (Admin only)
- `POST /api/maintenance/:id/notes` - Add note to request

#### Invoice Management
- `GET /api/invoices` - Get invoices (filtered by user role)
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices` - Create new invoice (Admin only)
- `PUT /api/invoices/:id/status` - Update payment status (Admin only)

#### PDF Generation
- `GET /api/pdf/invoice/:id` - Generate invoice PDF
- `GET /api/pdf/order/:id` - Generate order receipt
- `GET /api/pdf/report?month=1&year=2024` - Generate monthly report (Admin only)

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications` - Send notification (Admin only)

## 👥 User Roles & Permissions

### Admin Users
- **Full system access**
- Manage grocery items and inventory
- Process orders and update statuses
- Assign and manage maintenance requests
- Generate invoices and reports
- Send notifications to users
- View all system data

### Resident Users
- **Personal account management**
- Browse and order grocery items
- Submit maintenance requests
- View personal invoices and orders
- Receive notifications
- Generate personal receipts and invoices

### Worker Users
- **Limited maintenance access**
- View assigned maintenance requests
- Update maintenance progress
- Add notes to maintenance requests
- View personal profile and notifications

## 🔧 Default Login Credentials

After running `populate-db.js`, use these credentials:

### Admin Accounts
- Username: `admin1` / Password: `admin123`
- Username: `admin2` / Password: `admin123`

### Resident Accounts
- Username: `resident1` / Password: `resident123`
- Username: `resident2` / Password: `resident123`
- Username: `resident3` / Password: `resident123`
- Username: `resident4` / Password: `resident123`
- Username: `resident5` / Password: `resident123`

### Worker Accounts
- Username: `worker1` / Password: `worker123`
- Username: `worker2` / Password: `worker123`
- Username: `worker3` / Password: `worker123`
- Username: `worker4` / Password: `worker123`
- Username: `worker5` / Password: `worker123`

## 📱 Example API Usage

### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "admin123"
  }'
```

### Create Grocery Order
```bash
curl -X POST http://localhost:5000/api/grocery/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "item": "GROCERY_ITEM_ID",
        "quantity": 2
      }
    ],
    "paymentMethod": "cash",
    "notes": "Please deliver to room 101"
  }'
```



### Submit Maintenance Request
```bash
curl -X POST http://localhost:5000/api/maintenance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "plumbing",
    "description": "Leaking faucet in bathroom",
    "priority": "medium"
  }'
```

## 🗂 Database Schema

### User Model
```javascript
{
  username: String (unique),
  password: String (hashed),
  name: String,
  type: ["admin", "resident", "worker"],
  roomNumber: String,
  days: Number,
  contactNumber: String,
  email: String (optional),
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Grocery Order Model
```javascript
{
  user: ObjectId (ref: User),
  roomNumber: String,
  orderNumber: String (unique),
  items: [{
    item: ObjectId (ref: GroceryItem),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: ["pending", "processing", "ready", "delivered", "cancelled"],
  paymentMethod: ["cash", "room_charge"],
  paymentStatus: ["pending", "paid"],
  notes: String,
  deliveryTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Maintenance Request Model
```javascript
{
  user: ObjectId (ref: User),
  roomNumber: String,
  type: ["plumbing", "electrical", "furniture", "appliance", "other"],
  description: String,
  priority: ["low", "medium", "high", "urgent"],
  status: ["pending", "in_progress", "completed", "cancelled"],
  assignedTo: ObjectId (ref: User),
  completedAt: Date,
  images: [String],
  notes: [{
    user: ObjectId (ref: User),
    content: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice Model
```javascript
{
  invoiceNumber: String (unique),
  user: ObjectId (ref: User),
  roomNumber: String,
  amount: Number,
  dueDate: Date,
  status: ["pending", "paid", "overdue"],
  category: ["rent", "utilities", "groceries", "maintenance", "other"],
  description: String,
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  pdfUrl: String,
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Password hashing** using bcryptjs
- **JWT token authentication** with expiration
- **Role-based authorization** middleware
- **Request validation** using express-validator
- **Security headers** via Helmet
- **CORS protection** with configurable origins
- **Input sanitization** and validation
- **File upload restrictions** and validation

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```bash
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Handling
- **Centralized error handling** middleware
- **Detailed error logging** in development
- **Sanitized error responses** in production
- **HTTP status code compliance**

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
The application includes test configurations using Jest framework.

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-super-secure-production-secret
# Add other production-specific variables
```

### Docker Deployment (Optional)
Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### PM2 Deployment
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/app.js --name "worker-housing-backend"

# Monitor
pm2 monit

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🛠 Maintenance & Administration

### Database Management
```bash
# Clear database
node clear-db.js

# Re-populate with fresh data
node populate-db.js
```

### Log Management
- Application logs are output to console
- Use PM2 or similar process managers for log rotation
- Configure external logging services as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the `package.json` file for details.

## 📞 Support

For support and questions:
- **Email:** support@workerhousing.com
- **Documentation:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/health

## 🗺 Roadmap

- [ ] Real-time chat system for maintenance requests
- [ ] Mobile app integration with push notifications
- [ ] Advanced reporting and analytics
- [ ] Integration with payment gateways
- [ ] Multi-property management support
- [ ] Advanced inventory management with suppliers
- [ ] Automated billing and recurring payments

---

**Built with ❤️ for worker housing management**
