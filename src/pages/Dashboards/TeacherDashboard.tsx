import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { LogOut, BookOpen, Clock, Users, CheckCircle, PlusCircle, LayoutDashboard, Plus, X } from 'lucide-react';
import { Class, UserProfile, Assignment } from '../../types';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const TeacherDashboard: React.FC = () => {
  const { profile, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'assignments'>('classes');
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', classId: '', dueDate: '' });

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // In a full implementation, this would fetch from teacher-specific endpoints
      // const resClasses = await fetch('http://localhost:8000/teachers/my/classes', { headers: { Authorization: `Bearer ${token}` } });
      // if (resClasses.ok) setClasses(await resClasses.json());
      
      // Using mock data for demonstration to allow build without firebase
      setClasses([
        { id: '1', name: 'Math 101', schoolId: '1', teacherId: '2', studentIds: ['1'], createdAt: '' }
      ] as any[]);
      setAssignments([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      // In a full implementation, this would create an assignment via the API
      // await fetch('http://localhost:8000/teachers/my/assignments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      //   body: JSON.stringify(newAssignment)
      // });
      setIsAddAssignmentOpen(false);
      setNewAssignment({ title: '', description: '', classId: '', dueDate: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => logout();

  if (loading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Initializing Classroom...</div>;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-primary text-white flex flex-col p-6 h-full">
        <div className="mb-12">
          <Logo size="sm" className="brightness-200 contrast-200" />
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1 ml-11">Educator Portal</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('classes')}
            className={`w-full sidebar-item ${activeTab === 'classes' ? 'sidebar-item-active' : ''}`}
          >
            <LayoutDashboard className="size-5" /> My Classes
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`w-full sidebar-item ${activeTab === 'assignments' ? 'sidebar-item-active' : ''}`}
          >
            <BookOpen className="size-5" /> Assignments
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
             <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-white font-bold text-xs">
               {profile?.displayName?.[0]}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{profile?.displayName}</p>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Teacher</p>
             </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-all font-medium">
            <LogOut className="size-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-surface flex flex-col">
        <header className="h-[72px] bg-white border-b border-border flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Teacher Command Center</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Classroom Management</p>
          </div>
          <div className="role-badge">Faculty Member</div>
        </header>

        <div className="p-8 bento-grid pb-24">
          {activeTab === 'classes' && (
            <>
              {/* Top Row Stats */}
              <div className="card col-span-1">
                <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-3">Managed Explorers</span>
                <div className="text-3xl font-black text-primary">
                  {classes.reduce((acc, curr) => acc + curr.studentIds.length, 0)}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest italic">Across {classes.length} active classes</p>
              </div>

              <div className="card col-span-1">
                <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-3">Pending Tasks</span>
                <div className="text-3xl font-black text-orange-500">12</div>
                <p className="text-[10px] text-orange-400 mt-1 font-bold uppercase tracking-widest italic tracking-tighter">Require attention today</p>
              </div>

              <div className="card col-span-2">
                 <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-3">Overall Skill Mastery</span>
                 <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-black text-primary">78%</div>
                    <div className="text-primary font-black uppercase text-[10px] tracking-widest bg-primary/10 px-2 py-0.5 rounded">Target Ach Achieved</div>
                 </div>
                 <div className="w-full h-2 bg-gray-100 rounded-full mt-4">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: '78%' }}></div>
                 </div>
              </div>

              {/* Class List Grid */}
              <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                {classes.map(cls => (
                  <div key={cls.id} className="card group hover:shadow-2xl hover:translate-y-[-4px] transition-all bg-white p-8 rounded-[40px] border-gray-50 border-2">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h4 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{cls.name}</h4>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Users size={14} className="text-primary" /> {cls.studentIds.length} ENROLLED EXPLORERS
                        </p>
                      </div>
                      <button onClick={() => { setNewAssignment({...newAssignment, classId: cls.id}); setIsAddAssignmentOpen(true); }} className="p-4 bg-primary/5 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <PlusCircle size={24} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <span>Diagnostic Coverage</span>
                        <span>85%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: `85%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-2 py-20 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-[50px]">
                    No curriculum groups assigned to your profile yet.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'assignments' && (
            <div className="col-span-4 card p-0 overflow-hidden border-none shadow-bento bg-white rounded-[50px]">
               <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Assignment Lab</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Track & Grade active work</p>
                  </div>
                  <button onClick={() => setIsAddAssignmentOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> New Assignment
                  </button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface border-b border-border">
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Academic Task</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Curriculum Group</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Expiration</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(asgn => (
                        <tr key={asgn.id} className="border-b border-gray-50 last:border-0 group hover:bg-surface transition-colors">
                          <td className="px-10 py-8">
                            <p className="font-black text-lg text-gray-900 leading-tight group-hover:text-primary transition-colors">{asgn.title}</p>
                            <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest mt-2">{asgn.description.substring(0, 40)}...</p>
                          </td>
                          <td className="px-10 py-8 text-[13px] text-gray-500 font-bold uppercase tracking-tight">
                            {classes.find(c => c.id === asgn.classId)?.name || 'Class Deleted'}
                          </td>
                          <td className="px-10 py-8">
                             <span className="text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-2 w-fit">
                               <Clock size={12} /> {asgn.dueDate}
                             </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="inline-flex items-center gap-2.5">
                              <div className="size-2 rounded-full bg-primary shadow-primary/40 shadow-[0_0_10px_rgba(75,33,101,0.4)]"></div>
                               <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Active Grading</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {assignments.length === 0 && (
                        <tr>
                           <td colSpan={4} className="py-20 text-center text-gray-300 italic font-black uppercase text-[10px] tracking-[0.3em]">No academic tasks assigned to explorers.</td>
                        </tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>

        {/* Create Assignment Modal */}
        {isAddAssignmentOpen && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsAddAssignmentOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">New Assignment</h3>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Deploy task to explorers</p>
              
              <form onSubmit={handleCreateAssignment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Class / Group</label>
                  <select required value={newAssignment.classId} onChange={e => setNewAssignment({...newAssignment, classId: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800 appearance-none">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Assignment Title</label>
                  <input required value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800" placeholder="e.g. Geometry Mastery Quiz" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description / Goals</label>
                  <textarea required value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800 h-24" placeholder="Explain the learning objectives..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Due Date</label>
                  <input required type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="w-full bg-surface border border-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-gray-800" />
                </div>
                <button type="submit" className="btn-primary w-full py-5 text-lg shadow-xl shadow-primary/20 mt-4 font-black">Deploy Assignment</button>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
