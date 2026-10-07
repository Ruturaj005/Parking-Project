# SmartPark - Automated Parking Management System

## Project Overview
SmartPark is a modern, responsive, and robust full-stack web application designed for automated parking management. It eliminates the hassle of manually finding parking spots by intelligently allocating the best available slot based on vehicle type and distance from the entrance. The application supports users in managing their vehicles, booking slots, and simulating payments, while providing an administrative dashboard for monitoring and managing the entire parking infrastructure.

## Features
- **Intelligent Slot Allocation:** Automatically assigns the closest available parking slot for the specific vehicle type (Bike, Car, SUV, EV).
- **Double Booking Prevention:** Handled via MongoDB Transactions to prevent race conditions.
- **Dynamic Pricing Calculator:** Calculates fees dynamically based on duration and vehicle type.
- **Real-Time Updates:** Slot statuses update dynamically using Socket.io (e.g., changes visually from Available to Occupied on the admin screen).
- **QR Code Integration:** Secure QR code generation for entry and exit scanning.
- **Admin Analytics Dashboard:** Visualizes revenue, occupancy, and vehicle distribution using Recharts.
- **Responsive UI:** Clean, dark-mode software product-style user interface.
- **Cancellation & Refunds:** Auto-calculates refunds depending on the proximity to the scheduled entry time.

## Technology Stack
- **Frontend:** React.js, Vite, Axios, React Router, Recharts, Lucide-React, qrcode.react
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB (Mongoose), `mongodb-memory-server` as a hassle-free fallback.
- **Security:** JWT authentication, bcryptjs password hashing.

## Folder Structure
```
.
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── server.js
│   └── seed.js
└── frontend
    └── src
        ├── components
        ├── context
        ├── hooks
        ├── layouts
        ├── pages
        ├── services
        ├── utils
        ├── App.jsx
        └── main.jsx
```

## Setup Instructions

### Environment Variables
In the `backend` folder, the `.env` file is already created:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartpark
JWT_SECRET=supersecretjwtkeythatshouldbechanged
```
*Note: If local MongoDB is not running, the backend seamlessly falls back to `mongodb-memory-server` ensuring the app runs immediately.*

### Running the Project

1. **Seed the database & test backend**
```bash
cd backend
npm install
node seed.js
npm start
```
*Wait for "Server running on port 5000" and "MongoDB Connected"*

2. **Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

### Default Accounts
- **Admin**: `admin@smartpark.com` / `password123`
- **User**: `john@example.com` / `password123`

## Testing Instructions
1. Login as `john@example.com`.
2. Go to "Find Parking" and create a booking.
3. Observe automatic allocation. 
4. Check "Bookings" page and click the booking to see details and QR code.
5. Click "Simulate Entry" -> status becomes ACTIVE.
6. Click "Simulate Exit" -> status becomes COMPLETED, amount is calculated.
7. Click "Pay Now" -> status becomes PAID.
8. Login as Admin and visit Dashboard to see revenue/occupancy updates!
