import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Users, BookOpen, LogOut, Settings, X, Plus } from 'lucide-react';
import { School, UserProfile, Class } from '../../types';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const PrincipalDashboard: React.FC = () => {
  const { profile, token, logout } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'classes'>('overview');

  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Form states
  const [newEntity, setNewEntity] = useState({ name: '', email: '', className: '', teacherId: '' });

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const schoolRes = await fetch('http://localhost:8000/schools/my', { headers });
      if (schoolRes.ok) setSchool(await schoolRes.json());

      const teachersRes = await fetch('http://localhost:8000/schools/my/teachers', { headers });
      if (teachersRes.ok) setTeachers(await teachersRes.json());

      const classesRes = await fetch('http://localhost:8000/schools/my/classes', { headers });
      if (classesRes.ok) setClasses(await classesRes.json());

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleLogout = () => logout();

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/schools/my/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEntity.email, display_name: newEntity.name, role: 'teacher' })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedPassword(data.generated_password);
        setIsAddTeacherOpen(false);
        setNewEntity({ name: '', email: '', className: '', teacherId: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to create teacher');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/schools/my/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEntity.email, display_name: newEntity.name, role: 'student' })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedPassword(data.generated_password);
        setIsAddStudentOpen(false);
        setNewEntity({ name: '', email: '', className: '', teacherId: '' });
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to create student');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/schools/my/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newEntity.className, teacher_id: newEntity.teacherId ? parseInt(newEntity.teacherId) : null })
      });
      if (res.ok) {
        setIsAddClassOpen(false);
        setNewEntity({ name: '', email: '', className: '', teacherId: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Loading Administration Panel...</div>;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-primary text-white flex flex-col p-6 h-full">
        <div className="mb-12">
          <Logo size="sm" className="brightness-200 contrast-200" />
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1 ml-11">Admin Control</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full sidebar-item ${activeTab === 'overview' ? 'sidebar-item-active' : ''}`}
          >
            <Settings className="size-5" /> Dashboard
          </button>
          <button 
             onClick={() => setActiveTab('teachers')}
            className={`w-full sidebar-item ${activeTab === 'teachers' ? 'sidebar-item-active' : ''}`}
          >
            <Users className="size-5" /> Faculty
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`w-full sidebar-item ${activeTab === 'classes' ? 'sidebar-item-active' : ''}`}
          >
            <BookOpen className="size-5" /> Academic
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="mb-4 text-xs font-bold text-white/40 uppercase tracking-widest">School ID: {school?.inviteCode}</div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-all font-medium">
            <LogOut className="size-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-surface flex flex-col relative">
        {generatedPassword && (
          <div className="absolute top-4 right-4 z-50 bg-green-500 text-white p-6 rounded-2xl shadow-2xl animate-bounce">
             <div className="flex justify-between items-center mb-2">
                <p className="font-bold">Account Created!</p>
                <button onClick={() => setGeneratedPassword('')}><X size={16}/></button>
             </div>
             <p className="text-sm">Please share this temporary password with the user:</p>
             <p className="text-xl font-mono mt-2 bg-black/20 p-2 rounded tracking-widest text-center">{generatedPassword}</p>
          </div>
        )}

        <header className="h-[72px] bg-white border-b border-border flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Principal Command Center</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{school?.name}</p>
          </div>
          <div className="role-badge">School Principal</div>
        </header>

        <div className="p-8 bento-grid pb-24">
          {activeTab === 'overview' && (
            <>
              {/* Stats Row */}
              <div className="card col-span-1">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Total Students</span>
                <div className="text-3xl font-black text-primary">1,248</div>
                <div className="text-[10px] text-green-500 mt-1 font-black uppercase tracking-tighter">↑ 12% growth</div>
              </div>

              <div className="card col-span-1">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Active Teachers</span>
                <div className="text-3xl font-black text-primary">{teachers.length}</div>
                <div className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-tighter italic">Full coverage</div>
              </div>

              <div className="card col-span-2 flex items-center gap-6">
                 <div className="flex-1">
                    <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Academic Index</span>
                    <div className="flex items-baseline gap-2">
                       <div className="text-3xl font-black text-primary">84.2%</div>
                       <div className="text-primary font-black uppercase text-[10px] tracking-widest tracking-widest bg-primary/10 px-2 py-0.5 rounded">Grade A-</div>
                    </div>
                 </div>
                 <div className="size-16 relative flex items-center justify-center">
                    <svg className="size-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="176" strokeDashoffset={176 * (1 - 0.84)} className="text-primary" />
                    </svg>
                    <span className="absolute text-[10px] font-black">84%</span>
                 </div>
              </div>

              {/* Main Content Area */}
              <div className="card col-span-3 row-span-3">
                <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em]">Academic Groups</span>
                  <button onClick={() => setIsAddClassOpen(true)} className="bg-primary/5 text-primary p-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                    <Plus size={20} />
                  </button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Class Name</th>
                      <th className="pb-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Teacher</th>
                      <th className="pb-4 text-[10px] font-black text-gray-300 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(cls => (
                      <tr key={cls.id} className="border-b border-gray-50 last:border-0 hover:bg-surface transition-colors cursor-pointer group">
                        <td className="py-5 text-[14px] font-black text-gray-800 group-hover:text-primary transition-colors">{cls.name}</td>
                        <td className="py-5 text-[13px] text-gray-500 font-bold uppercase tracking-tight">
                          {teachers.find((t: any) => t.id === cls.teacherId)?.displayName || 'Unassigned'}
                        </td>
                        <td className="py-5 text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <span className="size-1.5 rounded-full bg-green-600"></span> Live
                          </span>
                        </td>
                      </tr>
                    ))}
                    {classes.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-300 italic uppercase text-[10px] font-black tracking-widest">No classes recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card col-span-1 row-span-3 flex flex-col h-full bg-surface border-none shadow-none">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Operations</span>
                <div className="space-y-3 flex-1">
                  <button onClick={() => setIsAddStudentOpen(true)} className="w-full p-5 bg-white border border-border rounded-3xl text-[14px] text-gray-800 font-black hover:border-primary hover:text-primary hover:shadow-xl transition-all flex items-center gap-4 group">
                    <div className="size-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><Plus size={20} /></div>
                    Add Student
                  </button>
                  <button onClick={() => setIsAddTeacherOpen(true)} className="w-full p-5 bg-white border border-border rounded-3xl text-[14px] text-gray-800 font-black hover:border-primary hover:text-primary hover:shadow-xl transition-all flex items-center gap-4 group">
                    <div className="size-10 rounded-xl bg-secondary/5 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all"><Plus size={20} /></div>
                    Add Faculty
                  </button>
                </div>
                <div className="mt-8 p-6 bg-primary rounded-3xl text-white space-y-2">
                   <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">School System Status</p>
                   <p className="text-2xl font-black italic tracking-tight">Operational</p>
                   <div className="flex gap-1 pt-2">
                      {[...Array(5)].map((_, i) => <div key={i} className="h-1 flex-1 bg-white/20 rounded-full"></div>)}
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'teachers' && (
            <div className="col-span-4 card min-h-[400px]">
               <div className="flex justify-between items-center mb-12">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Faculty Roster</h3>
                 <button onClick={() => setIsAddTeacherOpen(true)} className="btn-primary flex items-center gap-2">
                   <Plus size={18} /> Onboard Teacher
                 </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {teachers.map(teacher => (
                   <div key={teacher.uid} className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center">
                      <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary font-black text-3xl mb-6 group-hover:bg-primary group-hover:text-white transition-all">{teacher.displayName[0]}</div>
                      <p className="font-black text-xl text-gray-900 mb-1">{teacher.displayName}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{teacher.email}</p>
                      <div className="w-full pt-6 border-t border-gray-50 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                         <span>3 Classes</span>
                         <span className="text-primary cursor-pointer hover:underline">Profile &rarr;</span>
                      </div>
                   </div>
                 ))}
                 {teachers.length === 0 && (
                   <div className="col-span-4 py-20 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest">No faculty members found.</div>
                 )}
               </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="col-span-4 card min-h-[400px]">
               <div className="flex justify-between items-center mb-12">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Academic Planning</h3>
                 <button onClick={() => setIsAddClassOpen(true)} className="btn-primary flex items-center gap-2">
                   <Plus size={18} /> New Curriculum Group
                 </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {classes.map(cls => (
                   <div key={cls.id} className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-md hover:shadow-2xl transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-10">
                         <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                           <BookOpen size={24} />
                         </div>
                         <div className="role-badge bg-gray-100 text-gray-500">Live</div>
                      </div>
                      <p className="text-2xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">{cls.name}</p>
                      <p className="text-sm font-bold text-gray-400 mb-8">Teacher: {teachers.find((t: any) => t.id === cls.teacherId)?.displayName || 'Not assigned'}</p>
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-t border-gray-50 pt-6">
                         <span>Manage Group</span>
                         <span className="text-primary hover:underline">Edit</span>
                      </div>
                   </div>
                 ))}
                 {classes.length === 0 && (
                   <div className="col-span-3 py-20 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest">No academic groups planned.</div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {isAddTeacherOpen && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsAddTeacherOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Add New Faculty</h3>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Join the EduXcel team</p>
              
              <form onSubmit={handleCreateTeacher} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name</label>
                  <input required value={newEntity.name} onChange={e => setNewEntity({...newEntity, name: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800" placeholder="e.g. Professor X" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email Address</label>
                  <input required type="email" value={newEntity.email} onChange={e => setNewEntity({...newEntity, email: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800" placeholder="teacher@school.edu" />
                </div>
                <button type="submit" className="btn-primary w-full py-5 text-lg shadow-xl shadow-primary/20 mt-4">Complete Onboarding</button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddStudentOpen && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsAddStudentOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Register Explorer</h3>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">New student registration</p>
              
              <form onSubmit={handleCreateStudent} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Student Name</label>
                  <input required value={newEntity.name} onChange={e => setNewEntity({...newEntity, name: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800" placeholder="e.g. Peter Parker" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Parent Email (for login)</label>
                  <input required type="email" value={newEntity.email} onChange={e => setNewEntity({...newEntity, email: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800" placeholder="parent@email.com" />
                </div>
                <button type="submit" className="btn-primary w-full py-5 text-lg shadow-xl shadow-primary/20 mt-4">Confirm Registration</button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddClassOpen && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsAddClassOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">New Curriculum Group</h3>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Define academic structure</p>
              
              <form onSubmit={handleCreateClass} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Group Name</label>
                  <input required value={newEntity.className} onChange={e => setNewEntity({...newEntity, className: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800" placeholder="e.g. Physics B" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Assign Teacher</label>
                  <select value={newEntity.teacherId} onChange={e => setNewEntity({...newEntity, teacherId: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800 appearance-none">
                    <option value="">Select Faculty (Optional)</option>
                    {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full py-5 text-lg shadow-xl shadow-primary/20 mt-4">Create Class Group</button>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrincipalDashboard;
