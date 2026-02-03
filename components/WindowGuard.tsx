
import React, { useState, useEffect } from 'react';
import { analyzeRisk } from '../geminiService';
import { supabase } from '../supabaseClient';
import { Shield, AlertTriangle, CheckCircle, Loader2, ArrowRight, Zap, History, Trash2, Cloud } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { translations } from '../i18n';

const WindowGuard: React.FC<{ lang: string }> = ({ lang }) => {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const t = translations[lang] || translations.en;

  // 从 Supabase 加载历史记录
  const fetchHistory = async () => {
    setFetching(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Supabase fetch error:", error);
    } else if (data) {
      setHistory(data);
      if (!result && data.length > 0) setResult(data[0]);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleScan = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeRisk(scenario);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not found");

      const newScanRecord = {
        user_id: user.id,
        scenario: scenario,
        axes: data.axes,
        risk_level: data.riskLevel,
        summary: data.summary,
        recommendations: data.recommendations
      };

      // 写入 Supabase
      const { data: savedData, error } = await supabase
        .from('scans')
        .insert([newScanRecord])
        .select()
        .single();

      if (error) throw error;

      setResult(savedData);
      setHistory(prev => [savedData, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Scan/Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm("确定要永久删除云端所有扫描记忆吗？")) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('user_id', user.id);

      if (!error) {
        setHistory([]);
        setResult(null);
      }
    }
  };

  const radarData = result ? [
    { subject: t.chronicDegradation.split(' ')[0], A: result.axes.chronicDegradation, full: 100 },
    { subject: t.irreversibleInflection.split(' ')[0], A: result.axes.irreversibleInflection, full: 100 },
    { subject: t.judgmentSovereignty.split(' ')[0], A: result.axes.judgmentSovereignty, full: 100 },
  ] : [];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return '';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 glass rounded-2xl bg-blue-600/10">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">{t.scanner}</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
               WindowGuard v3.0 • <Cloud className="w-3 h-3 text-emerald-500" /> Supabase Cloud Sync Active
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest">
            <Trash2 className="w-4 h-4" /> 清空云端数据
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl border-slate-800 bg-slate-900/40 relative overflow-hidden group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t.inputLabel}</label>
            <textarea
              className="w-full h-40 bg-slate-950/50 border border-slate-800 rounded-2xl p-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-200 placeholder:text-slate-700 text-lg leading-relaxed"
              placeholder={t.inputPlaceholder}
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            />
            <button
              onClick={handleScan}
              disabled={loading || !scenario}
              className="mt-6 flex items-center justify-center space-x-3 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Shield className="w-5 h-5" /> <span>{t.executeScan}</span></>}
            </button>
          </div>

          {result && (
            <div className="glass p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-emerald-400" /> {t.cognitiveVerdict}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest flex items-center gap-2">
                       <Cloud className="w-2.5 h-2.5" /> 云端同步于: {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getRiskColor(result.risk_level)}`}>
                    {result.risk_level} {t.riskLevel}
                  </div>
               </div>
               
               <p className="text-slate-300 text-lg leading-relaxed mb-10 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">{result.summary}</p>
               
               <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" /> {t.operationalProtocol}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex gap-4 items-start group hover:border-blue-500/30 transition-colors">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{rec}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl flex flex-col items-center bg-slate-900/40 min-h-[400px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">{t.entropyChart}</h3>
            {result ? (
              <div className="w-full h-64 scale-110">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                    <Radar name="Scan" dataKey="A" stroke="#d4af37" fill="#d4af37" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center space-y-4 py-20 opacity-20">
                <Shield className="w-16 h-16 mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Pulse</p>
              </div>
            )}

            <div className="w-full mt-10 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <History className="w-3 h-3" /> 最近云端分析
                </h4>
                {fetching && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
              </div>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <button 
                    key={h.id || i} 
                    onClick={() => setResult(h)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${result?.id === h.id ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <p className="text-[10px] font-bold truncate">{h.scenario}</p>
                    <p className="text-[8px] mt-1 uppercase tracking-widest opacity-60">{new Date(h.timestamp).toLocaleDateString()} • {h.risk_level}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindowGuard;
