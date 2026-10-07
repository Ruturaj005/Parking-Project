import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, LayoutDashboard, Search, History } from 'lucide-react';

export default function MainLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">
          <Car /> SmartPark
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard" className={`flex items-center gap-2 ${isActive('/dashboard')}`}><LayoutDashboard size={18}/> Dashboard</Link>
          <Link to="/vehicles" className={`flex items-center gap-2 ${isActive('/vehicles')}`}><Car size={18}/> My Vehicles</Link>
          <Link to="/search" className={`flex items-center gap-2 ${isActive('/search')}`}><Search size={18}/> Find Parking</Link>
          <Link to="/bookings" className={`flex items-center gap-2 ${isActive('/bookings')}`}><History size={18}/> Bookings</Link>
          {user?.role === 'ADMIN' && <Link to="/admin/dashboard" style={{color: '#F59E0B'}}>Admin Panel</Link>}
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
