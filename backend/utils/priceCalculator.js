const priceCalculator = (vehicleType, durationMinutes) => {
    // Default pricing:
    // BIKE: First hour = ₹20, Each additional hour = ₹10
    // CAR: First hour = ₹40, Each additional hour = ₹20
    // SUV: First hour = ₹50, Each additional hour = ₹25
    // EV: First hour = ₹40, Each additional hour = ₹20

    const rates = {
        BIKE: { first: 20, add: 10 },
        CAR: { first: 40, add: 20 },
        SUV: { first: 50, add: 25 },
        EV: { first: 40, add: 20 }
    };

    const rate = rates[vehicleType];
    if (!rate) return 0;

    // For partial hours, round up to the next hour.
    const hours = Math.ceil(durationMinutes / 60);

    if (hours === 0) return rate.first; // minimum charge
    
    if (hours === 1) {
        return rate.first;
    } else {
        return rate.first + (hours - 1) * rate.add;
    }
};

module.exports = { priceCalculator };
