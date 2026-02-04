
import React, { useState } from 'react';
import { Database, Key, Save, CheckCircle2, AlertTriangle, RefreshCw, Server, Lock } from 'lucide-react';
import { updateSupabaseConfig, isSupabaseConfigured, checkSupabaseConnection } from '../supabaseClient';

const ProtocolSync: React.FC<{ lang: string }> = ({ lang }) => {
  // 逻辑：读取时仍通过逻辑层获取解码后的值
  const [url, setUrl] = useState(localStorage.getItem('polaris_db_url_v2') ? "" : ""); 
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    if (!url.startsWith('http')) {
      setStatus('error');
      setErrorMsg('URL 必须以 http 或 https 开头');
      return;
    }

    setStatus('testing');
    setErrorMsg('');
    
    try {
      updateSupabaseConfig(url, key);
      const isAlive = await checkSupabaseConnection();
      
      if (isAlive) {
        setStatus('success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setStatus('error');
        setErrorMsg('无法建立连接。请检查：1. URL和Key是否匹配；2. 数据库是否允许当前域名的跨域访问 (CORS)。');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || '配置过程中发生未知错误');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">
          <Server className="w-3 h-3" /> System Kernel Config
        </div>
        <h2 className="text-3xl font-black text-white mb-2">内核参数配置</h2>
        <p className="text-slate-500 text-sm italic">数据将经过 Base64 掩码处理后保存在本地缓存，系统不会在代码中明文存储。 </p>
      </div>

      <div className="glass p-8 rounded-[2rem] border-slate-800 bg-slate-900/40 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-2"><Database className="w-3 h-3" /> Supabase URL</span>
            {url && <span className="text-emerald-500 flex items-center gap-1"><Lock className="w-2 h-2" /> Masked</span>}
          </label>
          <input 
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xxx.supabase.co"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 transition-all font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
             <span className="flex items-center gap-2"><Key className="w-3 h-3" /> Anon / Public Key</span>
             {key && <span className="text-emerald-500 flex items-center gap-1"><Lock className="w-2 h-2" /> Masked</span>}
          </label>
          <textarea 
            rows={3}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="在此粘贴你的 anon/public key..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 outline-none focus:border-blue-500/50 transition-all font-mono leading-relaxed"
          />
        </div>

        {status === 'error' && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-400 font-medium leading-normal">{errorMsg}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">认证通过，主权已移交...</p>
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={status === 'testing' || !url || !key}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          {status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{status === 'testing' ? '正在注入内核...' : '更新系统主权配置'}</span>
        </button>
      </div>

      <div className="mt-8 p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> 注意事项
        </h4>
        <ul className="text-[10px] text-slate-500 space-y-1 list-disc list-inside leading-relaxed">
          <li>确保你的 Supabase 项目已开启针对当前域名的 <b>CORS</b> 访问。</li>
          <li>推荐使用 <b>Anon Key</b> 而非 Service Role Key 以确保前端安全。</li>
          <li>如果配置后依然显示“离线”，请检查数据库中是否存在名为 <b>scans</b> 的表。</li>
        </ul>
      </div>
    </div>
  );
};

export default ProtocolSync;
