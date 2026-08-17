import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, PlayCircle, FileText, File, Download, ExternalLink,
  Upload, X, Trash2, Clock, Award, Plus, ChevronDown, ChevronRight,
  Target, BookMarked, Layers
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import Logo from '../components/Logo';

const API = '/api';

interface CourseLesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  duration: string;
  order: number;
}

interface CourseMaterial {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  material_type: string;
  url: string | null;
  filename: string | null;
  created_at: string;
}

interface PlatformCourse {
  id: number;
  title: string;
  domain: string;
  description: string;
  duration: string;
  icon_name: string;
  order: number;
  materials: CourseMaterial[];
  lessons: CourseLesson[];
}

const DOMAIN_GRADIENT: Record<string, string> = {
  'Self-Awareness':   'from-[#632C85] to-[#4B2165]',
  'Self-Management':  'from-[#F07D00] to-[#C86000]',
  'Social Awareness': 'from-[#4B9CD3] to-[#2E7BB0]',
  'Relationship Skills': 'from-[#99C300] to-[#6E8E00]',
  'Decision-Making':  'from-[#4B2165] to-[#2D1040]',
};

const materialIcon = (type: string) => {
  if (type === 'video_url' || type === 'video') return <PlayCircle size={20} className="text-blue-500" />;
  if (type === 'pdf' || type === 'worksheet') return <FileText size={20} className="text-red-500" />;
  return <File size={20} className="text-gray-400" />;
};

const materialLabel = (type: string) => {
  if (type === 'video_url' || type === 'video') return 'Video Lecture';
  if (type === 'pdf') return 'PDF';
  if (type === 'worksheet') return 'Worksheet';
  return 'File';
};

