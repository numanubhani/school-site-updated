import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, School, User, Lock, Mail, ShieldCheck, MapPin, Phone, KeyRound } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import Logo from '../components/Logo';

type Role = 'principal' | 'teacher' | 'student' | 'parent';

const ROLES: { value: Role; label: string }[] = [
  { value: 'principal', label: 'Principal' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
];

const Register: React.FC = () => {
  const [role, setRole] = useState<Role>('principal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
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
      let endpoint = '';
      let payload: any = {};

      if (role === 'principal') {
        endpoint = '/api/register/principal';
        payload = {
          user: { email, display_name: name, password, role },
          school: { name: schoolName, address: schoolAddress, phone: schoolPhone },
        };
      } else if (role === 'parent') {
        endpoint = '/api/register/parent';
        payload = { email, display_name: name, password, role };
      } else {
        // teacher or student â€” requires invite code
        endpoint = `/api/register/${role}`;
        payload = { email, display_name: name, password, invite_code: inviteCode };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }

      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
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

  const needsInviteCode = role === 'teacher' || role === 'student';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full my-8">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-500 italic mt-3 text-sm">Create your account to get started.</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserPlus className="text-primary" /> Create Account
          </h2>

          {/* Role selector */}
          <div className="grid grid-cols-4 bg-gray-100 p-1 rounded-xl mb-6 gap-1">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${role === r.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="text" required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Jane Doe"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            {/* School invite code for teacher / student */}
            {needsInviteCode && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  School Invite Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                  <input
                    type="text" required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase tracking-widest font-mono"
                    placeholder="ABC123"
                    maxLength={6}
                    value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Ask your school principal for the 6-character invite code.</p>
              </div>
            )}

            {/* School details for principal */}
            {role === 'principal' && (
              <div className="pt-4 mt-2 border-t border-gray-100 space-y-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">School Details</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                    <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="St. Mary's Academy" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">School Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                    <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="123 Education Blvd" value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">School Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                    <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="+1 (555) 123-4567" value={schoolPhone} onChange={e => setSchoolPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Email & password */}
            <div className="pt-4 mt-2 border-t border-gray-100 space-y-4">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Account Details</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                  <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                  <input type="password" required minLength={6} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-500 text-xs italic">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4">
              {loading ? 'Creating Account...' : <><ShieldCheck className="size-5" /> Create Account</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

