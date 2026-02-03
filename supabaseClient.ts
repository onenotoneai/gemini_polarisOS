
import { createClient } from '@supabase/supabase-js';

// 尝试从多个可能的路径获取环境变量
const rawUrl = process.env.SUPABASE_URL || (process.env as any).REACT_APP_SUPABASE_URL || "";
const rawKey = process.env.SUPABASE_ANON_KEY || (process.env as any).REACT_APP_SUPABASE_ANON_KEY || "";

// 核心修复：supabase-js 要求初始化时必须有有效的字符串格式
// 如果环境变量缺失，我们提供一个符合格式的占位符，防止应用在启动阶段崩溃
const supabaseUrl = rawUrl.trim() || "https://placeholder-project.supabase.co";
const supabaseAnonKey = rawKey.trim() || "placeholder-key";

if (!rawUrl || !rawKey) {
  console.warn(
    "北极星系统警告: 检测到 Supabase 配置缺失。\n" +
    "请在部署平台（如 Netlify）的环境变量中设置 SUPABASE_URL 和 SUPABASE_ANON_KEY。\n" +
    "当前将以‘离线模式’运行，云端同步功能将不可用。"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
