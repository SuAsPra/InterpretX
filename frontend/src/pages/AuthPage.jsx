import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && form.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Enter a valid email');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach backend API. Start backend server and check VITE_API_URL.');
      } else {
        setError(err.response?.data?.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="panel w-full max-w-md rounded-3xl p-8">
        <h1 className="text-main text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="text-muted mt-1 text-sm">Build your connected achievements dashboard.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {!isLogin && (
            <input
              className="input-theme w-full rounded-xl px-3 py-2"
              placeholder="Name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          )}
          <input
            className="input-theme w-full rounded-xl px-3 py-2"
            placeholder="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            className="input-theme w-full rounded-xl px-3 py-2"
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            disabled={loading}
            className="btn-primary w-full px-4 py-2"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button
          type="button"
          className="text-accent mt-4 text-sm font-medium"
          onClick={() => setIsLogin((v) => !v)}
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>

        <div className="text-muted mt-4 text-sm">
          <Link to="/" className="underline">
            Back to landing page
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
