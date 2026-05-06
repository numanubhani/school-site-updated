import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { UserPlus, School, User, Lock, Mail, ShieldCheck } from 'lucide-react';

const Register: React.FC = () => {
  const [role, setRole] = useState<'principal' | 'parent'>('principal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let schoolId = '';
      if (role === 'principal') {
        const schoolRef = await addDoc(collection(db, 'schools'), {
          name: schoolName,
          principalId: user.uid,
          createdAt: new Date().toISOString(),
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        });
        schoolId = schoolRef.id;
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName: name,
        role,
        schoolId: schoolId || null,
        createdAt: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
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
              onClick={() => setRole('principal')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'principal' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
            >
              School Principal
            </button>
            <button
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                <div className="relative">
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
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
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
            </div>

            <div>
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
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
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
