import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CarFront } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.data, res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>
            <CarFront color="var(--primary)" /> SmartPark
          </Link>
          <h2 className="mt-4">Create Account</h2>
        </div>
        
        {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" className="input" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Phone</label>
            <input type="tel" className="input" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Sign Up</button>
        </form>
        <p className="text-center text-muted mt-4">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
