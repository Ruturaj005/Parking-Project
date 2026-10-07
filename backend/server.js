require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

// Make io accessible to routers
app.set('io', io);

app.use(express.json());
app.use(cors());

const User = require('./models/User');
const seedData = require('./seed');

connectDB().then(async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            console.log("Database is empty, seeding data...");
            await seedData();
        }
    } catch(err) {
        console.error("Error seeding data on startup:", err);
    }
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
