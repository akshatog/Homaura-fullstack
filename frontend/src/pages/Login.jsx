import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import { login } from '../utils/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('🔐 Login attempt started');
    console.log('📧 Email:', formData.email);

    try {
      console.log('📡 Calling login API...');
      const res = await login(formData);
      console.log('✅ Login response received:', res.data);

      console.log('💾 Storing token in localStorage...');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      console.log('✅ Token stored:', res.data.token.substring(0, 20) + '...');

      const ADMIN_EMAIL = 'admin@gmail.com';
      const ADMIN_PASSWORD = 'admin123';
      const isAdmin = formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD;

      console.log('👤 Admin check:', {
        email: formData.email,
        expectedEmail: ADMIN_EMAIL,
        emailMatch: formData.email === ADMIN_EMAIL,
        passwordMatch: formData.password === ADMIN_PASSWORD,
        isAdmin: isAdmin
      });

      localStorage.setItem('isAdmin', isAdmin);
      console.log('💾 isAdmin flag stored:', isAdmin);

      if (isAdmin) {
        console.log('🎯 Navigating to admin dashboard...');
        navigate('/admin/products');
        console.log('✅ Navigation to /admin/products triggered');
      } else {
        console.log('🏠 Navigating to home page...');
        navigate('/');
        console.log('✅ Navigation to / triggered');
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error message:', err.message);
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand logo */}
        <div className="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" fill="none">
            <path d="M20 4C20 4 8 14 8 26C8 33.7 13.3 40 20 42C26.7 40 32 33.7 32 26C32 14 20 4 20 4Z" fill="#5C6B47" opacity="0.85"/>
            <path d="M20 18C20 18 24 24 22 32" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          </svg>
          <span className="auth-logo-name">HomAura</span>
        </div>
        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="switch-text">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
