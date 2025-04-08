# Website Monitoring Tool

A comprehensive full-stack application for monitoring website availability, performance, and sending alerts when issues are detected.

## Features

- **Website Monitoring:** Track uptime and response times for your websites
- **Real-time Dashboard:** View the status of all monitored websites at a glance
- **Detailed Analytics:** Analyze response time trends and historical data
- **Smart Alerting:** Get notified via email when a website goes down
- **Custom Alerts:** Configure alert settings for each website
- **User Authentication:** Secure login system with role-based access control

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for email alerts

### Frontend
- React with Vite
- Material-UI for UI components
- React Router for navigation
- Chart.js for data visualization
- Axios for API communication

## Project Structure

```
website-monitor/
├── backend/               # Node.js backend code
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose data models
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Helper utilities
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
│
└── frontend-vite/         # React frontend code
    ├── public/            # Static assets
    ├── src/               # Source code
    │   ├── components/    # Reusable UI components
    │   ├── context/       # React context providers
    │   ├── pages/         # Page components
    │   ├── App.jsx        # Main app component
    │   └── main.jsx       # Entry point
    ├── index.html         # HTML template
    └── package.json       # Frontend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory
   ```
   cd backend
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/website-monitor
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the server
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd frontend-vite
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```
4. Start the development server
   ```
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Websites
- `GET /api/websites` - Get all websites
- `POST /api/websites` - Add a new website
- `GET /api/websites/:id` - Get a specific website
- `PUT /api/websites/:id` - Update a website
- `DELETE /api/websites/:id` - Delete a website
- `GET /api/websites/:id/history` - Get status history
- `GET /api/websites/:id/downtime` - Get downtime incidents

### Alerts
- `GET /api/alerts/:websiteId` - Get alert settings
- `PUT /api/alerts/:websiteId` - Update alert settings
- `POST /api/alerts/:websiteId/test` - Send a test alert

### Analytics
- `GET /api/analytics/response-time` - Get overall response time data
- `GET /api/analytics/response-time/:websiteId` - Get website response time data

### Users
- `GET /api/users/me` - Get current user info
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/notifications` - Get notification settings
- `PUT /api/users/notifications` - Update notification settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with the MERN stack (MongoDB, Express, React, Node.js)
- UI designed with Material-UI
- Charts powered by Chart.js 