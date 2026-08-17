import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, PlayCircle, BrainCircuit, Target, Users, Handshake, Smile, Zap, Ear } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import Logo from '../components/Logo';

const API = '/api';

interface PlatformCourse {
  id: number;
  title: string;
  domain: string;
  description: string;
  duration: string;
  icon_name: string;
  order: number;
  materials: { id: number }[];
}

const DOMAIN_COLORS: Record<string, string> = {
  'Self-Awareness': '#632C85',
  'Self-Management': '#F07D00',
  'Social Awareness': '#4B9CD3',
  'Relationship Skills': '#99C300',
  'Decision-Making': '#4B2165',
};

const DOMAIN_BG: Record<string, string> = {
  'Self-Awareness': 'from-[#632C85] to-[#4B2165]',
  'Self-Management': 'from-[#F07D00] to-[#C86000]',
  'Social Awareness': 'from-[#4B9CD3] to-[#2E7BB0]',
  'Relationship Skills': 'from-[#99C300] to-[#6E8E00]',
  'Decision-Making': 'from-[#4B2165] to-[#2D1040]',
};

const COURSE_IMAGES: Record<string, string> = {
  'Identifying Emotions': 'https://picsum.photos/seed/emotion1/600/400',
  'Stress Management 101': 'https://picsum.photos/seed/stress/600/400',
  'The Empathy Project': 'https://picsum.photos/seed/empathy/600/400',
  'Healthy Boundaries': 'https://picsum.photos/seed/boundary/600/400',
  'Ethical Leadership': 'https://picsum.photos/seed/lead/600/400',
  'Active Listening': 'https://picsum.photos/seed/listen/600/400',
};

const iconForName = (name: string, cls = 'size-6') => {
  const props = { className: cls };
  switch (name) {
    case 'smile': return <Smile {...props} />;
    case 'zap': return <Zap {...props} />;
    case 'users': return <Users {...props} />;
    case 'handshake': return <Handshake {...props} />;
    case 'target': return <Target {...props} />;
    case 'ear': return <Ear {...props} />;
    default: return <BookOpen {...props} />;
  }
};

const CourseLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [courses, setCourses] = useState<PlatformCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/platform-courses`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setCourses(data); setLoading(false); })
      .catch(() => { setCourses([]); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold">
              <ArrowLeft size={16} /> Home
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            {profile ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
                My Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors px-4 py-2">
                  Sign In
                </button>
                <button onClick={() => navigate('/register')} className="btn-primary text-sm">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#632C85] to-[#2D1040] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
            <BookOpen size={14} /> SEL Course Library
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Build Life Skills<br />That Last Forever
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Interactive modules grounded in CASEL's framework for Social-Emotional Learning.
            Each course includes video lectures, worksheets, and downloadable resources.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/60 font-semibold">
            <span>6 Courses</span>
            <span>·</span>
            <span>5 SEL Domains</span>
            <span>·</span>
            <span>Academy Credit</span>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, i) => {
              const domainColor = DOMAIN_COLORS[course.domain] || '#632C85';
              const image = COURSE_IMAGES[course.title] || `https://picsum.photos/seed/course${i}/600/400`;
              return (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-white rounded-[40px] overflow-hidden shadow-lg border border-gray-100 group cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                      <span style={{ color: domainColor }}>{iconForName(course.icon_name, 'size-4')}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{course.domain}</span>
                    </div>
                    {course.materials.length > 0 && (
                      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl">
                        <span className="text-[10px] font-black text-gray-700">{course.materials.length} resource{course.materials.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-10 space-y-4">
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{course.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1.5"><PlayCircle size={14} /> {course.duration} · Academy Credit</span>
                      <span className="text-[#FEDA00] uppercase tracking-widest" style={{ textShadow: '0 0 0 transparent' }}>
                        <span style={{ color: '#C8A800' }}>Premium</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CourseLibrary;
