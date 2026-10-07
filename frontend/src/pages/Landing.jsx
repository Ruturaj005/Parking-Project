import { Link, Navigate } from 'react-router-dom';
import { CarFront, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar" style={{ position: 'static' }}>
        <div className="navbar-brand">
          <CarFront /> SmartPark
        </div>
        <div className="navbar-links">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 5%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
          Find. Park. Pay. <span style={{ color: 'var(--primary)' }}>Done.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem' }}>
          Experience the future of parking. Automated slot allocation, real-time availability, and seamless payments all in one smart system.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
          Book Your Space Now
        </Link>

        <div className="grid grid-cols-3 gap-4" style={{ marginTop: '5rem', maxWidth: '1000px', width: '100%' }}>
          <div className="card text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
              <Clock size={32} color="var(--primary)" />
            </div>
            <h3>Save Time</h3>
            <p className="text-muted mt-2">No more circling for slots. We automatically assign the best spot for your vehicle.</p>
          </div>
          <div className="card text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
              <ShieldCheck size={32} color="var(--secondary)" />
            </div>
            <h3>Guaranteed Space</h3>
            <p className="text-muted mt-2">Your reserved slot is locked for you. Zero double booking guarantee.</p>
          </div>
          <div className="card text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
              <CreditCard size={32} color="#F59E0B" />
            </div>
            <h3>Easy Payments</h3>
            <p className="text-muted mt-2">Pay digitally with ease based on your actual entry and exit times.</p>
          </div>
        </div>
      </main>
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        &copy; {new Date().getFullYear()} SmartPark Automated Parking Management System.
      </footer>
    </div>
  );
}
