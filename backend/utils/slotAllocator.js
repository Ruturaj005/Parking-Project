const ParkingSlot = require('../models/ParkingSlot');

const findBestParkingSlot = async (vehicleType, parkingId) => {
    // 1. Only consider AVAILABLE slots
    // 2. Vehicle type must be compatible
    const slots = await ParkingSlot.find({
        parkingId,
        slotType: vehicleType,
        status: 'AVAILABLE'
    }).populate('floorId');
    
    if (!slots || slots.length === 0) {
        return null;
    }
    
    // Sort logic
    // 3. Prefer closest floor to entrance (lowest floor number)
    // 4. Prefer smallest distanceFromEntrance
    // 5. Lowest slot number fallback
    slots.sort((a, b) => {
        const floorA = a.floorId ? a.floorId.floorNumber : 0;
        const floorB = b.floorId ? b.floorId.floorNumber : 0;
        
        if (floorA !== floorB) {
            return floorA - floorB;
        }
        if (a.distanceFromEntrance !== b.distanceFromEntrance) {
            return a.distanceFromEntrance - b.distanceFromEntrance;
        }
        return a.slotNumber.localeCompare(b.slotNumber);
    });

    return slots[0];
};

module.exports = { findBestParkingSlot };
