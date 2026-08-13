import React, { useState, useEffect } from 'react';
import { LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface NavItem {
  tab: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface DashboardLayoutProps {
  panelTitle: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  topBarRight?: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  onBack?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  panelTitle,
  navItems,
  activeTab,
  onTabChange,
  onLogout,
  children,
  topBarRight,
  pageTitle,
  pageSubtitle,
  onBack,
}) => {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setShowSidebar(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen relative bg-gray-50 overflow-hidden">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: showSidebar ? 0 : -280, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
        className="fixed lg:relative left-0 z-50 top-0 h-full w-[280px] bg-primary border-r border-primary/20 shadow-xl lg:shadow-none flex flex-col"
      >
        <div className="p-6 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mt-8"
          >
            <Logo size="sm" className="brightness-200 contrast-200" />
            <h1 className="text-lg font-semibold text-white leading-tight">{panelTitle}</h1>
          </motion.div>
        </div>

        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = activeTab === item.tab;
            return (
              <motion.div
                key={item.tab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <button
                  onClick={() => {
                    onTabChange(item.tab);
                    if (window.innerWidth < 1024) setShowSidebar(false);
                  }}
                  className={`group relative w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dashboardActiveNav"
                      className="absolute inset-0 bg-gradient-to-r from-[#6AA5FF] to-[#3B82F6] rounded-xl -z-10 shadow-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon
                    size={20}
                    className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 flex-shrink-0"
        >
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 py-3 px-4 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group cursor-pointer"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Mobile close button */}
      <AnimatePresence>
        {showSidebar && window.innerWidth < 1024 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowSidebar(false)}
            className="fixed top-4 z-[60] right-4 lg:hidden p-2 bg-white hover:bg-gray-50 rounded-full shadow-lg"
          >
            <X size={20} className="text-gray-700" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className={`w-full transition-all duration-300 ${showSidebar ? 'lg:w-[calc(100%-280px)]' : 'lg:w-full'} bg-gray-50 h-screen overflow-auto flex flex-col`}>

        {/* Single unified top bar */}
        <div className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm shrink-0 h-[64px] gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Hamburger — mobile only */}
            {!showSidebar && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <Menu size={22} className="text-gray-700" />
              </motion.button>
            )}

            {/* Back button */}
            <AnimatePresence mode="wait">
              {onBack && (
                <motion.button
                  key="back"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onClick={onBack}
                  className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-primary transition-colors shrink-0"
                >
                  <ChevronLeft size={18} /> Back
                </motion.button>
              )}
            </AnimatePresence>

            {/* Divider + page title */}
            {(pageTitle || pageSubtitle) && (
              <div className={`min-w-0 ${onBack ? 'border-l border-gray-200 pl-3' : ''}`}>
                {pageTitle && <h2 className="text-base font-black text-gray-800 truncate leading-tight">{pageTitle}</h2>}
                {pageSubtitle && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">{pageSubtitle}</p>}
              </div>
            )}
          </div>

          {topBarRight && <div className="flex items-center gap-3 shrink-0">{topBarRight}</div>}
        </div>

        {/* Page content */}
        <motion.div
          className="flex-1 overflow-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardLayout;
