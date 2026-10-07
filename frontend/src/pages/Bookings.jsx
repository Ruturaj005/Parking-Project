import { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm('Cancel this booking?')) return;
    try {
      const res = await api.patch(`/bookings/${id}/cancel`);
      alert(res.data.message);
      fetchBookings();
      setSelectedBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleSimulateEntry = async (id) => {
    try {
      await api.post(`/bookings/${id}/entry`);
      fetchBookings();
      setSelectedBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed entry');
    }
  };

  const handleSimulateExit = async (id) => {
    try {
      await api.post(`/bookings/${id}/exit`);
      fetchBookings();
      setSelectedBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed exit');
    }
  };

  const handleSimulatePayment = async (id) => {
    try {
      const res = await api.post('/payments/create', { bookingId: id });
      const paymentId = res.data.data._id;
      await api.post(`/payments/${paymentId}/success`);
      alert('Payment Successful!');
      fetchBookings();
      setSelectedBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6">Booking History</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {bookings.map(b => (
          <div key={b._id} className="card flex justify-between items-center" style={{cursor: 'pointer'}} onClick={() => setSelectedBooking(b)}>
            <div>
              <h4 style={{marginBottom: '0.25rem'}}>{b.parkingId?.name}</h4>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>
                Vehicle: {b.vehicleId?.vehicleNumber} | Slot: {b.slotId?.slotNumber}
              </p>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>
                Date: {new Date(b.scheduledEntryTime).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className={`status-badge badge-${b.status} mb-2 block`}>{b.status}</span>
              {b.amount && <span style={{fontWeight: 600}}>₹{b.amount}</span>}
              {b.paymentStatus === 'PAID' && <span className="text-muted text-sm ml-2">(Paid)</span>}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-muted">No bookings found.</p>}
      </div>

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3>Booking Details</h3>
              <span className={`status-badge badge-${selectedBooking.status}`}>{selectedBooking.status}</span>
            </div>
            
            <div className="mb-4">
              <p className="text-muted text-sm">Parking Location</p>
              <p className="font-medium">{selectedBooking.parkingId?.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-muted text-sm">Vehicle</p>
                <p>{selectedBooking.vehicleId?.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-muted text-sm">Slot Number</p>
                <p>{selectedBooking.slotId?.slotNumber}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-muted text-sm">Scheduled Entry</p>
              <p>{new Date(selectedBooking.scheduledEntryTime).toLocaleString()}</p>
            </div>
            
            {(selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'ACTIVE') && (
              <div className="text-center my-6">
                <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block' }}>
                  <QRCodeSVG value={JSON.stringify({ bookingId: selectedBooking._id })} size={120} />
                </div>
              </div>
            )}

            {selectedBooking.status === 'COMPLETED' && (
              <div className="p-4 mb-4" style={{background: 'var(--surface-light)', borderRadius: '0.5rem'}}>
                <div className="flex justify-between mb-2">
                  <span>Duration:</span>
                  <span>{selectedBooking.duration} mins</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Amount:</span>
                  <span style={{fontWeight: 'bold'}}>₹{selectedBooking.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className={selectedBooking.paymentStatus === 'PAID' ? 'text-success' : 'text-warning'}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-6">
              {selectedBooking.status === 'CONFIRMED' && (
                <>
                  <button className="btn btn-success flex-1" onClick={() => handleSimulateEntry(selectedBooking._id)}>Simulate Entry</button>
                  <button className="btn btn-danger flex-1" onClick={() => handleCancel(selectedBooking._id)}>Cancel Booking</button>
                </>
              )}
              {selectedBooking.status === 'ACTIVE' && (
                <button className="btn btn-primary flex-1" onClick={() => handleSimulateExit(selectedBooking._id)}>Simulate Exit</button>
              )}
              {selectedBooking.status === 'COMPLETED' && selectedBooking.paymentStatus === 'PENDING' && (
                <button className="btn btn-primary flex-1" onClick={() => handleSimulatePayment(selectedBooking._id)}>Pay ₹{selectedBooking.amount} Now</button>
              )}
              <button className="btn btn-secondary flex-1" onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
