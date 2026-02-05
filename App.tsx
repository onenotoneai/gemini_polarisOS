
import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, Map, Library, BookOpen, LayoutDashboard, Menu, X, 
  User as UserIcon, LogOut, Globe, Activity, RefreshCw, Waves, 
  RefreshCcw, Terminal, AlertTriangle, CheckCircle2, Loader2, Key, Database, Cloud, UserCheck, Settings, Server, Cpu
} from 'lucide-react';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from './supabaseClient.ts';
import WindowGuard from './components/WindowGuard.tsx';
import GameLab from './components/GameLab.tsx';
import Roadmap from './components/Roadmap.tsx';
import CaseLibrary from './components/CaseLibrary.tsx';
import Playbook from './components/Playbook.tsx';
import ProtocolSync from './components/ProtocolSync.tsx';
import GlobalResonance from './components/GlobalResonance.tsx';
import ReflexiveEngine from './components/ReflexiveEngine.tsx';
import { User } from './types.ts';
import { translations } from './i18n.ts';

type Tab = 'dashboard' | 'scanner' | 'gamelab' | 'roadmap' | 'library' | 'playbook' | 'sync' | 'resonance' | 'reflexive';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isDbAlive, setIsDbAlive] = useState(false);
  const [lang, setLang] = useState('cn');
  const [nodeAddress, setNodeAddress] = useState('LOCAL_HOST');
  
  const t = translations[lang] || translations.en;

  useEffect(() => {
    const initApp = async () => {
      if (window.location.hostname.includes('myqcloud.com')) {
        setNodeAddress(`COS_NODE_${window.location.hostname.split('.')[0].toUpperCase()}`);
      } else {
        setNodeAddress(window.location.hostname.toUpperCase());
      }

      try {
        const alive = await checkSupabaseConnection();
        setIsDbAlive(alive);
      } catch (err) {
        setIsDbAlive(false);
      } finally {
        setSessionLoading(false);
      }
    };
    initApp();
  }, []);

  const navItems = [
    { id: 'dashboard' as Tab, label: t.dashboard, icon: LayoutDashboard },
    { id: 'scanner' as Tab, label: t.scanner, icon: Shield },
    { id: 'resonance' as Tab, label: t.resonance || "Ripple Engine", icon: Waves },
    { id: 'reflexive' as Tab, label: t.reflexive || "Reflexive Hub", icon: RefreshCcw },
    { id: 'gamelab' as Tab, label: t.gamelab, icon: Zap },
    { id: 'roadmap' as Tab, label: t.roadmap, icon: Map },
    { id: 'library' as Tab, label: t.library, icon: Library },
    { id: 'playbook' as Tab, label: t.playbook, icon: BookOpen },
    { id: 'sync' as Tab, label: '系统设置', icon: Settings },
  ];

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Booting Sovereign Kernel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-slate-800/60 transition-transform duration-500 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#2563eb] to-[#4f46e5] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-blue-400/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">Polaris <span className="text-blue-500">OS</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Sovereign OS v3.0</p>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-4 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 space-y-4">
            <div className={`p-4 glass rounded-2xl border-slate-800/60 ${isDbAlive ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-950/10 border-red-500/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                   <Database className="w-2 h-2" /> 云端状态
                </span>
                <span className={`flex h-1.5 w-1.5 rounded-full ${isDbAlive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isDbAlive ? 'Cloud Persistent' : 'Local Sandbox Mode'}
              </p>
            </div>

            <div className="p-4 glass rounded-[1.5rem] border-slate-800/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">Administrator</p>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Master Auth Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 glass border-b border-slate-800/60 flex items-center justify-between px-10 shrink-0 relative z-20">
          <div className="flex items-center space-x-6">
             <div className="flex items-center px-4 py-1.5 bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 rounded-full text-[10px] font-black uppercase tracking-widest">
               <Server className="w-3 h-3 mr-2" /> Node: {nodeAddress}
             </div>
             {!isDbAlive && (
               <div className="flex items-center px-4 py-1.5 bg-amber-500/5 text-amber-500 border border-amber-500/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                 <AlertTriangle className="w-3 h-3 mr-2" /> 数据库未连接
               </div>
             )}
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
                <div className="glass p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border-slate-800/60 relative overflow-hidden">
                   <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">
                      <Cpu className="w-3 h-3" /> Core Kernel v3.0.4-LTS
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">Master Session Active</h2>
                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                      欢迎使用北极星操作系统。云端存储状态：<span className={isDbAlive ? "text-emerald-400" : "text-amber-400"}>{isDbAlive ? "已同步 (Cloud)" : "仅离线模式 (Local)"}</span>。
                      所有决策推演模块已在节点 <span className="text-blue-400 font-mono">{nodeAddress}</span> 就绪。
                    </p>
                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setActiveTab('scanner')} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20">开始战略扫描</button>
                      <button onClick={() => setActiveTab('sync')} className="px-8 py-3 glass hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">内核/数据库设置</button>
                    </div>
                   </div>
                   <Shield className="absolute -right-20 -bottom-20 w-80 h-80 text-white/5 -rotate-12" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="glass p-6 rounded-3xl border-slate-800/60">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">部署架构</p>
                      <p className="text-lg font-bold text-white">Sovereign Static Node</p>
                   </div>
                   <div className="glass p-6 rounded-3xl border-slate-800/60">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">当前算力</p>
                      <p className="text-lg font-bold text-white">Gemini 3 Pro + D3.js</p>
                   </div>
                   <div className="glass p-6 rounded-3xl border-slate-800/60">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">数据主权</p>
                      <p className="text-lg font-bold text-white">{isDbAlive ? "Supabase Vault" : "Browser LocalStorage"}</p>
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
            {activeTab === 'sync' && <ProtocolSync lang={lang} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
