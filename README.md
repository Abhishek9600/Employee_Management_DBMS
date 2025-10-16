<!-- Employee Management DBMS Project  -->

# Employee Management System

A comprehensive full-stack web application for managing company employees, built with React, Node.js, Express, and PostgreSQL.

## Features

- **Complete CRUD Operations**: Create, Read, Update, and Delete employees
- **Department Management**: View departments with employee counts
- **Advanced Search & Filter**: Search by name, email, job title; filter by department and status
- **Real-time Dashboard**: Statistics and overview of employee data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **RESTful API**: Clean API architecture with proper error handling
- **Employee Status Tracking**: Track employee status (Active, Inactive, On Leave)

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- CORS
- Express Validator

### Tools
- pgAdmin 4
- Nodemon

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd employee-management-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit the `.env` file:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=employee_management
DB_PASSWORD=your_password_here
DB_PORT=5432
PORT=5000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### 3. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE employee_management;

# Connect to the database
\c employee_management

# Run the schema (from the backend/database/schema.sql file)
\i backend/database/schema.sql
```

Or use pgAdmin 4 to import the schema.

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Start the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

## Database Schema

The application uses the following main tables:

### Employees Table
- Personal information (name, email, phone)
- Employment details (job title, department, salary, hire date)
- Status tracking (active, inactive, on_leave)
- Address information

### Departments Table
- Department names and descriptions
- Automatic employee count calculations

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees with department info
- `GET /api/employees/:id` - Get specific employee details
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee information
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments with employee counts

### System
- `GET /api/health` - Health check endpoint
- `GET /api/test-db` - Database connection test

## Usage Guide

### 1. Dashboard
- View overall statistics (total employees, departments, active employees, salary totals)
- Access quick actions (Add Employee, Generate Report, Mark Attendance)
- See recent hires and department summaries

### 2. Employee Management
- **Add Employee**: Click "Add Employee" button and fill the form
- **Edit Employee**: Click "Edit" button on any employee record
- **Delete Employee**: Click "Delete" button (with confirmation)
- **Search & Filter**: Use search bar and filters to find specific employees

### 3. Department Management
- View all departments with employee counts
- See which departments have the most employees

## Project Structure

```
employee-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── employeeController.js
│   │   └── departmentController.js
│   ├── routes/
│   │   ├── employees.js
│   │   └── departments.js
│   ├── database/
│   │   └── schema.sql
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── EmployeeForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── DebugPanel.jsx
│   │   │   └── SearchFilter.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if port 5000 is available
   - Verify PostgreSQL is running
   - Check environment variables in `.env`

2. **Database connection failed**
   - Verify PostgreSQL credentials
   - Check if database exists
   - Ensure PostgreSQL service is running

3. **Frontend not connecting to backend**
   - Check if backend is running on port 5000
   - Verify CORS configuration
   - Check browser console for errors

4. **CRUD operations not working**
   - Check browser network tab for API calls
   - Verify backend terminal for errors
   - Check database connection

### Debug Tools

- Frontend Debug Panel: Available in the web app for connection testing
- Browser Developer Tools: Check console and network tabs
- Backend Logging: Detailed logs in the terminal

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Use process manager like PM2
3. Configure reverse proxy (nginx)

### Frontend Deployment
1. Build the project: `npm run build`
2. Serve static files with a web server
3. Configure API URL for production

### Database Deployment
1. Use cloud PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
2. Run schema migration
3. Set up proper backups

## Development

### Adding New Features
1. Backend: Add route → controller → database query
2. Frontend: Add component → API service → integration

### Code Structure
- Backend: MVC pattern with separate concerns
- Frontend: Component-based architecture with hooks
- API: RESTful design with consistent response format

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Security Features

- Input validation on both frontend and backend
- SQL injection prevention with parameterized queries
- CORS configuration for controlled access
- Error handling without exposing sensitive information

## Sample Data

The application comes with sample data including:
- Multiple departments (HR, IT, Finance, Marketing, Operations)
- Sample employees with various roles and salaries
- Realistic employee information for testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for educational purposes as part of a DBMS minor project.

## Contributors

- Abhishek Chaubey
- 2100290130031
- B.Tech CSE 3rd Year

## Submission Date

October 15, 2025

## Demonstration Features

When presenting the project, demonstrate:

1. Complete CRUD operations (Create, Read, Update, Delete)
2. Real-time data updates without page refresh
3. Advanced search and filtering capabilities
4. Responsive design on different screen sizes
5. Error handling and user feedback
6. Database connectivity and data persistence
7. RESTful API usage

---

**Note**: This is a full-stack application designed for learning purposes. For production use, additional security measures, authentication, and validation should be implemented.