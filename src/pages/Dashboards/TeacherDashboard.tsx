import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { BookOpen, LayoutDashboard, Plus, X, Video, Upload, Link as LinkIcon, ChevronRight, FileText, File, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';

const API = '/api';

interface ClassData { id: number; name: string; teacher_id: number | null; student_count: number; }
interface SubjectData { id: number; name: string; description: string; class_id: number; }
interface MaterialData { id: number; title: string; description: string; material_type: string; url: string; filename: string | null; }

const materialIcon = (type: string) => {
  if (type === 'video_url' || type === 'video') return <Video size={18} className="text-blue-500" />;
  if (type === 'pdf') return <FileText size={18} className="text-red-500" />;
  return <File size={18} className="text-gray-500" />;
};

const TeacherDashboard: React.FC = () => {
  const { profile, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);

  // Drill-down
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [materials, setMaterials] = useState<MaterialData[]>([]);

  // Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', type: 'video_url', url: '' });
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const confirm = (title: string, message: string, onConfirm: () => void) => setConfirmModal({ title, message, onConfirm });

  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchClasses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/teachers/my/classes`, { headers });
      if (res.ok) setClasses(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async (classId: number) => {
    const res = await fetch(`${API}/classes/${classId}/subjects`, { headers });
    if (res.ok) setSubjects(await res.json());
  };

  const fetchMaterials = async (subjectId: number) => {
    const res = await fetch(`${API}/subjects/${subjectId}/materials`, { headers });
    if (res.ok) setMaterials(await res.json());
  };

  useEffect(() => { fetchClasses(); }, [token]);

  const handleLogout = () => logout();

  const navItems = [
    { tab: 'classes', label: 'My Classes', icon: LayoutDashboard },
    { tab: 'subjects', label: 'All Subjects', icon: BookOpen },
  ];

  const handleSelectClass = async (cls: ClassData) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setMaterials([]);
    await fetchSubjects(cls.id);
  };

  const handleSelectSubject = async (sub: SubjectData): Promise<void> => {
    setSelectedSubject(sub);
    await fetchMaterials(sub.id);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    const res = await fetch(`${API}/classes/${selectedClass.id}/subjects`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ name: subjectForm.name, description: subjectForm.description }) });
    if (res.ok) { setIsAddSubjectOpen(false); setSubjectForm({ name: '', description: '' }); fetchSubjects(selectedClass.id); }
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
        if (res.ok) { setIsAddMaterialOpen(false); setMaterialForm(f => ({ ...f, title: '', description: '', url: '' })); fetchMaterials(selectedSubject.id); }
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

  if (loading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Initializing Classroom...</div>;

  const pageTitle = selectedSubject ? selectedSubject.name : selectedClass ? selectedClass.name : profile?.displayName || 'Teacher Dashboard';
  const pageSubtitle = selectedSubject ? `${selectedClass?.name} · Materials` : selectedClass ? 'Class Subjects' : 'Teacher Panel';
  const handleBack = selectedSubject ? () => setSelectedSubject(null) : selectedClass ? () => setSelectedClass(null) : undefined;

  return (
    <DashboardLayout
      panelTitle="Teacher Panel"
      navItems={navItems as any}
      activeTab={activeTab}
      onTabChange={tab => { setActiveTab(tab as any); setSelectedClass(null); setSelectedSubject(null); }}
      onLogout={handleLogout}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      onBack={handleBack}
      topBarRight={
        <div className="flex items-center gap-3">
          <div className="role-badge">Faculty Member</div>
          <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-white font-bold text-sm">{profile?.displayName?.[0]}</div>
        </div>
      }
    >
      <div className="flex flex-col min-h-full">
        <div className="p-8 bento-grid pb-24">

          {/* Stats row when on classes and nothing selected */}
          {activeTab === 'classes' && !selectedClass && (
            <>
              <div className="card col-span-1">
                <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-3">My Classes</span>
                <div className="text-3xl font-black text-primary">{classes.length}</div>
              </div>
              <div className="card col-span-1">
                <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-3">Total Students</span>
                <div className="text-3xl font-black text-primary">{classes.reduce((a, c) => a + c.student_count, 0)}</div>
              </div>
              <div className="col-span-2" />

              <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map(cls => (
                  <button key={cls.id} onClick={() => handleSelectClass(cls)} className="card text-left group hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><BookOpen size={22} /></div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors mb-1">{cls.name}</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {cls.student_count} students enrolled · View subjects →
                    </div>
                  </button>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-2 py-20 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                    No classes assigned yet. Contact your principal.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Class → Subjects */}
          {activeTab === 'classes' && selectedClass && !selectedSubject && (
            <div className="col-span-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Subjects in {selectedClass.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">Click <span className="font-black text-primary">Upload</span> on a subject to add lectures, PDFs, or files.</p>
                </div>
                <button onClick={() => setIsAddSubjectOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Subject</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(sub => (
                  <div key={sub.id} className="card group hover:-translate-y-1 transition-all flex flex-col">
                    <div className="flex items-start gap-2 mb-3">
                      <button onClick={() => handleSelectSubject(sub)} className="flex-1 text-left">
                        <p className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{sub.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{sub.description || 'No description'}</p>
                      </button>
                      <button onClick={() => handleDeleteSubject(sub.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
                      <button
                        onClick={async () => { await handleSelectSubject(sub); setMaterialForm({ title: '', description: '', type: 'video_url', url: '' }); setMaterialFile(null); setIsAddMaterialOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                      >
                        <Upload size={13} /> Upload
                      </button>
                      <button
                        onClick={() => handleSelectSubject(sub)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface text-gray-500 text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors border border-border"
                      >
                        View <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {subjects.length === 0 && (
                  <div className="col-span-3 py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl gap-4">
                    <p className="text-xs text-gray-300 italic font-black uppercase tracking-widest">No subjects yet.</p>
                    <button onClick={() => setIsAddSubjectOpen(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add First Subject</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subject → Materials */}
          {activeTab === 'classes' && selectedSubject && (
            <div className="col-span-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">Materials — {selectedSubject.name}</h3>
                <button onClick={() => { setMaterialForm({ title: '', description: '', type: 'video_url', url: '' }); setMaterialFile(null); setIsAddMaterialOpen(true); }} className="btn-primary flex items-center gap-2"><Upload size={18} /> Upload</button>
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
                      <a href={m.url.startsWith('/') ? `${API}${m.url}` : m.url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Open →</a>
                    )}
                  </div>
                ))}
                {materials.length === 0 && (
                  <div className="col-span-3 py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl gap-4">
                    <Upload size={28} className="text-gray-200" />
                    <p className="text-xs text-gray-300 italic font-black uppercase tracking-widest">No materials yet.</p>
                    <button onClick={() => { setMaterialForm({ title: '', description: '', type: 'video_url', url: '' }); setMaterialFile(null); setIsAddMaterialOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
                      <Upload size={15} /> Upload First Material
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All subjects across all classes */}
          {activeTab === 'subjects' && (
            <div className="col-span-4 space-y-10">
              {classes.length === 0 && (
                <p className="py-20 text-center text-gray-300 italic font-black uppercase text-xs tracking-widest">No classes assigned.</p>
              )}
              {classes.map(cls => (
                <div key={cls.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen size={18} className="text-primary" />
                    <h3 className="text-lg font-black text-gray-900">{cls.name}</h3>
                    <button onClick={() => { setSelectedClass(cls); setActiveTab('classes'); handleSelectClass(cls); }} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline ml-auto">Add Subject</button>
                  </div>
                  <SubjectList classId={cls.id} token={token!} onSelect={sub => { setSelectedClass(cls); setSelectedSubject(sub); setActiveTab('classes'); fetchMaterials(sub.id); }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Subject Modal */}
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
                    <input required value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="e.g. Algebra" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description (optional)</label>
                    <textarea value={subjectForm.description} onChange={e => setSubjectForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 h-20 resize-none" />
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

        {/* Upload Material Modal */}
        <AnimatePresence>
          {isAddMaterialOpen && (
            <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900">Upload Material</h3>
                  <button onClick={() => setIsAddMaterialOpen(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={20} /></button>
                </div>

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
                    <input value={materialForm.description} onChange={e => setMaterialForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" />
                  </div>

                  {materialForm.type === 'video_url' ? (
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">YouTube / Video URL</label>
                      <input required value={materialForm.url} onChange={e => setMaterialForm(f => ({ ...f, url: e.target.value }))} className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">File (PDF, video, doc…)</label>
                      <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all mt-1">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Upload size={18} /></div>
                        <p className="text-sm font-black text-gray-700">{materialFile ? materialFile.name : 'Click to choose file'}</p>
                        <input type="file" className="hidden" onChange={e => setMaterialFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddMaterialOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={uploading} className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-sm disabled:opacity-60">
                      {uploading ? 'Uploading…' : 'Upload'}
                    </button>
                  </div>
                </form>
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
                    <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors">Delete</button>
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

// Lightweight inline subject list for the "All Subjects" tab
const SubjectList: React.FC<{ classId: number; token: string; onSelect: (sub: SubjectData) => void }> = ({ classId, token, onSelect }) => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  useEffect(() => {
    fetch(`${API}/classes/${classId}/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setSubjects)
      .catch(() => {});
  }, [classId]);

  if (subjects.length === 0) return <p className="text-xs text-gray-300 italic pl-7">No subjects yet.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map(s => (
        <button key={s.id} onClick={() => onSelect(s)} className="card text-left hover:-translate-y-0.5 transition-all">
          <p className="font-black text-gray-900 text-sm">{s.name}</p>
          <p className="text-[10px] text-gray-400 mt-1">{s.description || 'No description'}</p>
        </button>
      ))}
    </div>
  );
};

export default TeacherDashboard;