const resolveHref = (m: CourseMaterial) =>
  m.url?.startsWith('/') ? `/api${m.url}` : m.url ?? '#';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, token } = useAuth();
  const canEdit = profile?.role === 'principal' || profile?.role === 'teacher';

  const [course, setCourse] = useState<PlatformCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(0);

  const [activeTab, setActiveTab] = useState<'lessons' | 'materials'>('lessons');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video_url' | 'file'>('video_url');
  const [form, setForm] = useState({ title: '', description: '', url: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API}/platform-courses/${id}`);
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      setCourse(await res.json());
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourse(); }, [id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setUploading(true);
    try {
      if (uploadType === 'video_url') {
        const res = await fetch(`${API}/platform-courses/${id}/materials/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: form.title, description: form.description, material_type: 'video_url', url: form.url }),
        });
        if (res.ok) { setIsUploadOpen(false); setForm({ title: '', description: '', url: '' }); fetchCourse(); }
      } else if (file) {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('file', file);
        const res = await fetch(`${API}/platform-courses/${id}/materials/upload`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
        if (res.ok) { setIsUploadOpen(false); setFile(null); setForm({ title: '', description: '', url: '' }); fetchCourse(); }
      }
    } finally { setUploading(false); }
  };

  const handleDelete = async (materialId: number) => {
    if (!token) return;
    await fetch(`${API}/platform-course-materials/${materialId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    setConfirmId(null);
    fetchCourse();
  };

  const gradient = course ? (DOMAIN_GRADIENT[course.domain] || 'from-[#632C85] to-[#4B2165]') : 'from-[#632C85] to-[#4B2165]';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 font-bold animate-pulse">Loading course...</p>
    </div>
  );
  if (notFound || !course) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-black text-gray-800">Course not found</p>
      <button onClick={() => navigate('/courses')} className="btn-primary">Back to Library</button>
    </div>
  );

  const totalLessonMin = course.lessons.reduce((acc, l) => {
    const m = parseInt(l.duration);
    return acc + (isNaN(m) ? 0 : m);
  }, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold">
              <ArrowLeft size={16} /> Course Library
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            {profile ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">Dashboard</button>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-primary text-sm">Sign In</button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`bg-gradient-to-br ${gradient} text-white py-16 px-6`}>
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
            <BookOpen size={14} /> {course.domain}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{course.title}</h1>
          <p className="text-lg text-white/75 max-w-2xl leading-relaxed mb-8">{course.description}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60 font-semibold">
            <span className="flex items-center gap-2"><Clock size={14} /> {course.duration} total</span>
            <span className="flex items-center gap-2"><Layers size={14} /> {course.lessons.length} lessons</span>
            <span className="flex items-center gap-2"><Award size={14} /> Academy Credit</span>
            {course.materials.length > 0 && (
              <span className="flex items-center gap-2"><FileText size={14} /> {course.materials.length} resource{course.materials.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div className="border-b border-gray-100 sticky top-[73px] bg-white z-40">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-0">
          {[
            { key: 'lessons', label: 'Lessons', icon: <BookMarked size={15} />, count: course.lessons.length },
            { key: 'materials', label: 'Materials & Worksheets', icon: <FileText size={15} />, count: course.materials.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
          {canEdit && (
            <button
              onClick={() => { setForm({ title: '', description: '', url: '' }); setFile(null); setUploadType('video_url'); setIsUploadOpen(true); setActiveTab('materials'); }}
              className="ml-auto flex items-center gap-2 btn-primary text-xs px-4 py-2"
            >
              <Plus size={14} /> Add Material
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── LESSONS TAB ── */}
        {activeTab === 'lessons' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">Course Lessons</h2>
              <p className="text-sm text-gray-400 mt-1">{course.lessons.length} lessons · {totalLessonMin} min total</p>
            </div>

            {course.lessons.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-sm text-gray-400 font-semibold">No lessons available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.lessons.map((lesson, idx) => {
                  const isOpen = expandedLesson === idx;
                  return (
                    <div key={lesson.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setExpandedLesson(isOpen ? null : idx)}
                        className="w-full flex items-center gap-4 px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-sm">{lesson.title}</p>
                          <p className="text-[11px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                            <Clock size={10} /> {lesson.duration}
                          </p>
                        </div>
                        {isOpen
                          ? <ChevronDown size={16} className="text-primary shrink-0" />
                          : <ChevronRight size={16} className="text-gray-300 shrink-0" />
                        }
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {lesson.content}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MATERIALS TAB ── */}
        {activeTab === 'materials' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Materials & Worksheets</h2>
                <p className="text-sm text-gray-400 mt-1">Downloadable resources, PDFs, and video lectures</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => { setForm({ title: '', description: '', url: '' }); setFile(null); setUploadType('video_url'); setIsUploadOpen(true); }}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={15} /> Add Material
                </button>
              )}
            </div>

            {course.materials.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl gap-4">
                <Upload size={32} className="text-gray-200" />
                <p className="text-sm text-gray-400 font-semibold">No materials uploaded yet.</p>
                {canEdit && (
                  <button onClick={() => setIsUploadOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={15} /> Upload First Material
                  </button>
                )}
                {!canEdit && (
                  <p className="text-xs text-gray-300">Materials will appear here once added by an educator.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {course.materials.map(m => {
                  const href = resolveHref(m);
                  const isVideo = m.material_type === 'video_url' || m.material_type === 'video';
                  return (
                    <div key={m.id} className="card group hover:-translate-y-1 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                          {materialIcon(m.material_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 text-sm leading-tight">{m.title}</p>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5 block">
                                {materialLabel(m.material_type)}
                              </span>
                            </div>
                            {canEdit && (
                              <button onClick={() => setConfirmId(m.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          {m.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{m.description}</p>}
                          {m.url && (
                            <a href={href} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                              {isVideo ? <><ExternalLink size={12} /> Watch Video</> : <><Download size={12} /> Open / Download</>}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900">Upload Material</h3>
                <button onClick={() => setIsUploadOpen(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={20} /></button>
              </div>
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                {[{ v: 'video_url' as const, l: 'Video URL' }, { v: 'file' as const, l: 'Upload File (PDF / Doc)' }].map(opt => (
                  <button key={opt.v} type="button" onClick={() => setUploadType(opt.v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${uploadType === opt.v ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Title</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800"
                    placeholder="e.g. Lesson 1 Worksheet" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description (optional)</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800"
                    placeholder="Brief description of this resource" />
                </div>
                {uploadType === 'video_url' ? (
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">YouTube / Video URL</label>
                    <input required value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                      className="w-full mt-1 bg-surface border border-border p-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800"
                      placeholder="https://youtube.com/watch?v=..." />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">File (PDF, DOCX, video…)</label>
                    <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all mt-1">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Upload size={18} /></div>
                      <p className="text-sm font-black text-gray-700">{file ? file.name : 'Click to choose file'}</p>
                      <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsUploadOpen(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-sm disabled:opacity-60">
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmId !== null && (
          <div className="fixed inset-0 z-[200] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
              <div className="bg-red-500 px-8 pt-7 pb-5">
                <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                  <Trash2 size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-white">Delete Material</h3>
              </div>
              <div className="p-8">
                <p className="text-sm text-gray-600 leading-relaxed mb-6">This will permanently delete this resource. Students will lose access immediately.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmId(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-sm hover:bg-gray-50">Cancel</button>
                  <button onClick={() => handleDelete(confirmId)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600">Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetail;
