# Paisalo Digital Limited - User & Department Management System

A comprehensive user and department management system built with MongoDB, Express.js, React, and Node.js (MERN Stack) for Paisalo Digital Limited's survey management platform.

## 🏢 Company Information

**Paisalo Digital Limited** - Empowering lives one loan at a time with our High Tech : High Touch approach.

**Website**: [https://paisalo.in](https://paisalo.in)

**Motto**: "BHARAT AB RUKNA NAHI" (India will not stop now)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [UI Components](#ui-components)
- [Authentication](#authentication)
- [Contributing](#contributing)

## ✨ Features

### 👥 User Management
- **Complete CRUD Operations**: Create, read, update, and delete users
- **Role-Based Access Control**: Admin, Manager, Employee roles
- **Department Assignment**: Link users to departments
- **Manager Relationships**: Establish reporting hierarchies
- **Employee Details**: Employee ID, phone, position, join date
- **Profile Management**: User profiles with avatars and contact info
- **Account Status**: Active/inactive user management
- **Advanced Search**: Search by name, email, employee ID, position
- **Filtering**: Filter by department, role, status
- **Pagination**: Efficient handling of large user lists

### 🏢 Department Management
- **Hierarchical Structure**: Parent-child department relationships
- **Manager Assignment**: Assign department managers
- **Budget Tracking**: Department budget management with currency formatting
- **Employee Count**: Real-time employee count per department
- **Location Management**: Department location tracking
- **Safety Features**: Prevents deletion of departments with employees
- **Department Statistics**: Comprehensive department analytics
- **Search & Filter**: Advanced search and filtering capabilities

### 🎨 Paisalo-Themed UI
- **Corporate Branding**: Professional blue and orange color scheme
- **Responsive Design**: Mobile-friendly interface
- **Material-UI Integration**: Consistent design system
- **Custom Theme**: Paisalo Digital Limited branded theme
- **Interactive Components**: Modern UI with smooth animations
- **Data Visualization**: Statistics cards and charts
- **Form Validation**: Real-time form validation with error handling

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Role-Based Authorization**: Granular access control
- **Rate Limiting**: API rate limiting for security
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers and protection

## 🛠 Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logger
- **Express Rate Limit**: Rate limiting middleware

### Frontend
- **React**: User interface library
- **Material-UI (MUI)**: React component library
- **React Router**: Client-side routing
- **Formik**: Form handling
- **Yup**: Form validation
- **React Toastify**: Toast notifications
- **Custom Paisalo Theme**: Corporate branding

## 📊 Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  name: String (required),
  password: String (hashed, required),
  department: ObjectId (ref: Department, required),
  role: String (enum: ['admin', 'manager', 'employee']),
  managerId: ObjectId (ref: User),
  employeeId: String (unique),
  phoneNumber: String,
  position: String,
  joinDate: Date,
  isActive: Boolean,
  directReports: [ObjectId] (ref: User),
  lastLogin: Date,
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Department Schema
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  code: String (unique, required, uppercase),
  description: String,
  managerId: ObjectId (ref: User),
  parentDepartment: ObjectId (ref: Department),
  budget: Number,
  location: String,
  isActive: Boolean,
  employeeCount: Number,
  subDepartments: [ObjectId] (ref: Department),
  establishedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /logout` - Logout user
- `POST /refresh` - Refresh JWT token

### User Routes (`/api/users`)
- `GET /` - Get all users (with pagination and filtering)
- `GET /:id` - Get single user
- `POST /` - Create new user (Admin only)
- `PUT /:id` - Update user
- `DELETE /:id` - Deactivate user (Admin only)
- `GET /managers/list` - Get list of managers
- `GET /:id/hierarchy` - Get user's reporting hierarchy
- `GET /department/:departmentId` - Get users by department

### Department Routes (`/api/departments`)
- `GET /` - Get all departments (with pagination and filtering)
- `GET /tree` - Get department tree structure
- `GET /:id` - Get single department
- `POST /` - Create new department (Admin only)
- `PUT /:id` - Update department (Admin only)
- `DELETE /:id` - Delete department (Admin only)
- `GET /:id/employees` - Get employees in department
- `GET /:id/stats` - Get department statistics

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd paisalo-survey-management

# Install server dependencies
cd server
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the server
npm run dev
```

### Frontend Setup
```bash
# Install client dependencies
cd client
npm install

# Start the development server
npm start
```

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/paisalo_survey_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@paisalo.in
EMAIL_PASS=your-email-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📱 Usage

### Starting the Application
1. Start MongoDB service
2. Start the backend server: `npm run dev`
3. Start the frontend application: `npm start`
4. Access the application at `http://localhost:3000`

### Default Admin User
```javascript
{
  email: "admin@paisalo.in",
  password: "admin123",
  role: "admin"
}
```

### User Management Workflow
1. **Login** as admin
2. **Navigate** to User Management
3. **Create** departments first
4. **Add** users and assign to departments
5. **Set** manager relationships
6. **Manage** user roles and permissions

### Department Management Workflow
1. **Create** parent departments
2. **Add** subdepartments if needed
3. **Assign** managers to departments
4. **Set** budgets and locations
5. **Monitor** employee counts and statistics

## 🎨 UI Components

### PaisaloUserManagement
- **Location**: `client/src/pages/admin/PaisaloUserManagement.js`
- **Features**: Complete user CRUD with Paisalo branding
- **Components**: Data table, forms, filters, statistics cards
- **Validation**: Formik + Yup validation
- **Theme**: Paisalo corporate colors

### PaisaloDepartmentManagement
- **Location**: `client/src/pages/admin/PaisaloDepartmentManagement.js`
- **Features**: Department management with hierarchy support
- **Components**: Department tree, budget tracking, employee counts
- **Validation**: Department code format, hierarchy validation
- **Theme**: Consistent Paisalo branding

### Paisalo Theme
- **Location**: `client/src/theme/paisaloTheme.js`
- **Colors**: Corporate blue (#1565C0) and orange (#FF7043)
- **Typography**: Professional font system
- **Components**: Customized Material-UI components
- **Responsive**: Mobile-first design approach

## 🔐 Authentication

### JWT Implementation
- **Token Generation**: On successful login
- **Token Storage**: Client-side (localStorage/sessionStorage)
- **Token Validation**: Middleware on protected routes
- **Token Refresh**: Automatic token refresh mechanism
- **Role-Based Access**: Different access levels for different roles

### Password Security
- **Hashing**: bcrypt with salt rounds
- **Validation**: Minimum length and complexity requirements
- **Change Password**: Secure password change workflow
- **Reset Password**: Password reset functionality (future enhancement)

## 📈 Performance Features

### Database Optimization
- **Indexing**: Strategic database indexes for performance
- **Pagination**: Efficient data loading with pagination
- **Population**: Optimized MongoDB population queries
- **Aggregation**: Complex queries using MongoDB aggregation

### Frontend Optimization
- **Lazy Loading**: Component lazy loading
- **Memoization**: React.memo for performance
- **Debouncing**: Search input debouncing
- **Caching**: API response caching

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📚 API Documentation

### Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors
}
```

### Pagination Format
```javascript
{
  "currentPage": 1,
  "totalPages": 10,
  "totalUsers": 100,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@paisalo.in
- **Website**: [https://paisalo.in](https://paisalo.in)
- **Documentation**: [API Documentation](docs/api.md)

## 🙏 Acknowledgments

- **Paisalo Digital Limited** for the opportunity
- **Material-UI** for the excellent component library
- **MongoDB** for the flexible database solution
- **React** community for the amazing ecosystem

---

**Paisalo Digital Limited** - Empowering lives one loan at a time with our High Tech : High Touch approach.

*"BHARAT AB RUKNA NAHI"* 🇮🇳

