
import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, Map, Library, BookOpen, LayoutDashboard, Menu, X, 
  User as UserIcon, LogOut, Globe, Activity, RefreshCw, Waves, 
  RefreshCcw, Terminal, AlertTriangle, CheckCircle2, Loader2, Key, Database, Cloud, UserCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import WindowGuard from './components/WindowGuard';
import GameLab from './components/GameLab';
import Roadmap from './components/Roadmap';
import CaseLibrary from './components/CaseLibrary';
import Playbook from './components/Playbook';
import ProtocolSync from './components/ProtocolSync';
import GlobalResonance from './components/GlobalResonance';
import ReflexiveEngine from './components/ReflexiveEngine';
import GoogleAuth from './components/GoogleAuth';
import { User } from './types';
import { translations } from './i18n';

type Tab = 'dashboard' | 'scanner' | 'gamelab' | 'roadmap' | 'library' | 'playbook' | 'sync' | 'resonance' | 'reflexive';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [lang, setLang] = useState('cn');
  const [hasKey, setHasKey] = useState<boolean>(true);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const initSession = async () => {
      try {
        if (!isSupabaseConfigured) throw new Error("No config");
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const u = session.user;
          setUser({
            id: u.id,
            name: u.user_metadata.full_name || u.email?.split('@')[0] || 'Unknown User',
            email: u.email || '',
            picture: u.user_metadata.avatar_url || '',
            role: 'Executive'
          });
        } else {
          setGuestUser();
        }
      } catch (err) {
        setGuestUser();
      } finally {
        setSessionLoading(false);
      }
    };

    const setGuestUser = () => {
      setUser({
        id: 'guest_user_local',
        name: 'Guest Strategist',
        email: 'guest@polaris.local',
        picture: '',
        role: 'Visitor'
      });
    };

    initSession();
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser({ id: 'guest_user_local', name: 'Guest Strategist', email: 'guest@polaris.local', picture: '', role: 'Visitor' });
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: t.dashboard, icon: LayoutDashboard },
    { id: 'scanner' as Tab, label: t.scanner, icon: Shield },
    { id: 'resonance' as Tab, label: t.resonance || "Ripple Engine", icon: Waves },
    { id: 'reflexive' as Tab, label: t.reflexive || "Reflexive Hub", icon: RefreshCcw },
    { id: 'gamelab' as Tab, label: t.gamelab, icon: Zap },
    { id: 'roadmap' as Tab, label: t.roadmap, icon: Map },
    { id: 'library' as Tab, label: t.library, icon: Library },
    { id: 'playbook' as Tab, label: t.playbook, icon: BookOpen },
    { id: 'sync' as Tab, label: t.sync, icon: RefreshCw },
  ];

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Initializing Lattice Session...</p>
      </div>
    );
  }

  const isGuest = user?.id === 'guest_user_local';

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-slate-800/60 transition-transform duration-500 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#2563eb] to-[#4f46e5] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-blue-400/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">Polaris <span className="text-blue-500">OS</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Sovereign OS v3.0</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    activeTab === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-32 left-8 right-8">
           <div className={`p-4 glass rounded-2xl border-slate-800/60 ${isSupabaseConfigured ? 'bg-emerald-900/10' : 'bg-slate-900/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                   <Database className="w-2 h-2" /> 数据库状态
                </span>
                <span className={`flex h-1.5 w-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isSupabaseConfigured ? (isGuest ? 'Cloud Ready (Offline Mode)' : 'Cloud Active') : 'No Database Configured'}
              </p>
           </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="p-4 glass rounded-[1.5rem] border-slate-800/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0">
                {user?.picture ? <img src={user.picture} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user?.role}</p>
              </div>
              {!isGuest && <LogOut className="w-4 h-4 text-slate-600 hover:text-red-400 cursor-pointer" onClick={handleLogout} />}
            </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 glass border-b border-slate-800/60 flex items-center justify-between px-10 shrink-0 relative z-20">
          <div className="flex items-center space-x-6">
             <div className={`flex items-center px-4 py-1.5 ${hasKey ? 'bg-emerald-500/5 text-emerald-500' : 'bg-red-500/5 text-red-500'} border rounded-full text-[10px] font-black uppercase tracking-widest`}>
               {hasKey ? t.status : "引擎配置异常"}
             </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border-slate-700/50">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-[10px] font-black text-slate-400 uppercase outline-none">
                <option value="cn">中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="relative z-10 max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-10 animate-in fade-in duration-700">
                <div className="glass p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border-slate-800/60">
                   <h2 className="text-4xl font-black text-white mb-4">Hello, {user?.name.split(' ')[0]}</h2>
                   <p className="text-slate-400 text-lg">系统已进入主权模式。所有核心功能已解锁。</p>
                   <div className="flex gap-4 mt-8">
                     <button onClick={() => setActiveTab('scanner')} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">开启结构扫描</button>
                     {isGuest && <button onClick={() => setActiveTab('sync')} className="px-8 py-3 glass hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">云端登录</button>}
                   </div>
                </div>
              </div>
            )}
            {activeTab === 'scanner' && <WindowGuard lang={lang} />}
            {activeTab === 'resonance' && <GlobalResonance lang={lang} />}
            {activeTab === 'reflexive' && <ReflexiveEngine lang={lang} />}
            {activeTab === 'gamelab' && <GameLab lang={lang} />}
            {activeTab === 'roadmap' && <Roadmap lang={lang} />}
            {activeTab === 'library' && <CaseLibrary lang={lang} />}
            {activeTab === 'playbook' && <Playbook lang={lang} />}
            {activeTab === 'sync' && (
              <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in">
                 {isGuest ? <GoogleAuth onLogin={setUser} /> : <ProtocolSync lang={lang} />}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
