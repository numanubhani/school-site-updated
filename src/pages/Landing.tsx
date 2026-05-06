import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calculator, Globe, FlaskConical, Users, Award, 
  PlayCircle, ArrowRight, CheckCircle2, Star, Zap, Target, 
  BarChart3, Sparkles, Quote, MousePointer2, Heart, Handshake, BrainCircuit, Smile
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import Logo from '../components/Logo';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);

  const subjects = [
    { title: 'Math', icon: <Calculator className="size-10" />, color: 'from-[#632C85] to-[#4B2165]', count: '12,400+ skills', description: 'Master everything from counting to calculus.' },
    { title: 'Language Arts', icon: <BookOpen className="size-10" />, color: 'from-[#F07D00] to-[#FF8C00]', count: '6,800+ skills', description: 'Foundational reading to advanced literature.' },
    { title: 'Science', icon: <FlaskConical className="size-10" />, color: 'from-[#99C300] to-[#BADA55]', count: '3,200+ skills', description: 'Explore the universe through virtual labs.' },
    { title: 'Social Studies', icon: <Globe className="size-10" />, color: 'from-[#4B2165] to-[#6A3082]', count: '2,100+ skills', description: 'History, geography, and global citizenship.' },
    { title: 'SEL', icon: <Heart className="size-10" />, color: 'from-[#FEDA00] to-[#FFE033]', count: '5 Core Domains', description: 'Social Emotional Learning based on CASEL.' },
  ];

  const selDomains = [
    { 
      title: 'Self-Awareness', 
      icon: <BrainCircuit className="size-8" />, 
      color: 'bg-[#632C85]', 
      description: "Recognizing one's emotions and values as well as one's strengths and challenges." 
    },
    { 
      title: 'Self-Management', 
      icon: <Target className="size-8" />, 
      color: 'bg-[#FEDA00]', 
      description: "Managing emotions and behaviors to achieve one's goals." 
    },
    { 
      title: 'Social Awareness', 
      icon: <Users className="size-8" />, 
      color: 'bg-[#F07D00]', 
      description: "Showing understanding and empathy for others." 
    },
    { 
      title: 'Relationship Skills', 
      icon: <Handshake className="size-8" />, 
      color: 'bg-[#99C300]', 
      description: "Forming positive relationships and working effectively in teams." 
    },
    { 
      title: 'Decision-Making', 
      icon: <Zap className="size-8" />, 
      color: 'bg-[#4B2165]', 
      description: "Making ethical, constructive choices about personal and social behavior." 
    },
  ];

  const grades = ['Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 py-5 sticky top-0 z-[100] transition-all">
        <div className="group cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="md" />
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          {['Curriculum', 'Diagnostics', 'Analytics', 'Inspiration'].map((item) => (
            <Link key={item} to="#" className="text-sm font-black text-gray-500 hover:text-primary tracking-widest uppercase transition-all">
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          {user ? (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')} 
              className="bg-secondary text-white px-8 py-2.5 rounded-2xl font-black shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all text-sm uppercase tracking-widest"
            >
              Enter Dashboard
            </motion.button>
          ) : (
            <div className="flex items-center gap-8">
              <Link to="/login" className="text-sm font-black text-primary hover:text-primary/80 uppercase tracking-widest border-b-2 border-transparent hover:border-primary transition-all">Membership</Link>
              <Link to="/login" className="bg-gray-900 text-white px-8 py-2.5 rounded-2xl font-black shadow-xl hover:bg-black transition-all text-sm uppercase tracking-widest">Sign in</Link>
            </div>
          )}
        </div>
      </header>

      {/* High-Impact Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-8">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[70%] bg-secondary/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#4B2165 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-10 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-full shadow-xl shadow-gray-200/50">
                <span className="flex h-3 w-3 rounded-full bg-secondary animate-ping"></span>
                <span className="text-[11px] font-black uppercase text-gray-500 tracking-[0.3em]">System Status: Optimization Active</span>
                <Sparkles className="size-4 text-accent" />
              </div>
              
              <h1 className="text-6xl xl:text-8xl font-black text-gray-900 leading-[0.95] tracking-tighter">
                The Future of <span className="text-primary italic relative">Learning <div className="absolute -bottom-2 left-0 w-full h-3 bg-secondary/20 -rotate-1 -z-10"></div></span> is Personalized.
              </h1>
              
              <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
                From Pre-K to College Prep, EduXcel uses <span className="text-gray-900">Adaptive Intelligence</span> to ensure no explorer is left behind. Master any skill, anytime.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="bg-primary text-white px-12 py-6 rounded-[30px] font-black text-xl shadow-[0_20px_50px_rgba(75,33,101,0.3)] hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group"
                >
                  Get Started Free <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                </motion.button>
                <button className="bg-white text-gray-900 border-4 border-gray-50 px-12 py-6 rounded-[30px] font-black text-xl hover:bg-gray-50 flex items-center justify-center gap-3 transition-all shadow-lg shadow-gray-100">
                  <PlayCircle size={24} /> Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                {['Stanford', 'MIT', 'Berkeley', 'Oxford'].map(u => (
                  <span key={u} className="text-lg font-black tracking-tighter text-gray-400 italic underline decoration-2 decoration-gray-100">{u} Partners</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
              <div className="relative z-10 bg-white p-6 md:p-10 rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.12)] border border-white/50 backdrop-blur-xl">
                <div className="overflow-hidden rounded-[40px] relative aspect-[4/3] group/img">
                  <img 
                    src="https://picsum.photos/seed/edu99/1200/900" 
                    alt="Adaptive Learning" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 text-white space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Real-Time Insight</p>
                    <h4 className="text-3xl font-black italic tracking-tighter">Diagnostic Mastery Path</h4>
                  </div>
                </div>

                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-12 -right-8 bg-secondary p-8 rounded-[35px] text-white shadow-2xl flex flex-col items-center gap-2 border-4 border-white"
                >
                  <Award className="size-12 drop-shadow-lg" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Certified</span>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[40px] shadow-2xl border-4 border-gray-50 flex items-center gap-6"
                >
                  <div className="bg-green-50 p-4 rounded-3xl text-green-500 shadow-inner">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-gray-900 italic tracking-tighter">98.4%</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Growth Index</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured SEL Lessons */}
      <section className="py-32 px-8 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
            <div className="text-center md:text-left space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter italic">Featured <span className="text-primary italic">SEL Lessons</span></h2>
              <p className="text-lg text-gray-400 font-bold max-w-xl">Interactive modules designed to build character and emotional resilience.</p>
            </div>
            <button className="bg-primary text-white px-10 py-5 rounded-[25px] font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3">
              Browse All Lessons <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                title: "Identifying Emotions", 
                domain: "Self-Awareness", 
                image: "https://picsum.photos/seed/emotion1/600/400", 
                duration: "15 min", 
                icon: <Smile className="text-[#632C85]" /> 
              },
              { 
                title: "Stress Management 101", 
                domain: "Self-Management", 
                image: "https://picsum.photos/seed/stress/600/400", 
                duration: "20 min", 
                icon: <Zap className="text-[#FEDA00]" /> 
              },
              { 
                title: "The Empathy Project", 
                domain: "Social Awareness", 
                image: "https://picsum.photos/seed/empathy/600/400", 
                duration: "25 min", 
                icon: <Users className="text-[#F07D00]" /> 
              },
              { 
                title: "Healthy Boundaries", 
                domain: "Relationship Skills", 
                image: "https://picsum.photos/seed/boundary/600/400", 
                duration: "18 min", 
                icon: <Handshake className="text-[#99C300]" /> 
              },
              { 
                title: "Ethical Leadership", 
                domain: "Decision-Making", 
                image: "https://picsum.photos/seed/lead/600/400", 
                duration: "30 min", 
                icon: <Target className="text-[#4B2165]" /> 
              },
              { 
                title: "Active Listening", 
                domain: "Relationship Skills", 
                image: "https://picsum.photos/seed/listen/600/400", 
                duration: "12 min", 
                icon: <BookOpen className="text-[#99C300]" /> 
              }
            ].map((lesson, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-lg border border-gray-100 group cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                   <img src={lesson.image} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                   <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                      {lesson.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{lesson.domain}</span>
                   </div>
                </div>
                <div className="p-10 space-y-4">
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{lesson.title}</h4>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><PlayCircle size={14} /> {lesson.duration} Academy Credit</span>
                    <span className="text-secondary uppercase tracking-widest">Premium</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade Select Navigation - IXL Core Feel */}
      <section className="bg-gray-50/50 border-y border-gray-100 py-12 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex justify-between items-end">
             <div>
               <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">Curriculum Roadmap</h3>
               <p className="text-2xl font-black text-gray-900 tracking-tighter">Select a grade to explore skills</p>
             </div>
             <Link to="#" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
               Full Catalog <ArrowRight size={14} />
             </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
             {grades.map(grade => (
               <motion.button
                 key={grade}
                 onMouseEnter={() => setHoveredGrade(grade)}
                 onMouseLeave={() => setHoveredGrade(null)}
                 whileHover={{ y: -4, backgroundColor: '#4B2165', color: '#fff' }}
                 className={`px-8 py-5 rounded-[22px] border-2 text-sm font-black transition-all ${hoveredGrade === grade ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' : 'border-gray-100 bg-white text-gray-700'}`}
               >
                 {grade}
               </motion.button>
             ))}
          </div>
        </div>
      </section>

      {/* Stats Marquee */}
      <div className="bg-primary py-4 overflow-hidden hidden md:block">
        <div className="flex animate-marquee whitespace-nowrap gap-20 items-center">
          {[...Array(10)].map((_, i) => (
             <div key={i} className="flex items-center gap-3 text-white">
                <Target className="size-4 text-accent" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Explorer [ID: {Math.floor(Math.random() * 9000) + 1000}] mastered Geometry Fundamentals</span>
             </div>
          ))}
        </div>
      </div>

      {/* Subject Bento Section */}
      <section id="curriculum" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
           <div className="space-y-4 text-left max-w-2xl">
             <h2 className="text-5xl lg:text-7xl font-black text-gray-900 leading-none tracking-tighter italic">World-Class <span className="text-secondary">Curriculum</span></h2>
             <p className="text-lg text-gray-400 font-bold leading-relaxed">Exhaustive coverage of core academic subjects joined with industry-leading Social Emotional Learning.</p>
           </div>
           <button className="btn-primary px-12 py-5 rounded-[25px]">View Full Catalog</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {subjects.map((sub, idx) => (
            <motion.div 
              key={sub.title}
              whileHover={{ y: -15, scale: 1.02 }}
              className="bg-white border-2 border-gray-50 p-8 rounded-[40px] shadow-lg hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${sub.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-bl-[100px]`}></div>
              <div className={`size-20 rounded-[25px] bg-gradient-to-br ${sub.color} flex items-center justify-center text-white mb-8 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 mx-auto md:mx-0`}>
                {sub.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 leading-none">{sub.title}</h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">{sub.count}</p>
              <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">{sub.description}</p>
              <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest group-hover:translate-x-2 transition-transform">
                Enter <ArrowRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SEL CASEL Framework Section */}
      <section className="bg-surface py-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">Social & Emotional <span className="text-primary italic animate-pulse">Learning</span></h2>
            <p className="text-xl text-gray-500 font-bold max-w-3xl mx-auto">
              Our core mission: Implementing the CASEL framework to nurture healthy development and academic success.
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center min-h-[600px]">
            {/* The Wheel Center */}
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              className="z-10 bg-white size-64 rounded-full shadow-[0_0_100px_rgba(75,33,101,0.2)] flex flex-col items-center justify-center text-center p-8 border-8 border-primary/10"
            >
              <Heart className="size-12 text-primary mb-2" />
              <p className="text-xl font-black text-gray-900 leading-tight">CASEL<br/>Framework</p>
            </motion.div>

            {/* Orbiting Domains */}
            {selDomains.map((domain, i) => {
              const angle = (i * 360) / selDomains.length;
              return (
                <motion.div
                  key={domain.title}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  whileInView={{ 
                    opacity: 1, 
                    x: Math.cos((angle * Math.PI) / 180) * 280,
                    y: Math.sin((angle * Math.PI) / 180) * 280
                  }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="absolute flex flex-col items-center group"
                >
                  <div className={`size-24 rounded-[30px] ${domain.color} text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer relative z-20`}>
                    {domain.icon}
                    <div className="absolute -bottom-12 whitespace-nowrap bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 uppercase tracking-widest">
                      {domain.title}
                    </div>
                  </div>
                  <div className="max-w-[200px] text-center mt-16 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                     <p className="text-xs font-bold text-gray-500 leading-relaxed">{domain.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SEL Research Section */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex px-6 py-2 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Evidence-Based Research</div>
              <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none italic">The Science of <span className="text-secondary">Impact.</span></h2>
              <p className="text-xl text-gray-500 font-bold leading-relaxed">
                Decades of research show that social and emotional learning (SEL) provides a critical foundation for student success. 
              </p>
              <div className="space-y-6">
                {[
                  { stat: '11th% Point', label: 'Gain in academic achievement' },
                  { stat: '11:1 ROI', label: 'Economic return for every dollar invested' },
                  { stat: '5x Higher', label: 'Likelihood of graduating university' }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 group"
                  >
                    <div className="text-4xl font-black text-primary italic tracking-tighter w-40 underline decoration-secondary decoration-4">{item.stat}</div>
                    <div className="text-sm font-black text-gray-400 uppercase tracking-widest">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Academic Boost", color: "bg-primary/5", desc: "SEL helps students navigate challenges, stay focused, and achieve higher grades." },
                { title: "Well-being", color: "bg-pink-50", desc: "Reduces anxiety, emotional distress, and classroom discipline issues." },
                { title: "Future Ready", color: "bg-green-50", desc: "Employers rank empathy and teamwork as the top desired skills in 2024." },
                { title: "CASEL Legacy", color: "bg-purple-50", desc: "A gold-standard framework trusted by global education ministries." }
              ].map((card, i) => (
                <div key={i} className={`${card.color} p-10 rounded-[40px] border border-white/20 shadow-sm hover:shadow-xl transition-all cursor-default group`}>
                   <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter group-hover:text-primary transition-colors">{card.title}</h4>
                   <p className="text-sm text-gray-500 font-bold leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Focus */}
      <section className="bg-gray-900 text-white py-32 px-8 overflow-hidden rounded-[80px] mx-8 my-20 border-none relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-primary/20 blur-[150px]"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-[80%] bg-secondary/10 blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <div className="inline-flex px-6 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Adaptive Engine 2.0</div>
            <h2 className="text-6xl xl:text-8xl font-black italic tracking-tighter leading-none">Diagnostic <span className="text-primary italic underline decoration-4 underline-offset-8">Precision.</span></h2>
            <p className="text-xl text-gray-400 font-bold leading-relaxed">Our Smart-Diagnostics engine analyzes over 500 decision points to build a unique learning path for every student. Zero friction, total mastery.</p>
            
            <div className="grid grid-cols-2 gap-8 pt-8">
              {[
                { icon: <Zap className="text-accent" />, title: 'Real-time feedback' },
                { icon: <Target className="text-secondary" />, title: 'Individual Goals' },
                { icon: <BarChart3 className="text-primary" />, title: 'Deep Analytics' },
                { icon: <MousePointer2 className="text-purple-400" />, title: 'Interactive UX' }
              ].map(f => (
                <div key={f.title} className="flex items-center gap-4 group">
                  <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    {f.icon}
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">{f.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
             <div className="bg-gradient-to-br from-white/10 to-transparent p-1 rounded-[60px] shadow-2xl relative z-10">
                <div className="bg-gray-800 rounded-[60px] p-12 space-y-8">
                   <div className="flex items-center justify-between border-b border-white/5 pb-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Explorer Report</p>
                        <p className="text-2xl font-black italic tracking-tighter">Academic Velocity</p>
                      </div>
                      <div className="size-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><BarChart3 size={24} /></div>
                   </div>
                   <div className="space-y-6">
                      {[
                        { label: 'Algebraic Computation', val: 92, color: 'bg-primary' },
                        { label: 'Strategic Reading', val: 78, color: 'bg-secondary' },
                        { label: 'Scientific Method', val: 85, color: 'bg-accent' }
                      ].map(stat => (
                        <div key={stat.label} className="space-y-2">
                           <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60">
                              <span>{stat.label}</span>
                              <span>{stat.val}%</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${stat.val}%` }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className={`h-full ${stat.color} rounded-full`}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             {/* Decorative element behind box */}
             <div className="absolute -top-10 -right-10 w-full h-full border-4 border-white/5 rounded-[60px] -z-10 translate-x-4 translate-y-4"></div>
          </div>
        </div>
      </section>

      {/* Social Proof - Role Based */}
      <section className="py-32 px-8 max-w-7xl mx-auto space-y-40">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-8">
             <span className="text-secondary font-black uppercase tracking-[0.4em] text-xs">Principal Access</span>
             <h3 className="text-6xl font-black text-gray-900 tracking-tighter leading-[0.95] italic">Control Your <span className="text-primary italic">Entire Campus</span> from One Hub.</h3>
             <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-lg">Manage faculty, track cross-grade diagnostics, and deploy school-wide initiatives instantly. Institutional excellence, redefined.</p>
             <button onClick={() => navigate('/register')} className="btn-primary px-10 py-5 text-lg">Partner With Us</button>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div className="bg-surface rounded-3xl p-10 space-y-4 border border-gray-100 hover:border-primary/20 transition-all group">
                 <Users className="size-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                 <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none">Faculty Management</h4>
                 <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Assign classrooms instantly</p>
              </div>
              <div className="bg-surface rounded-3xl p-10 space-y-4 border border-gray-100 mt-12 hover:border-secondary/20 transition-all group">
                 <Target className="size-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
                 <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none">Smart Diagnostics</h4>
                 <p className="text-xs text-gray-400 font-black uppercase tracking-widest">School-wide performance</p>
              </div>
           </div>
        </div>
      </section>

      {/* Premium Testimonial */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto bg-primary text-white rounded-[70px] p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-20 shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
           <div className="flex-1 space-y-8 relative z-10">
              <Quote className="size-20 text-white/20 -mb-10 -ml-10" />
              <div className="flex gap-1.5 text-accent">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
              </div>
              <p className="text-4xl lg:text-5xl font-black italic italic leading-tight tracking-tighter">
                "EduXcel isn't just a learning platform—it's an academic engine that empowers my children to master the world on their own terms."
              </p>
              <div className="pt-8 border-t border-white/10 w-fit">
                <p className="text-3xl font-black italic tracking-tighter">Maria Rodriguez</p>
                <p className="text-[10px] opacity-60 uppercase font-black tracking-[0.4em] mt-2">Executive Parent & University Liaison</p>
              </div>
           </div>
           <motion.div 
            whileHover={{ scale: 1.05 }}
            className="size-80 shrink-0 relative z-10"
           >
              <img 
                src="https://picsum.photos/seed/guardian/600/600" 
                alt="Testimonial" 
                className="w-full h-full rounded-[60px] object-cover border-[16px] border-white/10 shadow-2xl"
                referrerPolicy="no-referrer" 
              />
              <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-6 rounded-[30px] font-black text-xl shadow-2xl">Verified Mom</div>
           </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-32 pb-20 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32 relative z-10">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <Logo size="lg" />
            </div>
            <p className="text-gray-500 font-black text-sm leading-relaxed uppercase tracking-[0.2em] max-w-xs">Intelligence-led education for the next generation of builders.</p>
            <div className="flex gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="size-14 bg-white/5 rounded-3xl hover:bg-primary transition-all cursor-pointer flex items-center justify-center text-white/50 hover:text-white border border-white/5 group">
                   <Users className="size-6 group-hover:scale-110 transition-transform" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black mb-10 text-primary uppercase tracking-[0.4em] text-xs">Curriculum</h4>
            <ul className="space-y-6 text-sm text-gray-500 font-bold uppercase tracking-widest">
              <li><Link to="#" className="hover:text-white transition-colors">Mathematics</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Language Arts</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Science Explorer</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Diagnostics</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black mb-10 text-secondary uppercase tracking-[0.4em] text-xs">Partnership</h4>
            <ul className="space-y-6 text-sm text-gray-500 font-bold uppercase tracking-widest">
              <li><Link to="#" className="hover:text-white transition-colors">For Schools</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Teacher Toolkit</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Research</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div className="bg-white/5 p-10 rounded-[40px] border border-white/5">
            <h4 className="font-black mb-6 text-accent uppercase tracking-[0.4em] text-xs">Newsletter</h4>
            <p className="text-xs text-gray-500 font-bold leading-relaxed mb-6">Get weekly insights on adaptive learning.</p>
            <div className="flex gap-2">
               <input type="email" placeholder="Email" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs outline-none focus:border-primary transition-all" />
               <button className="bg-primary p-3 rounded-2xl"><ArrowRight size={20} /></button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
           <p>© 2024 EDUXCEL INTELLIGENCE SYSTEMS. CODEBASE: V4.8P</p>
           <div className="flex gap-12">
              <span className="cursor-pointer hover:text-white transition-colors underline decoration-primary decoration-2 underline-offset-8">Privacy Protocol</span>
              <span className="cursor-pointer hover:text-white transition-colors underline decoration-secondary decoration-2 underline-offset-8">User Terms</span>
           </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Landing;

