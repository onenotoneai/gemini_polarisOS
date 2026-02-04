
import { createClient } from '@supabase/supabase-js';

/**
 * 极简混淆工具：Base64 编码/解码
 * 防止肉眼直接在 localStorage 看到敏感 Key
 */
const encode = (str: string) => {
  try { return btoa(encodeURIComponent(str)); } catch(e) { return str; }
};

const decode = (str: string | null) => {
  if (!str) return "";
  try { return decodeURIComponent(atob(str)); } catch(e) { return str; }
};

// 获取配置：优先本地存储(混淆) > 环境变量(明文)
const getStoredConfig = () => {
  const storedUrl = localStorage.getItem('polaris_db_url_v2');
  const storedKey = localStorage.getItem('polaris_db_key_v2');
  
  const url = storedUrl ? decode(storedUrl) : (process.env.SUPABASE_URL || "").trim();
  const key = storedKey ? decode(storedKey) : (process.env.SUPABASE_ANON_KEY || "").trim();
  
  return { url, key };
};

let { url, key } = getStoredConfig();

// 验证配置是否有效
export const isSupabaseConfigured = () => {
  const { url, key } = getStoredConfig();
  return !!(url && url.startsWith('http') && key);
};

// 导出一个可随时更新的客户端实例
export let supabase = createClient(
  url || "https://placeholder.supabase.co", 
  key || "placeholder"
);

/**
 * 动态更新配置并掩码保存
 */
export const updateSupabaseConfig = (newUrl: string, newKey: string) => {
  localStorage.setItem('polaris_db_url_v2', encode(newUrl.trim()));
  localStorage.setItem('polaris_db_key_v2', encode(newKey.trim()));
  
  // 重新初始化客户端
  supabase = createClient(newUrl.trim(), newKey.trim());
  return true;
};

/**
 * 检查数据库连接状态
 */
export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) return false;
  try {
    // 探测 scans 表
    const { data, error } = await supabase.from('scans').select('count', { count: 'exact', head: true }).limit(1);
    
    // 如果返回 401/403 通常也说明 URL 是通的，只是鉴权没过，但这足以证明网络连通性
    // Fix: Cast error to any to access status property which is not on PostgrestError type
    if (error && (error.code === 'PGRST301' || (error as any).status === 401)) return true;
    
    return !error;
  } catch (e) {
    return false;
  }
};
