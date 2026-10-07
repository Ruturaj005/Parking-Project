import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, MapPin, Clock } from 'lucide-react';

export default function ParkingSearch() {
  const [parkings, setParkings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({ parkingId: '', vehicleId: '', scheduledEntryTime: '' });
  const [locationInput, setLocationInput] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pricing = {
    BIKE: { first: 20, add: 10 },
    CAR: { first: 40, add: 20 },
    SUV: { first: 50, add: 25 },
    EV: { first: 40, add: 20 }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.parkingId) {
      fetchSlots(formData.parkingId);
    }
  }, [formData.parkingId]);

  const fetchSlots = async (id) => {
    try {
      const res = await api.get(`/parking/${id}/available-slots`);
      setAvailableSlots(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const [pRes, vRes] = await Promise.all([
        api.get('/parking'),
        api.get('/vehicles')
      ]);
      setParkings(pRes.data.data);
      setVehicles(vRes.data.data);
      
      let pId = '', vId = '';
      if (pRes.data.data.length > 0) pId = pRes.data.data[0]._id;
      if (vRes.data.data.length > 0) vId = vRes.data.data[0]._id;
      
      const d = new Date();
      d.setHours(d.getHours() + 1);
      d.setMinutes(0);
      const tzOffset = d.getTimezoneOffset() * 60000; 
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);
      
      setFormData({ parkingId: pId, vehicleId: vId, scheduledEntryTime: localISOTime.substring(0,16) });
      if (pRes.data.data.length > 0) {
        setLocationInput(pRes.data.data[0].location);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.parkingId) {
      return setError('Please select a parking location first.');
    }
    if (!formData.vehicleId) {
      return setError('Please select a vehicle first.');
    }
    if (!formData.scheduledEntryTime) {
      return setError('Please select a scheduled entry time first.');
    }

    setLoading(true);
    try {
      const res = await api.post('/bookings', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book parking slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="text-center mb-8">
        <h2>Find Best Parking Slot</h2>
        <p className="text-muted">Our smart system will automatically assign the best slot for your vehicle type.</p>
      </div>

      <div className="card">
        {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}
        
        <form onSubmit={handleBook}>
          <div className="input-group">
            <label><MapPin size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> Enter Destination / Location</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Downtown, IT Corridor..." 
              value={locationInput}
              onChange={e => {
                const val = e.target.value;
                setLocationInput(val);
                
                // Find matching parking
                const match = parkings.find(p => p.location.toLowerCase().includes(val.toLowerCase()) || p.name.toLowerCase().includes(val.toLowerCase()));
                if (match) {
                  setFormData({...formData, parkingId: match._id});
                } else {
                  setFormData({...formData, parkingId: ''});
                  setAvailableSlots([]);
                }
              }}
            />
            {locationInput && formData.parkingId && (
               <div style={{ fontSize: '0.875rem', color: 'var(--status-available)', marginTop: '0.5rem' }}>
                 Found parking: {parkings.find(p => p._id === formData.parkingId)?.name}
               </div>
            )}
            {locationInput && !formData.parkingId && (
               <div style={{ fontSize: '0.875rem', color: '#EF4444', marginTop: '0.5rem' }}>
                 No parking facility found for this location.
               </div>
            )}
          </div>
          
          <div className="input-group mt-6">
            <label>Select Vehicle</label>
            
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', paddingTop: '0.5rem' }}>
              {vehicles.map(v => (
                <div 
                  key={v._id} 
                  onClick={() => setFormData({...formData, vehicleId: v._id})}
                  style={{
                    minWidth: '200px',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: formData.vehicleId === v._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: formData.vehicleId === v._id ? 'rgba(79, 70, 229, 0.05)' : 'var(--surface-light)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{v.vehicleNumber}</div>
                  <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{v.brand} {v.model}</div>
                  <span className="status-badge mt-2" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)', display: 'inline-block' }}>{v.vehicleType}</span>
                  {formData.vehicleId === v._id && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--primary)' }}>✓</div>
                  )}
                </div>
              ))}
              
              <div 
                onClick={(e) => { e.preventDefault(); navigate('/vehicles'); }}
                style={{
                  minWidth: '200px',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px dashed var(--border)',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div>
                <div style={{ fontWeight: 500 }}>Add Vehicle</div>
              </div>
            </div>
            {vehicles.length === 0 && <p style={{color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem'}}>You have no vehicles. Please add a Car, Bike, SUV or EV first.</p>}
          </div>
            
          <div className="input-group mt-4">
            <label><Clock size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> Scheduled Entry Time</label>
            <input type="datetime-local" className="input" value={formData.scheduledEntryTime} onChange={e => setFormData({...formData, scheduledEntryTime: e.target.value})} />
          </div>

          {(() => {
            const selectedVehicle = vehicles.find(v => v._id === formData.vehicleId);
            const vType = selectedVehicle ? selectedVehicle.vehicleType : null;
            const count = vType ? availableSlots.filter(s => s.slotType === vType).length : availableSlots.length;
            
            return (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Parking Information</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="text-muted">Available Space:</span>
                  <span style={{ fontWeight: '600', color: count > 0 ? 'var(--status-available)' : 'var(--status-occupied)' }}>
                    {count} {vType ? `${vType} slots` : 'slots'}
                  </span>
                </div>
                {vType && pricing[vType] && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Estimated Charges:</span>
                    <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                      ₹{pricing[vType].first} (1st hr) + ₹{pricing[vType].add}/hr
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="mt-8 text-center">
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem', width: '100%' }} disabled={loading || vehicles.length === 0}>
              {loading ? 'Finding Best Slot...' : 'Find Best Slot & Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
