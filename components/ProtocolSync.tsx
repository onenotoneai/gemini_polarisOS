
import React, { useState, useEffect } from 'react';
import { Database, Key, Save, CheckCircle2, AlertTriangle, RefreshCw, ShieldCheck, Lock, Eye, EyeOff, Cpu, Wifi, WifiOff } from 'lucide-react';
import { updateSupabaseConfig, isSupabaseConfigured, checkSupabaseConnection } from '../supabaseClient';
import { testApiKeyConnectivity } from '../geminiService';

const ProtocolSync: React.FC<{ lang: string }> = ({ lang }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [aiStatus, setAiStatus] = useState<{testing: boolean, result: string | null, ok: boolean | null}>({testing: false, result: null, ok: null});
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    if (!url.startsWith('http')) {
      setStatus('error');
      setErrorMsg('非法请求：URL 必须以 http/https 开头');
      return;
    }

    setStatus('testing');
    setErrorMsg('');
    
    try {
      updateSupabaseConfig(url, key);
      const isAlive = await checkSupabaseConnection();
      
      if (isAlive) {
        setStatus('success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatus('error');
        setErrorMsg('同步失败：握手超时或鉴权未通过。请检查 URL 与 Key 的匹配性。');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || '内核初始化冲突');
    }
  };

  const runAiDiagnostic = async () => {
    setAiStatus({testing: true, result: null, ok: null});
    const res = await testApiKeyConnectivity();
    setAiStatus({testing: false, result: res.message, ok: res.success});
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3 h-3" /> System Vault Enabled
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">内核配置中心</h2>
        <p className="text-slate-500 text-sm italic">配置将通过 XOR 字节流加密存储。即便物理层面暴露，Key 依然保持主权安全。</p>
      </div>

      <div className="space-y-6">
        {/* Supabase Config Section */}
        <div className="glass p-8 rounded-[2.5rem] border-slate-800 bg-slate-900/40 space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">数据库持久化配置</h3>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
              <span>Supabase Endpoint</span>
              {isSupabaseConfigured() && <span className="text-blue-500 flex items-center gap-1"><Lock className="w-2 h-2" /> Encrypted</span>}
            </label>
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-id.supabase.co"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-200 outline-none focus:border-blue-500/50 transition-all font-mono shadow-inner"
            />
          </div>

          <div className="space-y-3 relative">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
               <span>Sovereign Private Key</span>
               <button onClick={() => setShowKey(!showKey)} className="text-slate-600 hover:text-slate-400 transition-colors">
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
               </button>
            </label>
            <textarea 
              rows={3}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="在此粘贴你的 anon/public key..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs text-slate-400 outline-none focus:border-blue-500/50 transition-all font-mono leading-relaxed resize-none"
              style={!showKey ? { WebkitTextSecurity: 'disc' } as any : {}}
            />
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-400 font-bold leading-normal">{errorMsg}</p>
            </div>
          )}

          <button 
            onClick={handleSave}
            disabled={status === 'testing' || !url || !key}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 group"
          >
            {status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{status === 'testing' ? '正在对齐协议...' : '注入数据库内核'}</span>
          </button>
        </div>

        {/* AI Diagnostics Section */}
        <div className="glass p-8 rounded-[2.5rem] border-slate-800 bg-slate-900/40">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">AI 连通性测试</h3>
              </div>
              <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${aiStatus.ok ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                {aiStatus.ok ? 'Online' : 'Pending'}
              </div>
           </div>

           <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
              <p className="text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-widest">诊断输出:</p>
              <div className="text-[11px] font-mono text-slate-300 break-words leading-relaxed min-h-[40px]">
                {aiStatus.testing ? (
                  <span className="flex items-center gap-2 text-blue-400"><RefreshCw className="w-3 h-3 animate-spin" /> 正在向 Gemini 集群发起握手请求...</span>
                ) : (
                  aiStatus.result || "等待执行诊断程序..."
                )}
              </div>
           </div>

           <button 
            onClick={runAiDiagnostic}
            disabled={aiStatus.testing}
            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              aiStatus.ok === true ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
           >
             {aiStatus.ok ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
             <span>运行 AI 握手诊断</span>
           </button>
           <p className="mt-4 text-[9px] text-slate-600 text-center uppercase tracking-widest font-bold">
             注：若诊断失败，请检查 index.html 中的 API Key。
           </p>
        </div>
      </div>
    </div>
  );
};

export default ProtocolSync;
