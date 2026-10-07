const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Parking = require('./models/Parking');
const Floor = require('./models/Floor');
const ParkingSlot = require('./models/ParkingSlot');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        
        await User.deleteMany();
        await Vehicle.deleteMany();
        await Parking.deleteMany();
        await Floor.deleteMany();
        await ParkingSlot.deleteMany();
        await Booking.deleteMany();
        await Payment.deleteMany();

        console.log('Database Cleared');

        const usersData = [
            { name: 'Admin User', email: 'admin@smartpark.com', password: 'password123', phone: '9999999999', role: 'ADMIN' },
            { name: 'John Doe', email: 'john@example.com', password: 'password123', phone: '9888888888', role: 'USER' },
            { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', phone: '9777777777', role: 'USER' },
            { name: 'Mike Ross', email: 'mike@example.com', password: 'password123', phone: '9666666666', role: 'USER' }
        ];
        const users = [];
        for (const u of usersData) {
            users.push(await User.create(u));
        }
        console.log('Users added');

        const vehicles = await Vehicle.insertMany([
            { userId: users[1]._id, vehicleNumber: 'MH10AB1234', vehicleType: 'CAR', brand: 'Honda', model: 'City', color: 'White' },
            { userId: users[1]._id, vehicleNumber: 'MH12PQ5678', vehicleType: 'BIKE', brand: 'Yamaha', model: 'R15', color: 'Blue' },
            { userId: users[2]._id, vehicleNumber: 'DL01XY9999', vehicleType: 'SUV', brand: 'Toyota', model: 'Fortuner', color: 'Black' },
            { userId: users[3]._id, vehicleNumber: 'KA05EV0001', vehicleType: 'EV', brand: 'Tata', model: 'Nexon EV', color: 'Teal' }
        ]);
        console.log('Vehicles added');

        const parkings = await Parking.insertMany([
            { name: 'City Center Mall Parking', location: 'Downtown', description: 'Premium mall parking with EV charging', totalFloors: 2, totalSlots: 20 },
            { name: 'Tech Park Basement', location: 'IT Corridor', description: 'Secure corporate parking', totalFloors: 1, totalSlots: 10 }
        ]);
        console.log('Parkings added');

        for (let p of parkings) {
            for (let f = 1; f <= p.totalFloors; f++) {
                const floor = await Floor.create({ parkingId: p._id, floorNumber: f, name: `Floor ${f}` });
                
                const slotsPerFloor = p.totalSlots / p.totalFloors;
                const slotTypes = ['CAR', 'BIKE', 'SUV', 'EV'];
                for (let s = 1; s <= slotsPerFloor; s++) {
                    await ParkingSlot.create({
                        parkingId: p._id,
                        floorId: floor._id,
                        slotNumber: `F${f}-${s.toString().padStart(2, '0')}`,
                        slotType: slotTypes[s % 4],
                        status: s === 5 ? 'MAINTENANCE' : 'AVAILABLE',
                        distanceFromEntrance: s * 10
                    });
                }
            }
        }
        console.log('Floors and Slots added');

        console.log('Data Imported Successfully');
        if (require.main === module) process.exit(0);
    } catch (error) {
        console.error(`Error with data import: ${error}`);
        if (require.main === module) process.exit(1);
    }
};

if (require.main === module) {
    seedData();
}

module.exports = seedData;
