import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { db, auth } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { LogOut, Star, BookOpen, User, Trophy, PlayCircle, Clock, Users, ArrowRight } from 'lucide-react';
import { Assignment, StudentProgress } from '../../types';
import Logo from '../../components/Logo';

const StudentDashboard: React.FC = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'learning' | 'progress'>('learning');
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!profile?.uid) return;
      setLoading(true);
      try {
        // Find classes where this student is enrolled
        // For simplicity, let's assume classes are subcollections under schools
        // We need the schoolId from the student's profile
        if (profile.schoolId) {
          const classesQuery = query(collection(db, 'schools', profile.schoolId, 'classes'));
          const classesSnap = await getDocs(classesQuery);
          const studentClasses = classesSnap.docs.filter(d => d.data().studentIds?.includes(profile.uid));
          const classIds = studentClasses.map(d => d.id);
          
          if (classIds.length > 0) {
            const assignmentsQuery = query(collection(db, 'assignments'), where('classId', 'in', classIds));
            const assignmentsSnap = await getDocs(assignmentsQuery);
            setAssignments(assignmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Assignment));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [profile]);

  const handleLogout = () => logout();

  if (loading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Waking up curriculum groups...</div>;

  return (
    <div className="min-h-screen bg-surface pb-12">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-border px-8 h-[72px] flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <div className="hidden md:flex gap-4">
            <button 
              onClick={() => setActiveTab('learning')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'learning' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              LEARN
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'progress' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              ANALYTICS
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
             <Star className="text-secondary fill-secondary" size={16} />
             <span className="font-black text-primary text-[10px] uppercase tracking-widest">Mastery Level 4</span>
          </div>
          <div className="role-badge bg-secondary">Explorer</div>
          <div className="flex items-center gap-3 border-l pl-6 border-border">
             <div className="size-9 bg-surface rounded-xl flex items-center justify-center text-primary font-bold border border-border">
               {profile?.displayName?.[0]}
             </div>
             <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2">
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        <header className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Explorer Hub</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Personalized learning path for {profile?.displayName}</p>
        </header>

        <section className="bento-grid pb-20">
           {/* Achievement Card */}
           <div className="card col-span-2 row-span-1 flex items-center gap-8 bg-gradient-to-br from-white to-secondary/5 border-secondary/20">
              <div className="size-24 bg-accent/20 rounded-[30px] flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                <Trophy size={48} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Accomplishments</p>
                <h4 className="text-4xl font-black text-gray-900 tracking-tighter italic">12 Gold Stars</h4>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Ready to claim
                </div>
              </div>
           </div>

           {/* Assignments Overview */}
           <div className="card col-span-2 row-span-2 shadow-2xl">
              <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-black">Active Curriculum Tasks</span>
                <span className="text-primary text-[10px] font-black cursor-pointer hover:underline uppercase tracking-widest">View History</span>
              </div>
              <div className="space-y-4">
                {assignments.map(asgn => (
                  <div key={asgn.id} className="flex items-center gap-5 p-6 bg-surface rounded-[30px] hover:translate-x-2 border-2 border-transparent hover:border-primary/20 hover:bg-white transition-all cursor-pointer group">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-lg text-gray-900 group-hover:text-primary transition-colors leading-tight">{asgn.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Due: {asgn.dueDate}</p>
                    </div>
                    <div className="size-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                   <div className="py-20 text-center space-y-4">
                      <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto"><PlayCircle size={32} /></div>
                      <p className="text-xs text-gray-300 italic font-bold uppercase tracking-widest">Zero tasks remaining. You're up to date!</p>
                   </div>
                )}
              </div>
           </div>

           <div className="card col-span-1 row-span-1 bg-primary text-white border-none shadow-xl shadow-primary/20">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] block mb-4">Focus Record</span>
              <div className="text-5xl font-black italic tracking-tighter flex items-baseline gap-1">
                45 <span className="text-[12px] uppercase opacity-60 not-italic">mins</span>
              </div>
              <div className="mt-8 flex items-center gap-1.5 px-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 3 ? 'bg-white' : 'bg-white/20'}`}></div>
                ))}
              </div>
           </div>

           <div className="card col-span-1 row-span-1 flex flex-col justify-center items-center text-center bg-accent text-accent-foreground border-none">
              <div className="size-16 bg-white/20 rounded-[20px] flex items-center justify-center mb-4">
                 <Users size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Collaboration</p>
              <p className="text-2xl font-black italic">Active Study</p>
           </div>
        </section>

        {/* Campaign Banner */}
        <div className="card bg-gray-900 text-white p-12 rounded-[50px] relative overflow-hidden group border-none shadow-2xl">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -mr-40 -mt-40 blur-[100px] transition-transform group-hover:scale-120"></div>
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  Limited Time Event
                </div>
                <h3 className="text-5xl font-black italic tracking-tighter leading-none">SUMMER EXPLORER SPRINT</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Solve 500 tasks this season &bull; Unlock the Diamond Badge</p>
             </div>
             <div className="text-center md:text-right">
                <div className="text-6xl font-black tracking-tighter text-secondary italic">234<span className="text-2xl text-white/30 not-italic ml-2">/ 500</span></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mt-4">Curriculum Progress</p>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
