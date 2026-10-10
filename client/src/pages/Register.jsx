import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message;
      setError(message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>CareerOS</h1>
      <h2>Create account</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input type="text" value={name} onChange={function (e) { setName(e.target.value); }} required />
        <label>Email</label>
        <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} required />
        <label>Password</label>
        <input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} required />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Register'}</button>
      </form>
      <p>Already registered? <Link to="/login">Sign in</Link></p>
    </div>
  );
}
