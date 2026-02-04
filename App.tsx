
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
import { testApiKeyConnectivity } from './geminiService';
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
        if (!isSupabaseConfigured) {
          throw new Error("No config");
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
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
          // 如果没有登录，设置一个访客身份
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

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
    // 登出后重置为访客状态
    setUser({
      id: 'guest_user_local',
      name: 'Guest Strategist',
      email: 'guest@polaris.local',
      picture: '',
      role: 'Visitor'
    });
  };

  const handleConnectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasKey(true);
    }
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

  // user 永远不为 null，因为会自动回退到 guest
  const isGuest = user?.id === 'guest_user_local';

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      {/* Sidebar */}
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
                    activeTab === item.id 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]' 
                    : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span className="tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-32 left-8 right-8 cursor-pointer group">
           <div className={`p-4 glass rounded-2xl border-slate-800/60 transition-colors ${isSupabaseConfigured && !isGuest ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-slate-900/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                   <Cloud className="w-2 h-2" /> 云端状态
                </span>
                <span className={`flex h-1.5 w-1.5 rounded-full ${isSupabaseConfigured && !isGuest ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isSupabaseConfigured ? (isGuest ? 'Config Ready (Auth Needed)' : 'Cloud Persistence Active') : 'Local Storage Mode'}
              </p>
           </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          {isGuest ? (
            <div 
              onClick={() => setActiveTab('sync')} // 访客点击此处去尝试登录（借用 sync 标签或弹窗）
              className="p-4 glass rounded-[1.5rem] border-blue-500/20 bg-blue-500/5 flex items-center gap-4 cursor-pointer hover:bg-blue-500/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full border border-blue-500/30 flex items-center justify-center bg-slate-900 text-blue-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">Sign In</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enable Sync</p>
              </div>
            </div>
          ) : (
            <div className="p-4 glass rounded-[1.5rem] border-slate-800/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0">
                {user?.picture ? <img src={user.picture} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user?.role}</p>
              </div>
              <LogOut className="w-4 h-4 text-slate-600 hover:text-red-400 cursor-pointer transition-colors" onClick={handleLogout} />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 glass border-b border-slate-800/60 flex items-center justify-between px-10 shrink-0 relative z-20">
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center space-x-6">
             <div className={`flex items-center px-4 py-1.5 ${hasKey ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'} border rounded-full text-[10px] font-black uppercase tracking-widest`}>
               <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-red-500'} mr-2 animate-pulse`} />
               {hasKey ? t.status : "引擎配置异常"}
             </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border-slate-700/50">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-[10px] font-black text-slate-400 uppercase outline-none cursor-pointer">
                <option value="cn">中文</option>
                <option value="en">English</option>
                <option value="jp">日本語</option>
              </select>
            </div>
            {!hasKey && (
              <button onClick={handleConnectKey} className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 animate-pulse">
                <Key className="w-4 h-4" />
                <span>连接有效 API Key</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-10 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: t.riskIndices, value: '14', change: 'Live', icon: Shield, color: 'text-blue-400' },
                    { label: t.powerNodes, value: '42', change: 'Active', icon: Zap, color: 'text-[#d4af37]' },
                    { label: t.protocolIntegrity, value: hasKey ? '98%' : '0%', change: hasKey ? 'Nominal' : 'Config Error', icon: RefreshCw, color: hasKey ? 'text-emerald-400' : 'text-red-400' },
                    { label: t.evolutionProgress, value: '35%', change: '+1.2%', icon: Map, color: 'text-purple-400' },
                  ].map((stat, i) => (
                    <div key={i} className="glass p-8 rounded-[2rem] border-slate-800/60 hover:border-slate-700 transition-all group hover:bg-slate-800/30">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl bg-slate-900 group-hover:bg-slate-800 transition-all ${stat.color} border border-slate-800`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black tracking-widest px-3 py-1 bg-slate-950/80 rounded-full text-slate-500 border border-slate-800">{stat.change}</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                      <p className="text-4xl font-black mt-2 tracking-tighter text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 space-y-10">
                      <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden bg-gradient-to-br from-indigo-600/10 via-slate-900/40 to-transparent border-slate-800/60 group">
                        <div className="relative z-10 space-y-6">
                          <div className="flex items-center gap-3">
                            <Cloud className="w-5 h-5 text-blue-400 animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Sovereign Data Storage v1.0</span>
                          </div>
                          <h2 className="text-4xl font-black tracking-tighter text-white">Intelligence, <span className="text-blue-500">Decentralized.</span></h2>
                          <p className="text-slate-400 max-w-lg text-lg leading-relaxed">
                            {isSupabaseConfigured ? '检测到 Supabase 云端配置。登录后即可同步你的战略数据。' : '当前运行在本地模式。设置环境变量以启用云端同步。'}
                          </p>
                          <div className="flex gap-4">
                            <button onClick={() => setActiveTab('scanner')} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/30">开始扫描</button>
                            {isGuest && isSupabaseConfigured && (
                               <button onClick={() => setActiveTab('sync')} className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest transition-all">登录云端</button>
                            )}
                          </div>
                        </div>
                        <Database className="absolute -right-20 -bottom-20 w-80 h-80 text-blue-500/5 -rotate-12 group-hover:text-blue-500/10 transition-colors" />
                      </div>
                   </div>
                   <div className="glass p-10 rounded-[2.5rem] border-slate-800 bg-slate-900/20">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8">{t.hazardsTitle}</h3>
                      <div className="space-y-6">
                        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-start gap-4">
                          <Shield className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                          <div>
                            <p className="text-sm font-black text-red-400 uppercase tracking-tight">{t.sovereigntyWarning}</p>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t.hazardDesc1}</p>
                          </div>
                        </div>
                      </div>
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
                 {!user || isGuest ? (
                   <GoogleAuth onLogin={setUser} />
                 ) : (
                   <ProtocolSync lang={lang} />
                 )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
