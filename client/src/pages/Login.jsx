import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message;
      setError(message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>CareerOS</h1>
      <h2>Sign in</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} required />
        <label>Password</label>
        <input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} required />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
