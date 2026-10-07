import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings } from 'lucide-react';
import io from 'socket.io-client';

export default function AdminParking() {
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [floors, setFloors] = useState([]);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetchParkings();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('parkingSlotUpdated', (data) => {
      setSlots(prev => prev.map(s => s._id === data.slotId ? { ...s, status: data.status } : s));
    });
    return () => socket.disconnect();
  }, []);

  const fetchParkings = async () => {
    try {
      const res = await api.get('/parking');
      setParkings(res.data.data);
      if (res.data.data.length > 0) {
        handleSelectParking(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectParking = async (id) => {
    try {
      const res = await api.get(`/parking/${id}`);
      setSelectedParking(res.data.data.parking);
      setFloors(res.data.data.floors);
      
      // Sort slots by distance/number
      const sortedSlots = res.data.data.slots.sort((a,b) => {
         if (a.distanceFromEntrance !== b.distanceFromEntrance) return a.distanceFromEntrance - b.distanceFromEntrance;
         return a.slotNumber.localeCompare(b.slotNumber);
      });
      setSlots(sortedSlots);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMaintenance = async (slotId, currentStatus) => {
    if (currentStatus === 'OCCUPIED' || currentStatus === 'RESERVED') {
       alert("Cannot put occupied/reserved slot into maintenance.");
       return;
    }
    
    if(!window.confirm(`Change status to ${currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE'}?`)) return;
    
    try {
      const newStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
      await api.patch(`/admin/slots/${slotId}/status`, { status: newStatus });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6">Parking Location Management</h2>
      
      <div className="flex gap-4 mb-6">
        {parkings.map(p => (
          <button 
            key={p._id} 
            className={`btn ${selectedParking?._id === p._id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSelectParking(p._id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {selectedParking && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3>{selectedParking.name}</h3>
              <p className="text-muted">{selectedParking.location} • {selectedParking.totalSlots} Slots</p>
            </div>
          </div>

          <div className="text-center mb-4 p-2" style={{background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem'}}>
            <p className="text-muted">ENTRANCE ↓</p>
          </div>

          {floors.map(floor => (
            <div key={floor._id} className="mb-8 p-4" style={{background: 'var(--surface-light)', borderRadius: '1rem'}}>
              <h4 className="mb-4">{floor.name}</h4>
              <div className="grid grid-cols-4 gap-4">
                {slots.filter(s => s.floorId === floor._id).map(slot => (
                  <div key={slot._id} className="card p-3 flex flex-col items-center justify-center text-center" style={{padding: '1rem', position: 'relative', border: slot.status === 'MAINTENANCE' ? '1px dashed var(--text-muted)' : '1px solid var(--border)'}}>
                    <div style={{position: 'absolute', top: 5, right: 5}}>
                       <button onClick={() => toggleMaintenance(slot._id, slot.status)} title="Toggle Maintenance" style={{background:'none', border:'none', color: 'var(--text-muted)', cursor: 'pointer'}}>
                         <Settings size={14} />
                       </button>
                    </div>
                    <span style={{fontSize: '1.25rem', fontWeight: 600}}>{slot.slotNumber}</span>
                    <span className="text-muted text-sm mt-1">{slot.slotType} (d:{slot.distanceFromEntrance})</span>
                    <div className={`mt-2 status-badge badge-${slot.status}`} style={{fontSize: '0.65rem'}}>
                      {slot.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
