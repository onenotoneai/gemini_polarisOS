
import React, { useState } from 'react';
import { Database, Key, Save, CheckCircle2, AlertTriangle, RefreshCw, Server, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { updateSupabaseConfig, isSupabaseConfigured, checkSupabaseConnection } from '../supabaseClient';

const ProtocolSync: React.FC<{ lang: string }> = ({ lang }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
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
        // 延迟刷新以确保状态持久化
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

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3 h-3" /> System Vault Enabled
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">内核配置中心</h2>
        <p className="text-slate-500 text-sm italic">配置将通过 XOR 字节流加密存储。即便物理层面暴露，Key 依然保持主权安全。</p>
      </div>

      <div className="glass p-8 rounded-[2.5rem] border-slate-800 bg-slate-900/40 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-2"><Database className="w-3 h-3" /> Supabase Endpoint</span>
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
             <span className="flex items-center gap-2"><Key className="w-3 h-3" /> Sovereign Private Key</span>
             <button onClick={() => setShowKey(!showKey)} className="text-slate-600 hover:text-slate-400 transition-colors">
                {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
             </button>
          </label>
          {/* Fix: removed invalid 'type' prop from textarea. Used style with WebkitTextSecurity for masking password characters. */}
          <textarea 
            rows={4}
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

        {status === 'success' && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">认证通过，正在重启主权内核...</p>
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={status === 'testing' || !url || !key}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 group"
        >
          {status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
          <span>{status === 'testing' ? '正在执行握手协议...' : '保存并注入内核'}</span>
        </button>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 text-[8px] font-black text-slate-600 uppercase">
             Algorithm: XOR-System-Cipher
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 text-[8px] font-black text-slate-600 uppercase">
             Storage: Local Vault
          </div>
        </div>
        <p className="text-[9px] text-slate-700 text-center max-w-sm leading-relaxed uppercase tracking-widest font-bold">
          Polaris OS 不会向第三方服务器发送您的密钥，一切处理仅在本地浏览器沙箱内完成。
        </p>
      </div>
    </div>
  );
};

export default ProtocolSync;
