import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { LogOut, Star, BookOpen, Trophy, PlayCircle, Users, ArrowRight, Video, FileText } from 'lucide-react';
import Logo from '../../components/Logo';

const StudentDashboard: React.FC = () => {
  const { profile, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'learning' | 'videos' | 'progress'>('learning');
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([
    { id: 1, title: 'Introduction to Physics', duration: '12:45', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Algebra Foundations', duration: '45:00', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
  ]);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  useEffect(() => {
    // In a full implementation, fetch assignments and videos from backend
    // fetch('http://localhost:8000/students/my/assignments', { headers: { Authorization: `Bearer ${token}` } })
    //   .then(res => res.json())
    //   .then(data => setAssignments(data));
    setAssignments([
      { id: 1, title: 'Read Chapter 4: Thermodynamics', dueDate: 'Tomorrow' },
      { id: 2, title: 'Complete Algebra Worksheet 2', dueDate: 'Friday' }
    ]);
  }, [token]);

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
              ASSIGNMENTS
            </button>
            <button 
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'videos' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              VIDEO LESSONS
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
          <div className="role-badge bg-secondary">Student</div>
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
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Student Portal</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Personalized learning path for {profile?.displayName}</p>
        </header>

        {activeTab === 'videos' && (
          <section className="bento-grid pb-20">
            <div className="card col-span-3 row-span-2 shadow-2xl p-0 overflow-hidden bg-black flex flex-col">
              {activeVideo ? (
                <div className="relative w-full pb-[56.25%] flex-1">
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={activeVideo.url} 
                    title="Video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/50 p-20">
                  <Video size={64} className="mb-4 opacity-50" />
                  <p className="font-bold uppercase tracking-widest text-sm">Select a video lesson to start learning</p>
                </div>
              )}
            </div>

            <div className="card col-span-1 row-span-2 shadow-xl bg-white flex flex-col">
              <h3 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs border-b border-gray-100 pb-4">Up Next</h3>
              <div className="space-y-4 overflow-y-auto flex-1">
                {videos.map(v => (
                  <div key={v.id} onClick={() => setActiveVideo(v)} className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${activeVideo?.id === v.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-surface'}`}>
                    <div className="w-24 h-16 bg-gray-200 rounded-xl relative flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                      <PlayCircle size={24} className="relative z-10" />
                      <div className="absolute inset-0 bg-black/5"></div>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800 leading-tight">{v.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{v.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'learning' && (
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
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-black">Active Tasks</span>
                  <span className="text-primary text-[10px] font-black cursor-pointer hover:underline uppercase tracking-widest">View History</span>
                </div>
                <div className="space-y-4">
                  {assignments.map(asgn => (
                    <div key={asgn.id} className="flex items-center gap-5 p-6 bg-surface rounded-[30px] hover:translate-x-2 border-2 border-transparent hover:border-primary/20 hover:bg-white transition-all cursor-pointer group">
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <FileText size={24} />
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
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
