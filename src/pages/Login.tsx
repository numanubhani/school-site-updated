import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { UserRole } from '../types';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: UserRole) => {
    const demoEmail = `${role}@demo.edu`;
    loginDemo(role, demoEmail);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 flex-col">
      <div className="max-w-md w-full mb-8">
        <div className="flex flex-col items-center mb-10">
          <Logo size="lg" />
          <p className="text-gray-500 italic mt-4">Unlocking student potential, one byte at a time.</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <LogIn className="text-primary" /> Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="john@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-500 text-xs italic leading-relaxed">
                  {error.includes('operation-not-allowed') 
                    ? "Firebase Error: 'Email/Password' provider must be enabled in your Firebase Console (Authentication > Sign-in method)." 
                    : error}
                </p>
                {error.includes('operation-not-allowed') && (
                  <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-tight">
                    Use the Demo Accounts below to bypass this for now.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 italic">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Demo Accounts (Dummy Credentials)</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => fillDemo('principal')} className="px-3 py-2 bg-purple-50 text-primary text-[10px] font-black rounded-lg hover:bg-primary hover:text-white transition-all uppercase">Principal</button>
              <button type="button" onClick={() => fillDemo('teacher')} className="px-3 py-2 bg-purple-50 text-primary text-[10px] font-black rounded-lg hover:bg-primary hover:text-white transition-all uppercase">Teacher</button>
              <button type="button" onClick={() => fillDemo('student')} className="px-3 py-2 bg-purple-50 text-primary text-[10px] font-black rounded-lg hover:bg-primary hover:text-white transition-all uppercase">Student</button>
              <button type="button" onClick={() => fillDemo('parent')} className="px-3 py-2 bg-purple-50 text-primary text-[10px] font-black rounded-lg hover:bg-primary hover:text-white transition-all uppercase">Parent</button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>New Principal? <Link to="/register" className="text-primary font-bold hover:underline">Register your school</Link></p>
            <p className="mt-2 text-[10px] opacity-40 italic uppercase tracking-widest">Educational Intelligence Systems &bull; 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
