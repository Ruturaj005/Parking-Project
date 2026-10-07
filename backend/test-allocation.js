async function fetchAPI(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`http://localhost:5000/api${path}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Error');
    return data;
}

async function testSimultaneousBookings() {
    console.log("=== Testing Automatic Slot Allocation & Race Conditions ===");
    
    try {
        console.log("1. Creating test users and vehicles...");
        const u1 = await fetchAPI('/auth/register', 'POST', { name: 'User 1', email: `test1_${Date.now()}@test.com`, password: 'password', phone: '123' });
        const u2 = await fetchAPI('/auth/register', 'POST', { name: 'User 2', email: `test2_${Date.now()}@test.com`, password: 'password', phone: '123' });
        
        const token1 = u1.data.token;
        const token2 = u2.data.token;

        const v1 = await fetchAPI('/vehicles', 'POST', { vehicleNumber: `TEST1_${Date.now()}`, vehicleType: 'CAR' }, token1);
        const v2 = await fetchAPI('/vehicles', 'POST', { vehicleNumber: `TEST2_${Date.now()}`, vehicleType: 'CAR' }, token2);

        const parkings = await fetchAPI('/parking', 'GET', null, token1);
        const parkingId = parkings.data[0]._id;

        const d = new Date();
        d.setHours(d.getHours() + 1);
        const entryTime = d.toISOString();

        console.log("2. Simulating simultaneous booking requests for the exact same best slot...");
        
        // Fire requests concurrently without waiting
        const req1 = fetchAPI('/bookings', 'POST', { vehicleId: v1.data._id, parkingId, scheduledEntryTime: entryTime }, token1);
        const req2 = fetchAPI('/bookings', 'POST', { vehicleId: v2.data._id, parkingId, scheduledEntryTime: entryTime }, token2);

        const results = await Promise.allSettled([req1, req2]);

        results.forEach((res, index) => {
            if (res.status === 'fulfilled') {
                console.log(`[User ${index + 1}] Booking SUCCESS: Slot ID -> ${res.value.data.slotId}`);
            } else {
                console.log(`[User ${index + 1}] Booking FAILED: ${res.reason.message}`);
            }
        });

        if (results[0].status === 'fulfilled' && results[1].status === 'fulfilled') {
             const slot1 = results[0].value.data.slotId;
             const slot2 = results[1].value.data.slotId;
             if (slot1 === slot2) {
                 console.log("❌ FAILURE: Both users received the exact same slot!");
             } else {
                 console.log("✅ SUCCESS: Both users received DIFFERENT slots despite simultaneous requests!");
             }
        }
        
    } catch (err) {
        console.error("Test setup error:", err.message);
    }
}

testSimultaneousBookings();
