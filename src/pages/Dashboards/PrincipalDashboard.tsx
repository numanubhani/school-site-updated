import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Users, BookOpen, Settings, X, Plus, User, Mail, Trash2, ChevronRight, FileText, Video, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';

interface SchoolData { id: number; name: string; invite_code: string; }
interface UserData { id: number; uid: string; email: string; display_name: string; role: string; }
interface ClassData { id: number; name: string; teacher_id: number | null; student_count: number; }
interface SubjectData { id: number; name: string; description: string; class_id: number; }
interface MaterialData { id: number; title: string; description: string; material_type: string; url: string; filename: string | null; }

const API = '/api';

const PrincipalDashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [teachers, setTeachers] = useState<UserData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes'>('overview');

  // Drill-down: class â†’ subject view
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [materials, setMaterials] = useState<MaterialData[]>([]);

  // Class management
  const [classStudents, setClassStudents] = useState<UserData[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState('');

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const confirm = (title: string, message: string, onConfirm: () => void) => setConfirmModal({ title, message, onConfirm });

  // Modals / forms
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [newEntity, setNewEntity] = useState({ name: '', email: '', className: '', teacherId: '', subjectName: '', subjectDesc: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', type: 'video_url', url: '' });
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [schoolRes, teachersRes, classesRes, studentsRes] = await Promise.all([
        fetch(`${API}/schools/my`, { headers }),
        fetch(`${API}/schools/my/teachers`, { headers }),
        fetch(`${API}/schools/my/classes`, { headers }),
        fetch(`${API}/schools/my/students`, { headers }),
      ]);
      if (schoolRes.ok) setSchool(await schoolRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (studentsRes.ok) setStudents(await studentsRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async (classId: number) => {
    const res = await fetch(`${API}/classes/${classId}/subjects`, { headers });
    if (res.ok) setSubjects(await res.json());
  };

  const fetchClassStudents = async (classId: number) => {
    const res = await fetch(`${API}/classes/${classId}/students`, { headers });
    if (res.ok) setClassStudents(await res.json());
  };

  const fetchMaterials = async (subjectId: number) => {
    const res = await fetch(`${API}/subjects/${subjectId}/materials`, { headers });
    if (res.ok) setMaterials(await res.json());
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleLogout = () => logout();

  const navItems = [
    { tab: 'overview', label: 'Dashboard', icon: Settings },
    { tab: 'users', label: 'User Management', icon: Users },
    { tab: 'classes', label: 'Classes', icon: BookOpen },
  ];

  // â”€â”€ handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/schools/my/teachers`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email: newEntity.email, display_name: newEntity.name, role: 'teacher' }) });
    if (res.ok) {
      const data = await res.json();
      setGeneratedPassword(data.generated_password);
      setIsAddTeacherOpen(false);
      setNewEntity(e => ({ ...e, name: '', email: '' }));
      fetchData();
    } else { const err = await res.json(); alert(err.detail || 'Failed'); }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/schools/my/students`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email: newEntity.email, display_name: newEntity.name, role: 'student' }) });
    if (res.ok) {
      const data = await res.json();
      setGeneratedPassword(data.generated_password);
      setIsAddStudentOpen(false);
      setNewEntity(e => ({ ...e, name: '', email: '' }));
      fetchData();
    } else { const err = await res.json(); alert(err.detail || 'Failed'); }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/schools/my/classes`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ name: newEntity.className, teacher_id: newEntity.teacherId ? parseInt(newEntity.teacherId) : null }) });
    if (res.ok) { setIsAddClassOpen(false); setNewEntity(e => ({ ...e, className: '', teacherId: '' })); fetchData(); }
  };

  const handleDeleteUser = (userId: number) => {
    confirm('Remove User', 'This will permanently remove the user from the school. This cannot be undone.', async () => {
      await fetch(`${API}/schools/my/users/${userId}`, { method: 'DELETE', headers });
      fetchData();
    });
  };

  const handleDeleteClass = (classId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm('Delete Class', 'This will permanently delete the class along with all its subjects and uploaded materials. This cannot be undone.', async () => {
      await fetch(`${API}/classes/${classId}`, { method: 'DELETE', headers });
      fetchData();
    });
  };

  const handleSelectClass = async (cls: ClassData) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setMaterials([]);
    setSelectedTeacherId(cls.teacher_id ? String(cls.teacher_id) : '');
    await Promise.all([fetchSubjects(cls.id), fetchClassStudents(cls.id)]);
  };

  const handleUpdateTeacher = async () => {
    if (!selectedClass) return;
    const qs = selectedTeacherId ? `?teacher_id=${selectedTeacherId}` : '';
    const res = await fetch(`${API}/classes/${selectedClass.id}/teacher${qs}`, { method: 'PATCH', headers });
    if (res.ok) {
      const updated = await res.json();
      setSelectedClass(updated);
      setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedClass || !enrollStudentId) return;
    const res = await fetch(`${API}/classes/${selectedClass.id}/enroll/${enrollStudentId}`, { method: 'POST', headers });
    if (res.ok) {
      setIsEnrollOpen(false);
      setEnrollStudentId('');
      fetchClassStudents(selectedClass.id);
      fetchData();
    } else {
      const err = await res.json();
      alert(err.detail || 'Failed to enroll student');
    }
  };

  const handleUnenrollStudent = async (studentId: number) => {
    if (!selectedClass) return;
    await fetch(`${API}/classes/${selectedClass.id}/enroll/${studentId}`, { method: 'DELETE', headers });
    fetchClassStudents(selectedClass.id);
    fetchData();
  };

  const handleSelectSubject = async (sub: SubjectData) => {
    setSelectedSubject(sub);
    await fetchMaterials(sub.id);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    const res = await fetch(`${API}/classes/${selectedClass.id}/subjects`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ name: newEntity.subjectName, description: newEntity.subjectDesc }) });
    if (res.ok) { setIsAddSubjectOpen(false); setNewEntity(e => ({ ...e, subjectName: '', subjectDesc: '' })); fetchSubjects(selectedClass.id); }
  };

  const handleDeleteSubject = (subjectId: number) => {
    confirm('Delete Subject', 'This will delete the subject and all its uploaded materials permanently.', async () => {
      await fetch(`${API}/subjects/${subjectId}`, { method: 'DELETE', headers });
      if (selectedClass) fetchSubjects(selectedClass.id);
      if (selectedSubject?.id === subjectId) setSelectedSubject(null);
    });
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setUploading(true);
    try {
      if (materialForm.type === 'video_url') {
        const res = await fetch(`${API}/subjects/${selectedSubject.id}/materials/url`, {
          method: 'POST', headers: jsonHeaders,
          body: JSON.stringify({ title: materialForm.title, description: materialForm.description, material_type: 'video_url', url: materialForm.url }),
        });
        if (res.ok) { setIsAddMaterialOpen(false); fetchMaterials(selectedSubject.id); }
      } else if (materialFile) {
        const form = new FormData();
        form.append('title', materialForm.title);
        form.append('description', materialForm.description);
        form.append('file', materialFile);
        const res = await fetch(`${API}/subjects/${selectedSubject.id}/materials/upload`, { method: 'POST', headers, body: form });
        if (res.ok) { setIsAddMaterialOpen(false); setMaterialFile(null); fetchMaterials(selectedSubject.id); }
      }
    } finally { setUploading(false); }
  };

  const handleDeleteMaterial = (materialId: number) => {
    confirm('Delete Material', 'This will permanently delete this file or video from the server. Students will lose access immediately.', async () => {
      await fetch(`${API}/materials/${materialId}`, { method: 'DELETE', headers });
      if (selectedSubject) fetchMaterials(selectedSubject.id);
    });
  };

  const materialIcon = (type: string) => {
    if (type === 'video_url' || type === 'video') return <Video size={18} className="text-blue-500" />;
    if (type === 'pdf') return <FileText size={18} className="text-red-500" />;
    return <File size={18} className="text-gray-500" />;
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Loading Administration Panel...</div>;

  const pageTitle = selectedSubject ? selectedSubject.name : selectedClass ? selectedClass.name : school?.name || 'Dashboard';
  const pageSubtitle = selectedSubject ? `${selectedClass?.name} Â· Subject Materials` : selectedClass ? 'Class Detail' : 'Principal Command Center';
  const handleBack = selectedSubject ? () => setSelectedSubject(null) : selectedClass ? () => { setSelectedClass(null); setSelectedSubject(null); } : undefined;

  return (
    <DashboardLayout
      panelTitle="Principal Panel"
      navItems={navItems as any}
      activeTab={activeTab}
      onTabChange={tab => { setActiveTab(tab as any); setSelectedClass(null); setSelectedSubject(null); }}
      onLogout={handleLogout}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      onBack={handleBack}
      topBarRight={
        <div className="flex items-center gap-3">
          {school?.invite_code && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hidden sm:block">
              Code: <span className="text-primary font-mono">{school.invite_code}</span>
            </span>
          )}
          <div className="role-badge">School Principal</div>
        </div>
      }
    >
      <div className="flex flex-col relative min-h-full">
        {/* Generated password banner */}
        {generatedPassword && (
          <div className="absolute top-4 right-4 z-50 bg-green-500 text-white p-5 rounded-2xl shadow-2xl max-w-xs">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-sm">Account Created!</p>
              <button onClick={() => setGeneratedPassword('')}><X size={16} /></button>
            </div>
            <p className="text-xs mb-2">Share this temporary password:</p>
            <p className="text-lg font-mono bg-black/20 p-2 rounded tracking-widest text-center">{generatedPassword}</p>
          </div>
        )}

        <div className="p-8 bento-grid pb-24">

          {/* â”€â”€ Overview Tab â”€â”€ */}
          {activeTab === 'overview' && (
            <>
              <div className="card col-span-1">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Students</span>
                <div className="text-3xl font-black text-primary">{students.length}</div>
              </div>
              <div className="card col-span-1">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Teachers</span>
                <div className="text-3xl font-black text-primary">{teachers.length}</div>
              </div>
              <div className="card col-span-1">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Classes</span>
                <div className="text-3xl font-black text-primary">{classes.length}</div>
              </div>
              <div className="card col-span-1 flex flex-col justify-center items-center bg-primary text-white border-none">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Invite Code</p>
                <p className="text-2xl font-mono font-black tracking-widest">{school?.invite_code}</p>
                <p className="text-[10px] opacity-50 mt-1">Share with staff & students</p>
              </div>

              <div className="card col-span-3 row-span-3">
                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em]">Classes</span>
                  <button onClick={() => setIsAddClassOpen(true)} className="bg-primary/5 text-primary p-2 rounded-xl hover:bg-primary hover:text-white transition-all"><Plus size={18} /></button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">Class</th>
                      <th className="pb-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">Teacher</th>
                      <th className="pb-3 text-[10px] font-black text-gray-300 uppercase tracking-widest text-right">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(cls => (
                      <tr key={cls.id} className="border-b border-gray-50 last:border-0 hover:bg-surface cursor-pointer group" onClick={() => { setActiveTab('classes'); handleSelectClass(cls); }}>
                        <td className="py-4 text-sm font-black text-gray-800 group-hover:text-primary transition-colors">{cls.name}</td>
                        <td className="py-4 text-xs text-gray-500 font-bold">{teachers.find(t => t.id === cls.teacher_id)?.display_name || 'Unassigned'}</td>
                        <td className="py-4 text-right text-xs font-bold text-gray-500">{cls.student_count}</td>
                      </tr>
                    ))}
                    {classes.length === 0 && <tr><td colSpan={3} className="py-12 text-center text-gray-300 italic text-[10px] uppercase font-black tracking-widest">No classes yet.</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="col-span-1 row-span-3 flex flex-col gap-3">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Quick Actions</span>
                {[
                  { label: 'Add Student', sub: 'Register new student', onClick: () => setIsAddStudentOpen(true) },
                  { label: 'Add Teacher', sub: 'Onboard faculty', onClick: () => setIsAddTeacherOpen(true) },
                  { label: 'Add Class', sub: 'Create academic group', onClick: () => setIsAddClassOpen(true) },
                ].map(a => (
                  <button key={a.label} onClick={a.onClick} className="w-full bg-white rounded-2xl p-4 text-left flex items-center gap-3 group hover:-translate-y-0.5 transition-all shadow-bento">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shrink-0"><Plus size={18} /></div>
                    <div>
                      <p className="text-sm font-black text-gray-800 group-hover:text-primary transition-colors">{a.label}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{a.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* â”€â”€ User Management Tab â”€â”€ */}
          {activeTab === 'users' && (
            <div className="col-span-4 space-y-8">
              {/* Teachers section */}
              <div className="card p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Faculty ({teachers.length})</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">All teachers in your school</p>
                  </div>
                  <button onClick={() => setIsAddTeacherOpen(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Teacher</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {teachers.map(t => (
                    <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">{t.display_name[0]}</div>
                        <div>
                          <p className="text-sm font-black text-gray-800">{t.display_name}</p>
                          <p className="text-[10px] text-gray-400">{t.email}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteUser(t.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {teachers.length === 0 && <p className="py-10 text-center text-gray-300 italic text-xs uppercase font-black tracking-widest">No teachers yet.</p>}
                </div>
              </div>

              {/* Students section */}
              <div className="card p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Students ({students.length})</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">All students in your school</p>
                  </div>
                  <button onClick={() => setIsAddStudentOpen(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Student</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-sm">{s.display_name[0]}</div>
                        <div>
                          <p className="text-sm font-black text-gray-800">{s.display_name}</p>
                          <p className="text-[10px] text-gray-400">{s.email}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteUser(s.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {students.length === 0 && <p className="py-10 text-center text-gray-300 italic text-xs uppercase font-black tracking-widest">No students yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ Classes Tab â”€â”€ */}
          {activeTab === 'classes' && !selectedClass && (
            <div className="col-span-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">Classes</h3>
                <button onClick={() => setIsAddClassOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Class</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                  <div key={cls.id} onClick={() => handleSelectClass(cls)} className="card text-left group hover:-translate-y-1 transition-all cursor-pointer relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><BookOpen size={22} /></div>
                      <button onClick={e => handleDeleteClass(cls.id, e)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Delete class">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors mb-1">{cls.name}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{teachers.find(t => t.id === cls.teacher_id)?.display_name || 'No teacher assigned'}</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>{cls.student_count} students</span>
                      <span className="text-primary">View â†’</span>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-3 py-20 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                    No classes yet. Create one to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* â”€â”€ Class detail: teacher + students + subjects â”€â”€ */}
          {activeTab === 'classes' && selectedClass && !selectedSubject && (
            <div className="col-span-4 space-y-8">

              {/* Teacher assignment */}
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Assigned Teacher</p>
                </div>
                <div className="px-6 py-5 flex items-center gap-4">
                  <div className="flex-1">
                    <select
                      value={selectedTeacherId}
                      onChange={e => setSelectedTeacherId(e.target.value)}
                      className="w-full bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 appearance-none"
                    >
                      <option value="">â€” No teacher assigned â€”</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.display_name} ({t.email})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleUpdateTeacher}
                    className="btn-primary px-5 py-3 shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Students in class */}
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Enrolled Students</p>
                    <p className="text-xs text-gray-500 mt-0.5">{classStudents.length} student{classStudents.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => { setEnrollStudentId(''); setIsEnrollOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={15} /> Add Student
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {classStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-6 py-3 hover:bg-surface transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-sm">{s.display_name[0]}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{s.display_name}</p>
                          <p className="text-[10px] text-gray-400">{s.email}</p>
                        </div>
                      </div>
                      <button onClick={() => handleUnenrollStudent(s.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Remove from class">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {classStudents.length === 0 && (
                    <p className="py-8 text-center text-gray-300 italic text-xs uppercase font-black tracking-widest">No students enrolled yet.</p>
                  )}
                </div>
              </div>

              {/* Subjects */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Subjects</p>
                  <button onClick={() => setIsAddSubjectOpen(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={15} /> Add Subject</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subjects.map(sub => (
                    <div key={sub.id} className="card group hover:-translate-y-1 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <button onClick={() => handleSelectSubject(sub)} className="flex-1 text-left">
                          <p className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{sub.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{sub.description || 'No description'}</p>
                        </button>
                        <button onClick={() => handleDeleteSubject(sub.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors ml-2"><Trash2 size={15} /></button>
                      </div>
                      <button onClick={() => handleSelectSubject(sub)} className="w-full mt-2 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
                        <span>View materials</span><ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                  {subjects.length === 0 && (
                    <div className="col-span-3 py-16 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                      No subjects yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ Subject â†’ Materials view â”€â”€ */}
          {activeTab === 'classes' && selectedSubject && (
            <div className="col-span-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">Materials â€” {selectedSubject.name}</h3>
                <button onClick={() => { setMaterialForm({ title: '', description: '', type: 'video_url', url: '' }); setMaterialFile(null); setIsAddMaterialOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Upload Material</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {materials.map(m => (
                  <div key={m.id} className="card group hover:-translate-y-1 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">{materialIcon(m.material_type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-sm truncate">{m.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">{m.material_type.replace('_', ' ')}</p>
                      </div>
                      <button onClick={() => handleDeleteMaterial(m.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={14} /></button>
                    </div>
                    {m.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{m.description}</p>}
                    {m.url && (
                      <a href={m.url.startsWith('/') ? `${API}${m.url}` : m.url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                        Open â†’
                      </a>
                    )}
                  </div>
                ))}
                {materials.length === 0 && (
                  <div className="col-span-3 py-20 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                    No materials yet. Upload a lecture, PDF, or file.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* â”€â”€ Modals â”€â”€ */}

        {/* Add Teacher */}
        <AnimatePresence>
          {isAddTeacherOpen && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="bg-primary px-8 pt-8 pb-6">
                  <button onClick={() => setIsAddTeacherOpen(false)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"><X size={18} /></button>
                  <Users size={28} className="text-white mb-3" />
                  <h3 className="text-xl font-black text-white">Add Teacher</h3>
                  <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Manually onboard faculty</p>
                </div>
                <form onSubmit={handleCreateTeacher} className="p-8 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name</label>
                    <div className="relative mt-1"><User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" /><input required value={newEntity.name} onChange={e => setNewEntity(v => ({ ...v, name: e.target.value }))} className="w-full bg-surface border border-border pl-9 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="Jane Smith" /></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</label>
                    <div className="relative mt-1"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" /><input required type="email" value={newEntity.email} onChange={e => setNewEntity(v => ({ ...v, email: e.target.value }))} className="w-full bg-surface border border-border pl-9 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="teacher@school.edu" /></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddTeacherOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-sm">Add Teacher</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Student */}
        <AnimatePresence>
          {isAddStudentOpen && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="bg-secondary px-8 pt-8 pb-6">
                  <button onClick={() => setIsAddStudentOpen(false)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"><X size={18} /></button>
                  <User size={28} className="text-white mb-3" />
                  <h3 className="text-xl font-black text-white">Add Student</h3>
                  <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Register new student</p>
                </div>
                <form onSubmit={handleCreateStudent} className="p-8 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name</label>
                    <div className="relative mt-1"><User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" /><input required value={newEntity.name} onChange={e => setNewEntity(v => ({ ...v, name: e.target.value }))} className="w-full bg-surface border border-border pl-9 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="Peter Parker" /></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</label>
                    <div className="relative mt-1"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" /><input required type="email" value={newEntity.email} onChange={e => setNewEntity(v => ({ ...v, email: e.target.value }))} className="w-full bg-surface border border-border pl-9 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="student@school.edu" /></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddStudentOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-secondary text-white rounded-2xl font-black text-sm">Add Student</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Class */}
        <AnimatePresence>
          {isAddClassOpen && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900">New Class</h3>
                  <button onClick={() => setIsAddClassOpen(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={20} /></button>
                </div>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Class Name</label>
                    <input required value={newEntity.className} onChange={e => setNewEntity(v => ({ ...v, className: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="e.g. Physics B" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Assign Teacher</label>
                    <select value={newEntity.teacherId} onChange={e => setNewEntity(v => ({ ...v, teacherId: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 appearance-none">
                      <option value="">No teacher (optional)</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddClassOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-sm">Create Class</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Subject */}
        <AnimatePresence>
          {isAddSubjectOpen && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900">New Subject</h3>
                  <button onClick={() => setIsAddSubjectOpen(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={20} /></button>
                </div>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subject Name</label>
                    <input required value={newEntity.subjectName} onChange={e => setNewEntity(v => ({ ...v, subjectName: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="e.g. Algebra, Literature" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description (optional)</label>
                    <textarea value={newEntity.subjectDesc} onChange={e => setNewEntity(v => ({ ...v, subjectDesc: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 h-20 resize-none" placeholder="What will students learn?" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddSubjectOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-sm">Add Subject</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Material */}
        <AnimatePresence>
          {isAddMaterialOpen && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900">Upload Material</h3>
                  <button onClick={() => setIsAddMaterialOpen(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={20} /></button>
                </div>

                {/* Type toggle */}
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                  {[{ v: 'video_url', l: 'Video URL' }, { v: 'file', l: 'Upload File' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => setMaterialForm(f => ({ ...f, type: opt.v }))} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${materialForm.type === opt.v ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>{opt.l}</button>
                  ))}
                </div>

                <form onSubmit={handleAddMaterial} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Title</label>
                    <input required value={materialForm.title} onChange={e => setMaterialForm(f => ({ ...f, title: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="e.g. Chapter 1 Lecture" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description (optional)</label>
                    <input value={materialForm.description} onChange={e => setMaterialForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="Brief description" />
                  </div>

                  {materialForm.type === 'video_url' ? (
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">YouTube / Video URL</label>
                      <input required value={materialForm.url} onChange={e => setMaterialForm(f => ({ ...f, url: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">File (PDF, video, docâ€¦)</label>
                      <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all mt-1">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Plus size={20} /></div>
                        <p className="text-sm font-black text-gray-700">{materialFile ? materialFile.name : 'Click to choose file'}</p>
                        <input type="file" className="hidden" onChange={e => setMaterialFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddMaterialOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={uploading} className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-sm disabled:opacity-60">
                      {uploading ? 'Uploadingâ€¦' : 'Upload'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Enroll Student in Class */}
        <AnimatePresence>
          {isEnrollOpen && selectedClass && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900">Add Student to {selectedClass.name}</h3>
                  <button onClick={() => setIsEnrollOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Select Student</label>
                    <select
                      value={enrollStudentId}
                      onChange={e => setEnrollStudentId(e.target.value)}
                      className="w-full bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 appearance-none"
                    >
                      <option value="">â€” Choose a student â€”</option>
                      {students
                        .filter(s => !classStudents.some(cs => cs.id === s.id))
                        .map(s => (
                          <option key={s.id} value={s.id}>{s.display_name} ({s.email})</option>
                        ))
                      }
                    </select>
                    {students.filter(s => !classStudents.some(cs => cs.id === s.id)).length === 0 && (
                      <p className="text-xs text-gray-400 mt-2 italic">All students are already enrolled in this class.</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setIsEnrollOpen(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 font-black text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleEnrollStudent} disabled={!enrollStudentId} className="flex-1 btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed">Enroll</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmModal && (
            <div className="fixed inset-0 z-[200] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden"
              >
                <div className="bg-red-500 px-8 pt-7 pb-5">
                  <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                    <Trash2 size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black text-white">{confirmModal.title}</h3>
                </div>
                <div className="p-8">
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">{confirmModal.message}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                      className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalDashboard;

