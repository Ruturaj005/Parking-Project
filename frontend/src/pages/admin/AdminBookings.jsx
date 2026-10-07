import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      // sort latest first
      const sorted = res.data.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter !== 'ALL' && b.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchEmail = b.userId?.email?.toLowerCase().includes(s);
      const matchVehicle = b.vehicleId?.vehicleNumber?.toLowerCase().includes(s);
      const matchId = b._id.toLowerCase().includes(s);
      if (!matchEmail && !matchVehicle && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6">Bookings Management</h2>
      
      <div className="card mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <input 
            type="text" 
            className="input" 
            placeholder="Search by ID, email, or vehicle number..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="select" style={{width: '200px'}} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card table-container" style={{padding: 0}}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Vehicle</th>
              <th>Parking</th>
              <th>Slot</th>
              <th>Entry Time</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b._id}>
                <td style={{fontFamily: 'monospace', fontSize: '0.8rem'}}>{b._id.slice(-6)}</td>
                <td>
                  <div>{b.userId?.name}</div>
                  <div className="text-muted text-sm">{b.userId?.email}</div>
                </td>
                <td>{b.vehicleId?.vehicleNumber}</td>
                <td>{b.parkingId?.name}</td>
                <td>{b.slotId?.slotNumber}</td>
                <td className="text-sm">{new Date(b.scheduledEntryTime).toLocaleString()}</td>
                <td><span className={`status-badge badge-${b.status}`}>{b.status}</span></td>
                <td>{b.amount ? <span style={{fontWeight: 600}}>₹{b.amount}</span> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && <p className="text-center p-8 text-muted">No bookings found matching criteria.</p>}
      </div>
    </div>
  );
}
