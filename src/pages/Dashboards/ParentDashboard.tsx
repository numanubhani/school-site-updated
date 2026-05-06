import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { db, auth } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { LogOut, Heart, Activity, Calendar, Award, ExternalLink, ShieldCheck, X, PlusCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const ParentDashboard: React.FC = () => {
  const { profile, logout } = useAuth();
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [error, setError] = useState('');

  const fetchChildren = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('parentId', '==', profile.uid), where('role', '==', 'student'));
      const snap = await getDocs(q);
      setChildren(snap.docs.map(d => d.data() as UserProfile));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [profile]);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const q = query(collection(db, 'users'), where('email', '==', childEmail), where('role', '==', 'student'));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setError('No student found with this email.');
        return;
      }

      const childDoc = snap.docs[0];
      await updateDoc(doc(db, 'users', childDoc.id), {
        parentId: profile?.uid
      });
      
      setIsLinkModalOpen(false);
      setChildEmail('');
      fetchChildren();
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
    }
  };

  const handleLogout = () => logout();

  if (loading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Synchronizing Family Plan...</div>;

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="bg-white border-b border-border px-8 h-[72px] flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <h1 className="text-2xl font-black text-gray-800 tracking-tight ml-2">Guardian</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="role-badge bg-primary">Account Manager</div>
          <div className="flex items-center gap-3 border-l pl-6 border-border">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-black text-gray-900 leading-tight">{profile?.displayName}</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Parent Access</p>
             </div>
             <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors ml-2 p-2">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Guardian Command Center</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-3 underline decoration-secondary decoration-2 underline-offset-4">Academic growth & Engagement hub</p>
        </div>

        <div className="bento-grid pb-24">
          {/* Main Children List */}
          <div className="col-span-3 space-y-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2 border-l-4 border-secondary ml-1">Verified Explorers</h3>

            {children.map(child => (
              <div key={child.uid} className="card group hover:shadow-2xl hover:translate-y-[-2px] transition-all bg-white p-10 rounded-[40px] border-none shadow-md">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                   <div className="size-20 rounded-[30px] bg-primary/5 flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/10">
                      {child.displayName[0]}
                   </div>
                   
                   <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{child.displayName}</h4>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Status: Active Researcher</p>
                        </div>
                        <span className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-4 py-1.5 rounded-full">Explorer Path</span>
                      </div>
                      
                      <div className="flex gap-3">
                         {['Diagnostic Ready', 'High Engagement', 'Verified'].map(s => (
                           <div key={s} className="bg-gray-50 px-4 py-1.5 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">
                              {s}
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="text-center md:text-right space-y-1">
                      <p className="text-5xl font-black text-primary italic leading-none">85%</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">Avg. Mastery</p>
                   </div>
                </div>
              </div>
            ))}

            {children.length === 0 && (
               <div className="py-20 text-center border-4 border-dashed border-gray-100 rounded-[50px] bg-white/50 space-y-4">
                  <p className="text-gray-300 font-black uppercase text-xs tracking-[0.3em]">No explorers linked to your account</p>
                  <button onClick={() => setIsLinkModalOpen(true)} className="btn-primary text-sm">Initialize Link</button>
               </div>
            )}

            <button onClick={() => setIsLinkModalOpen(true)} className="w-full py-12 border-4 border-dashed border-gray-100 rounded-[50px] text-gray-300 font-black hover:border-primary/30 hover:text-primary hover:bg-white transition-all flex flex-col items-center gap-3 group shadow-inner">
               <div className="size-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white transition-all">
                  <PlusCircle size={32} />
               </div>
               <span className="text-[12px] uppercase tracking-[0.3em] font-black">Link Student Explorer</span>
               <p className="text-[10px] font-bold text-gray-400 lowercase tracking-normal bg-gray-50 px-3 py-1 rounded-lg">Enter child's school email address</p>
            </button>
          </div>

          {/* Side Info */}
          <div className="col-span-1 space-y-8">
            <div className="card bg-gray-900 text-white border-none shadow-2xl rounded-[50px] p-10 relative overflow-hidden group">
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full -ml-16 -mb-16 blur-3xl transition-transform group-hover:scale-150"></div>
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <Heart size={20} className="text-secondary fill-secondary" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Family Engagement</h4>
               </div>
               <p className="text-4xl font-black italic italic tracking-tighter relative z-10">5 Day Streak!</p>
               <p className="text-xs text-gray-400 mt-4 leading-relaxed font-bold relative z-10 uppercase tracking-widest">Consistency is key to mastery. Keep the momentum going!</p>
               <button className="w-full mt-10 py-4 bg-secondary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-secondary/30 hover:translate-y-[-2px] transition-all relative z-10 active:scale-95">
                  Send Inspiration
               </button>
            </div>

            <div className="card space-y-8 p-10 rounded-[50px] bg-white border-none shadow-md">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-50 pb-6">Academic Calendar</h4>
               <div className="space-y-6">
                 <div className="flex gap-4 items-center">
                    <div className="size-14 rounded-2xl bg-surface border-2 border-gray-50 flex flex-col items-center justify-center shadow-sm">
                       <span className="text-[8px] font-black uppercase text-gray-400">Apr</span>
                       <span className="text-xl font-black text-primary tracking-tighter leading-none">22</span>
                    </div>
                    <div>
                       <p className="text-sm font-black text-gray-900 leading-tight">National Math Contest</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">9:00 AM &bull; Live Event</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-center">
                    <div className="size-14 rounded-2xl bg-surface border-2 border-gray-50 flex flex-col items-center justify-center shadow-sm">
                       <span className="text-[8px] font-black uppercase text-gray-400">May</span>
                       <span className="text-xl font-black text-primary tracking-tighter leading-none">05</span>
                    </div>
                    <div>
                       <p className="text-sm font-black text-gray-900 leading-tight">Parent-Admin Virtual</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">6:00 PM &bull; Progress Hub</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="card bg-secondary text-white flex flex-col items-center text-center p-12 rounded-[50px] border-none shadow-xl shadow-secondary/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
               <Award className="size-16 mb-6 drop-shadow-lg" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Milestone Reached</h4>
               <p className="text-lg font-black italic italic leading-tight italic px-2">
                 Leo mastered "Complex Logic" 2 hours ago!
               </p>
            </div>
          </div>
        </div>

        {/* Link Modal */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-left">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[50px] p-12 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsLinkModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Link Explorer</h3>
              <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mb-10">Connect child's academic profile</p>
              
              <form onSubmit={handleLinkChild} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] ml-2">Explorer's Registered Email</label>
                  <input required type="email" value={childEmail} onChange={e => setChildEmail(e.target.value)} className="w-full bg-surface border-2 border-gray-50 p-5 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-black text-gray-800 placeholder:text-gray-300" placeholder="student@edu-xcel.com" />
                </div>
                {error && <p className="text-xs text-red-500 font-black uppercase tracking-widest ml-2">{error}</p>}
                <button type="submit" className="btn-primary w-full py-6 text-lg shadow-2xl shadow-primary/20 mt-4 font-black italic">Initialize Connection</button>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;
