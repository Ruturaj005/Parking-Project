import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ vehicleNumber: '', vehicleType: 'CAR', brand: '', model: '', color: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNumber) {
      return setError('Please enter a vehicle number.');
    }
    try {
      await api.post('/vehicles', formData);
      setShowModal(false);
      setFormData({ vehicleNumber: '', vehicleType: 'CAR', brand: '', model: '', color: '' });
      setError('');
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>My Vehicles</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {vehicles.map(v => (
          <div key={v._id} className="card flex justify-between items-start">
            <div>
              <h3>{v.vehicleNumber}</h3>
              <p className="text-muted mt-1">{v.brand} {v.model} ({v.color})</p>
              <span className="status-badge" style={{background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', marginTop: '0.5rem', display: 'inline-block'}}>
                {v.vehicleType}
              </span>
            </div>
            <button onClick={() => handleDelete(v._id)} style={{color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer'}}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-muted col-span-3">No vehicles found. Please add one.</p>}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="mb-4">Add New Vehicle</h3>
            {error && <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleAdd}>
              <div className="input-group" style={{ textAlign: 'center' }}>
                <label>Vehicle Number</label>
                <input type="text" className="input" style={{ textAlign: 'center' }} value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} placeholder="e.g. MH10AB1234"/>
              </div>
              <div className="input-group" style={{ textAlign: 'center' }}>
                <label>Vehicle Type</label>
                <select className="select" style={{ textAlign: 'center', textAlignLast: 'center' }} value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}>
                  <option value="CAR">Car</option>
                  <option value="BIKE">Bike</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">EV</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group" style={{ textAlign: 'center' }}>
                  <label>Brand</label>
                  <input type="text" className="input" style={{ textAlign: 'center' }} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div className="input-group" style={{ textAlign: 'center' }}>
                  <label>Model</label>
                  <input type="text" className="input" style={{ textAlign: 'center' }} value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
              </div>
              <div className="input-group" style={{ textAlign: 'center' }}>
                <label>Color</label>
                <input type="text" className="input" style={{ textAlign: 'center' }} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => {setShowModal(false); setError('');}}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
