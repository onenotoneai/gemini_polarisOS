
import { createClient } from '@supabase/supabase-js';

// 增强的环境变量读取函数：支持多种命名习惯
const findEnv = (key: string): string => {
  const target = key.toUpperCase();
  // 遍历所有可能的 key 名
  const foundKey = Object.keys(process.env || {}).find(k => k.toUpperCase() === target);
  if (foundKey) return (process.env as any)[foundKey] || "";

  // 尝试从 window 或其他注入点获取（如果是前端构建）
  const reactAppKey = `REACT_APP_${target}`;
  const foundReactKey = Object.keys(process.env || {}).find(k => k.toUpperCase() === reactAppKey);
  if (foundReactKey) return (process.env as any)[foundReactKey] || "";

  return "";
};

const rawUrl = "https://lgxmkezepxzxcofadcay.supabase.co";
const rawKey = "sb_publishable_MJZFASuMALHfpwlYYjStYw_CL4Wr3fi";

// 只有当 URL 包含有效的 http 且 Key 存在时才视为配置成功
export const isSupabaseConfigured = !!(rawUrl && rawUrl.startsWith('http') && rawKey);

// 即使配置不正确，也提供一个合规的初始化值，防止底层库崩溃
// 但我们会通过 isSupabaseConfigured 标志位在业务层拦截实际请求
const supabaseUrl = isSupabaseConfigured ? rawUrl : "https://placeholder-project.supabase.co";
const supabaseAnonKey = isSupabaseConfigured ? rawKey : "placeholder-key";

if (!isSupabaseConfigured) {
  console.warn("Polaris OS: Supabase 环境变量缺失或无效。系统将运行在【本地离线模式】。");
  console.log("检测到的配置状况:", { url: !!rawUrl, key: !!rawKey });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
