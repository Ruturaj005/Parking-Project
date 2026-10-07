import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics')
      ]);
      setStats(sRes.data.data);
      setAnalytics(aRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  if (!stats || !analytics) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-muted">Total Revenue</p>
          <h3 className="text-2xl mt-2" style={{color: 'var(--primary)'}}>₹{stats.totalRevenue}</h3>
        </div>
        <div className="card text-center">
          <p className="text-muted">Occupancy Rate</p>
          <h3 className="text-2xl mt-2">{stats.occupancyPercentage}%</h3>
        </div>
        <div className="card text-center">
          <p className="text-muted">Today's Bookings</p>
          <h3 className="text-2xl mt-2">{stats.todaysBookings}</h3>
        </div>
        <div className="card text-center">
          <p className="text-muted">Total Users</p>
          <h3 className="text-2xl mt-2">{stats.totalUsers}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card">
          <h3 className="mb-4">Revenue (Last 7 Days)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={analytics.dailyRevenue}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--border)'}} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="mb-4">Vehicle Types Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={analytics.vehicleTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  {analytics.vehicleTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--border)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {analytics.vehicleTypes.map((v, i) => (
                <div key={v.name} className="flex items-center gap-2">
                  <div style={{width: 12, height: 12, borderRadius: '50%', background: COLORS[i % COLORS.length]}}></div>
                  <span className="text-sm">{v.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4">Slot Status Summary ({stats.totalSlots} Total)</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div><p className="text-muted">Available</p><h4 style={{color: 'var(--status-available)'}} className="text-xl mt-1">{stats.availableSlots}</h4></div>
          <div><p className="text-muted">Reserved</p><h4 style={{color: 'var(--status-reserved)'}} className="text-xl mt-1">{stats.reservedSlots}</h4></div>
          <div><p className="text-muted">Occupied</p><h4 style={{color: 'var(--status-occupied)'}} className="text-xl mt-1">{stats.occupiedSlots}</h4></div>
          <div><p className="text-muted">Maintenance</p><h4 style={{color: 'var(--status-maintenance)'}} className="text-xl mt-1">{stats.maintenanceSlots}</h4></div>
        </div>
      </div>
    </div>
  );
}
