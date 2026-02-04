
import { createClient } from '@supabase/supabase-js';

/**
 * 调试建议：
 * 如果你在 Netlify 变量里设置了，这里会自动读取。
 * 如果你想 hardcode 测试，直接把下面两个变量的值改成字符串。
 */
const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || "").trim();

// 验证配置是否有效
export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn("Polaris OS: 数据库未配置。系统将运行在【本地存储模式】。");
} else {
  console.log("Polaris OS: 云端配置已就绪。");
}

// 初始化客户端
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseAnonKey || "placeholder"
);
