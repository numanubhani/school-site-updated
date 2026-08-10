import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, School, User, Lock, Mail, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const Register: React.FC = () => {
  const [role, setRole] = useState<'principal' | 'parent'>('principal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setTokenAndFetchProfile } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = role === 'principal' ? 'http://localhost:8000/register/principal' : 'http://localhost:8000/register/parent';
      
      const payload = role === 'principal' ? {
        user: { email, display_name: name, password, role },
        school: { name: schoolName, address: schoolAddress, phone: schoolPhone }
      } : {
        user: { email, display_name: name, password, role }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }

      // Automatically login after registration
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginRes = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        await setTokenAndFetchProfile(loginData.access_token);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full my-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">EduXcel</h1>
          <p className="text-gray-500 italic">Create your administrative or parent account.</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserPlus className="text-primary" /> Start Your Journey
          </h2>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('principal')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'principal' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
            >
              School Principal
            </button>
            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'parent' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
            >
              Parent
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {role === 'principal' && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">School Details</p>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                  <div className="relative mb-4">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="St. Mary's Academy"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                    />
                  </div>
                  
                  <label className="block text-sm font-semibold text-gray-700 mb-1">School Address</label>
                  <div className="relative mb-4">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="123 Education Blvd"
                      value={schoolAddress}
                      onChange={(e) => setSchoolAddress(e.target.value)}
                    />
                  </div>

                  <label className="block text-sm font-semibold text-gray-700 mb-1">School Phone</label>
                  <div className="relative mb-4">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="+1 (555) 123-4567"
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 mt-4 border-t border-gray-100">
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Account Details</p>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="admin@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm italic">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Creating Account...' : (
                <>
                  <ShieldCheck className="size-5" />
                  Confirm Registration
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
