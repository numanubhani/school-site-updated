import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { BookOpen, LayoutDashboard, TrendingUp, ChevronRight, Video, FileText, File, Download, PlayCircle, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const API = '/api';

interface ClassData { id: number; name: string; teacher_id: number | null; student_count: number; }
interface SubjectData { id: number; name: string; description: string; class_id: number; }
interface MaterialData { id: number; title: string; description: string; material_type: string; url: string | null; filename: string | null; }

const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.wmv', '.m4v', '.3gp', '.ts'];

const toEmbedUrl = (url: string): string => {
  const ytWatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  const ytShort = url.match(/youtu\.be\/([^?]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  return url;
};

const isVideoMaterial = (m: MaterialData): boolean => {
  if (m.material_type === 'video') return true;
  const name = (m.filename || m.url || '').toLowerCase();
  return VIDEO_EXTS.some(ext => name.endsWith(ext));
};

const materialIcon = (m: MaterialData) => {
  if (m.material_type === 'video_url') return <Video size={18} className="text-blue-500" />;
  if (isVideoMaterial(m)) return <Video size={18} className="text-blue-500" />;
  if (m.material_type === 'pdf') return <FileText size={18} className="text-red-500" />;
  return <File size={18} className="text-gray-400" />;
};

const StudentDashboard: React.FC = () => {
  const { profile, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'progress'>('classes');
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<MaterialData | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchClasses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/students/my/classes`, { headers });
      if (res.ok) setClasses(await res.json());
    } finally { setLoading(false); }
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

  const handleSelectClass = async (cls: ClassData) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setMaterials([]);
    setActiveMaterial(null);
    await fetchSubjects(cls.id);
  };

  const handleSelectSubject = async (sub: SubjectData) => {
    setSelectedSubject(sub);
    setActiveMaterial(null);
    await fetchMaterials(sub.id);
  };

  const navItems = [
    { tab: 'classes', label: 'My Classes', icon: LayoutDashboard },
    { tab: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const breadcrumb = selectedSubject
    ? `${selectedClass?.name} › ${selectedSubject.name}`
    : selectedClass
    ? selectedClass.name
    : 'My Classes';

  const renderViewer = (m: MaterialData) => {
    const src = m.url ? (m.url.startsWith('/') ? `${API}${m.url}` : m.url) : '';

    if (m.material_type === 'video_url') {
      return (
        <iframe
          key={m.id}
          className="w-full h-full"
          src={toEmbedUrl(src)}
          title={m.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (isVideoMaterial(m)) {
      return (
        <video
          key={m.id}
          controls
          autoPlay
          className="w-full h-full object-contain bg-black"
          src={src}
        >
          Your browser does not support video playback.
        </video>
      );
    }
    if (m.material_type === 'pdf') {
      return (
        <iframe
          key={m.id}
          className="w-full h-full bg-white"
          src={src}
          title={m.title}
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400"><File size={32} /></div>
        <p className="font-black text-gray-700">{m.filename || m.title}</p>
        <a href={src} download={m.filename || m.title} className="btn-primary flex items-center gap-2">
          <Download size={16} /> Download File
        </a>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Loading your classes...</div>;

  return (
    <DashboardLayout
      panelTitle="Student Panel"
      navItems={navItems as any}
      activeTab={activeTab}
      onTabChange={tab => {
        setActiveTab(tab as any);
        if (tab === 'classes') { setSelectedClass(null); setSelectedSubject(null); setActiveMaterial(null); }
      }}
      onLogout={logout}
      topBarRight={
        <div className="flex items-center gap-3">
          <div className="role-badge bg-secondary">Student</div>
          <div className="size-8 bg-surface rounded-xl flex items-center justify-center text-primary font-bold border border-border text-sm">
            {profile?.displayName?.[0]}
          </div>
        </div>
      }
    >
      <div className="flex flex-col min-h-full">
        {/* Top bar */}
        <header className="h-[72px] bg-white border-b border-border flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">
              {activeTab === 'classes' ? breadcrumb : 'Progress'}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {activeTab === 'classes' && selectedSubject ? 'Subject Materials' : activeTab === 'classes' && selectedClass ? 'Subjects' : profile?.displayName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedSubject && (
              <button onClick={() => { setSelectedSubject(null); setActiveMaterial(null); }} className="text-xs text-gray-500 hover:text-primary transition-colors">← Subjects</button>
            )}
            {selectedClass && !selectedSubject && (
              <button onClick={() => { setSelectedClass(null); setSubjects([]); }} className="text-xs text-gray-500 hover:text-primary transition-colors">← Classes</button>
            )}
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">{profile?.displayName?.[0]}</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">

          {/* Progress tab placeholder */}
          {activeTab === 'progress' && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                <TrendingUp size={36} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Your progress insights will appear here</p>
            </div>
          )}

          {/* Class list */}
          {activeTab === 'classes' && !selectedClass && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Enrolled Classes</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                  <button key={cls.id} onClick={() => handleSelectClass(cls)} className="card text-left group hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                        <BookOpen size={22} />
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors mb-1">{cls.name}</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {cls.student_count} students · Tap to view subjects
                    </div>
                  </button>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-3 py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-xs text-gray-300 italic font-black uppercase tracking-widest">You're not enrolled in any classes yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subject list */}
          {activeTab === 'classes' && selectedClass && !selectedSubject && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Subjects in {selectedClass.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(sub => (
                  <button key={sub.id} onClick={() => handleSelectSubject(sub)} className="card text-left group hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <BookOpen size={18} />
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-secondary transition-colors" />
                    </div>
                    <p className="text-lg font-black text-gray-900 group-hover:text-secondary transition-colors">{sub.name}</p>
                    {sub.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{sub.description}</p>}
                    <p className="mt-4 pt-3 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">View materials →</p>
                  </button>
                ))}
                {subjects.length === 0 && (
                  <div className="col-span-3 py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-xs text-gray-300 italic font-black uppercase tracking-widest">No subjects added yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materials view */}
          {activeTab === 'classes' && selectedSubject && (
            <div className="flex gap-6 h-[calc(100vh-220px)]">

              {/* Materials list */}
              <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Materials</p>
                {materials.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMaterial(m)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                      activeMaterial?.id === m.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-white hover:border-gray-100 hover:bg-surface'
                    }`}
                  >
                    <div className="size-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      {materialIcon(m)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-gray-900 leading-tight truncate">{m.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {m.material_type === 'video_url' ? 'Video Link' : isVideoMaterial(m) ? 'Video' : m.material_type.toUpperCase()}
                      </p>
                      {m.description && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{m.description}</p>}
                    </div>
                    {activeMaterial?.id === m.id && (
                      <div className="size-2 rounded-full bg-primary mt-1 shrink-0" />
                    )}
                  </button>
                ))}
                {materials.length === 0 && (
                  <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-xs text-gray-300 italic font-black uppercase tracking-widest">No materials yet.</p>
                  </div>
                )}
              </div>

              {/* Viewer */}
              <div className="flex-1 rounded-3xl overflow-hidden border border-border bg-gray-900 flex flex-col">
                {activeMaterial ? (
                  <>
                    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-border shrink-0">
                      <div className="flex items-center gap-2">
                        {materialIcon(activeMaterial)}
                        <span className="font-black text-sm text-gray-900">{activeMaterial.title}</span>
                      </div>
                      <button onClick={() => setActiveMaterial(null)} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {renderViewer(activeMaterial)}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4">
                    <PlayCircle size={56} className="opacity-30" />
                    <p className="text-sm font-black uppercase tracking-widest opacity-50">Select a material to view</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;

