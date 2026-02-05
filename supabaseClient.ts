
import { createClient } from '@supabase/supabase-js';

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

const getStoredConfig = () => {
  const storedUrl = localStorage.getItem('polaris_vault_url');
  const storedKey = localStorage.getItem('polaris_vault_key');
  
  const url = storedUrl ? decrypt(storedUrl) : (typeof process !== 'undefined' ? process.env.SUPABASE_URL : (window as any).SUPABASE_URL) || "";
  const key = storedKey ? decrypt(storedKey) : (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : (window as any).SUPABASE_ANON_KEY) || "";
  
  return { 
    url: url?.trim() || "", 
    key: key?.trim() || "" 
  };
};

export const isSupabaseConfigured = () => {
  const { url, key } = getStoredConfig();
  return !!(url && url.startsWith('http') && key);
};

let config = getStoredConfig();

export let supabase = createClient(
  config.url || "https://placeholder.supabase.co", 
  config.key || "placeholder"
);

export const updateSupabaseConfig = (newUrl: string, newKey: string) => {
  localStorage.setItem('polaris_vault_url', crypt(newUrl.trim()));
  localStorage.setItem('polaris_vault_key', crypt(newKey.trim()));
  supabase = createClient(newUrl.trim(), newKey.trim());
  return true;
};

export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('scans').select('count', { count: 'exact', head: true }).limit(1);
    if (error && (error.code === 'PGRST301' || (error as any).status === 401)) return true;
    return !error;
  } catch (e) {
    return false;
  }
};
