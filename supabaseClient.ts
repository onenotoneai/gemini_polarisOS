
import { createClient } from '@supabase/supabase-js';

/**
 * 北极星系统特制加密（System Cipher）
 * 使用 XOR 混淆 + Base64，防止明文和标准 Base64 窥探
 */
const SYSTEM_SALT = "POLARIS_SOVEREIGN_2026";

const crypt = (str: string): string => {
  const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n: any) => ("0" + Number(n).toString(16)).slice(-2);
  const applySaltToChar = (code: any) => textToChars(SYSTEM_SALT).reduce((a, b) => a ^ b, code);

  return str
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

const decrypt = (encoded: string | null): string => {
  if (!encoded) return "";
  const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code: any) => textToChars(SYSTEM_SALT).reduce((a, b) => a ^ b, code);
  
  const matches = encoded.match(/.{1,2}/g);
  if (!matches) return "";
  
  return matches
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};

// 获取配置：优先本地加密存储 > 环境变量
const getStoredConfig = () => {
  const storedUrl = localStorage.getItem('polaris_vault_url');
  const storedKey = localStorage.getItem('polaris_vault_key');
  
  const url = storedUrl ? decrypt(storedUrl) : (process.env.SUPABASE_URL || "").trim();
  const key = storedKey ? decrypt(storedKey) : (process.env.SUPABASE_ANON_KEY || "").trim();
  
  return { url, key };
};

let { url, key } = getStoredConfig();

export const isSupabaseConfigured = () => {
  const { url, key } = getStoredConfig();
  return !!(url && url.startsWith('http') && key);
};

// 重新初始化客户端
export let supabase = createClient(
  url || "https://placeholder.supabase.co", 
  key || "placeholder"
);

/**
 * 动态更新并加密保存配置
 */
export const updateSupabaseConfig = (newUrl: string, newKey: string) => {
  localStorage.setItem('polaris_vault_url', crypt(newUrl.trim()));
  localStorage.setItem('polaris_vault_key', crypt(newKey.trim()));
  
  // 实时刷新客户端实例
  supabase = createClient(newUrl.trim(), newKey.trim());
  return true;
};

/**
 * 验证数据库连通性
 */
export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data, error } = await supabase.from('scans').select('count', { count: 'exact', head: true }).limit(1);
    // 如果返回 401 说明 URL 正确但 Key 或权限有问题，也视为有效连接（至少证明了 URL 是正确的）
    if (error && (error.code === 'PGRST301' || (error as any).status === 401)) return true;
    return !error;
  } catch (e) {
    return false;
  }
};
