
import React, { useState, useEffect } from 'react';
import { Target, Brain, ArrowRight, CheckCircle2, AlertCircle, RefreshCcw, TrendingUp, History, Sparkles, Binary, ExternalLink, Link as LinkIcon, Trash2 } from 'lucide-react';
import { calibrateProtocol } from '../geminiService';
import { Prediction } from '../types';

const ReflexiveEngine: React.FC<{ lang: string }> = ({ lang }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [realityInput, setRealityInput] = useState('');
  const [calibratingId, setCalibratingId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);

  // 初始化加载历史预测
  useEffect(() => {
    const saved = localStorage.getItem('polaris_predictions');
    if (saved) {
      setPredictions(JSON.parse(saved));
    } else {
      // 默认示例
      setPredictions([{
        id: 'p1',
        timestamp: '2024-11-20',
        event: 'Trump Tariff Announcement (Proposed)',
        ripples: [
          { order: 1, impact: 'Sudden spike in logistic costs', probability: 0.9 },
          { order: 2, impact: 'Rapid reshoring to Mexico', probability: 0.7 }
        ],
        status: 'PENDING'
      }]);
    }
  }, []);

  // 监听变化并保存
  useEffect(() => {
    if (predictions.length > 0) {
      localStorage.setItem('polaris_predictions', JSON.stringify(predictions));
    }
  }, [predictions]);

  const handleCalibrate = async (pred: Prediction) => {
    if (!realityInput) return;
    setCalibratingId(pred.id);
    setGroundingLinks([]);
    try {
      const response = await calibrateProtocol(pred, realityInput);
      const calibration = response.data;
      setResult(calibration);
      
      if (response.grounding) {
        setGroundingLinks(response.grounding);
      }

      setPredictions(prev => prev.map(p => p.id === pred.id ? { 
        ...p, 
        status: 'VERIFIED', 
        actualOutcome: realityInput,
        calibrationDelta: calibration.calibrationDelta,
        insightExtracted: calibration.cognitiveCrystal.rule
      } : p));
      setRealityInput('');
    } catch (err) {
      console.error(err);
      alert("Calibration failed. Check console for details.");
    } finally {
      setCalibratingId(null);
    }
  };

  const clearPredictions = () => {
    if (confirm("确定要清空推演历史吗？")) {
      setPredictions([]);
      localStorage.removeItem('polaris_predictions');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <RefreshCcw className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Reflexive <span className="text-emerald-400">Hub</span></h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Self-Correcting Cognitive Loop</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
           <button onClick={clearPredictions} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-5 h-5" />
           </button>
           <div className="px-6 py-2 glass rounded-xl border-slate-800 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mean Error Rate</p>
              <p className="text-xl font-black text-emerald-400">12.4%</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" /> Active Predictions
          </h3>
          <div className="space-y-4">
            {predictions.length === 0 && <p className="text-slate-600 italic text-sm p-10 glass rounded-3xl text-center">No active predictions. Go to Ripple Engine to create one.</p>}
            {predictions.map(pred => (
              <div key={pred.id} className={`glass p-8 rounded-[2.5rem] border-slate-800 transition-all ${pred.status === 'VERIFIED' ? 'bg-slate-900/20 shadow-inner' : 'bg-slate-900/40 shadow-xl'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500">{pred.timestamp}</span>
                    <h4 className="text-xl font-bold text-white mt-1">{pred.event}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    pred.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {pred.status}
                  </span>
                </div>

                {pred.status === 'PENDING' ? (
                  <div className="space-y-4 pt-6 border-t border-slate-800/60">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Submit Reality Verification</p>
                    <textarea 
                      placeholder="What actually happened?..."
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 outline-none focus:border-emerald-500/50"
                      value={realityInput}
                      onChange={(e) => setRealityInput(e.target.value)}
                    />
                    <button 
                      onClick={() => handleCalibrate(pred)}
                      disabled={calibratingId === pred.id}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20"
                    >
                      {calibratingId === pred.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCcw className="w-3 h-3 animate-spin" /> Analyzing Logic Gaps...
                        </span>
                      ) : 'Calibrate System'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 pt-6 border-t border-emerald-500/10">
                     <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                        <div>
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Cognitive Crystal</p>
                          <p className="text-xs text-slate-200 mt-1 font-bold">{pred.insightExtracted}</p>
                        </div>
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                           <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Reality Outcome</p>
                           <p className="text-[10px] text-slate-400 italic line-clamp-2">{pred.actualOutcome}</p>
                        </div>
                        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                           <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Error Delta</p>
                           <p className="text-xs font-black text-orange-400">{pred.calibrationDelta}%</p>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass p-8 rounded-[2.5rem] border-slate-800 bg-slate-900/20">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Neural Evolution
              </h3>
              {result ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                     <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Weight Adjustment</p>
                     <p className="text-xs text-slate-400 font-mono">{result.cognitiveCrystal.weightAdjustment}</p>
                  </div>
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                     <p className="text-[10px] font-black text-red-400 uppercase mb-2 flex items-center gap-2">
                       <AlertCircle className="w-3 h-3" /> Bias Correction
                     </p>
                     <p className="text-xs text-slate-400 italic">{result.biasWarning}</p>
                  </div>
                  {/* Grounding Sources - Mandatory as per Gemini API rules */}
                  {groundingLinks.length > 0 && (
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ExternalLink className="w-3 h-3" /> Grounding Sources
                      </p>
                      <div className="space-y-2">
                        {groundingLinks.map((chunk, i) => (
                          chunk.web && (
                            <a 
                              key={i} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[10px] text-blue-400 hover:text-blue-300 transition-colors truncate"
                            >
                              <LinkIcon className="w-2 h-2 shrink-0" />
                              {chunk.web.title || chunk.web.uri}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center opacity-20">
                  <RefreshCcw className="w-12 h-12 mx-auto mb-4 animate-spin-slow text-slate-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Awaiting Verification</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReflexiveEngine;
