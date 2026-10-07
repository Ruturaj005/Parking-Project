import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, MapPin, ClipboardList } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      <nav className="navbar" style={{ borderBottom: '2px solid var(--primary)'}}>
        <Link to="/admin/dashboard" className="navbar-brand">
          <ShieldCheck /> SmartPark Admin
        </Link>
        <div className="navbar-links">
          <Link to="/admin/dashboard" className={`flex items-center gap-2 ${isActive('/admin/dashboard')}`}><LayoutDashboard size={18}/> Dashboard</Link>
          <Link to="/admin/parking" className={`flex items-center gap-2 ${isActive('/admin/parking')}`}><MapPin size={18}/> Parking Management</Link>
          <Link to="/admin/bookings" className={`flex items-center gap-2 ${isActive('/admin/bookings')}`}><ClipboardList size={18}/> Bookings</Link>
          <Link to="/dashboard">User App</Link>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
