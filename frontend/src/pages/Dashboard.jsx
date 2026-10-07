import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Car, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/bookings')
      ]);
      setVehicles(vRes.data.data);
      setBookings(bRes.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const activeBooking = bookings.find(b => ['CONFIRMED', 'ACTIVE'].includes(b.status));

  return (
    <div className="animate-fade-in">
      <h2 className="mb-4">Welcome, {user.name}!</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div style={{ background: 'rgba(79,70,229,0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Car color="var(--primary)" />
            </div>
            <div>
              <p className="text-muted">Total Vehicles</p>
              <h3 className="text-2xl">{vehicles.length}</h3>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '50%' }}>
              <CheckCircle color="var(--secondary)" />
            </div>
            <div>
              <p className="text-muted">Active Booking</p>
              <h3 className="text-2xl">{activeBooking ? '1' : '0'}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3>Current Status</h3>
          {activeBooking ? (
            <div className="card mt-4">
              <div className="flex justify-between items-center mb-4">
                <h4>{activeBooking.parkingId?.name}</h4>
                <span className={`status-badge badge-${activeBooking.status}`}>{activeBooking.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Slot</p>
                  <p className="text-xl">{activeBooking.slotId?.slotNumber}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Vehicle</p>
                  <p className="text-xl">{activeBooking.vehicleId?.vehicleNumber}</p>
                </div>
              </div>
              <div className="text-center mt-4">
                <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block' }}>
                    <QRCodeSVG value={JSON.stringify({ bookingId: activeBooking._id })} size={150} />
                </div>
                <p className="text-muted mt-2" style={{fontSize: '12px'}}>Scan for entry/exit</p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <Link to="/bookings" className="btn btn-secondary w-full">View Details</Link>
              </div>
            </div>
          ) : (
            <div className="card mt-4 text-center p-8">
              <Car size={48} color="var(--text-muted)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <p className="text-muted mb-4">No active bookings right now.</p>
              <Link to="/search" className="btn btn-primary">Find Parking Space</Link>
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3>Recent Bookings</h3>
            <Link to="/bookings" className="text-muted" style={{ fontSize: '0.875rem' }}>View All</Link>
          </div>
          <div className="card" style={{ padding: 0 }}>
            {bookings.slice(0, 3).map(b => (
              <div key={b._id} className="flex justify-between items-center" style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight: 500 }}>{b.parkingId?.name || 'Parking'}</p>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`status-badge badge-${b.status}`}>{b.status}</span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-center text-muted p-4">No recent bookings</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
