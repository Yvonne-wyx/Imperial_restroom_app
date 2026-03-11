'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Mail, 
  Lock, 
  User, 
  LogOut, 
  KeyRound, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'signin' | 'signup' | 'verify'>('signin');
  
  // 表单状态
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  // 1. 初始化检查登录状态
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }
    getSession();

    // 实时监听 Auth 状态变化（如登录、登出）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setView('signin'); // 登录后重置视图状态
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 注册逻辑 (Sign Up)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 提醒：请确保在 Supabase Auth -> Providers -> Email 中开启了功能
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        // 注册时顺便把 email 存入我们刚才建的 profiles 表
        data: {
          full_name: email.split('@')[0],
        }
      }
    });

    if (error) {
      alert("Sign up error: " + error.message);
    } else {
      setMessage('A 6-digit OTP has been sent to your email.');
      setView('verify');
    }
    setLoading(false);
  };

  // 3. 验证 OTP 逻辑 (Verify)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ 
      email, 
      token: otp, 
      type: 'signup' 
    });

    if (error) {
      alert("Verification failed: " + error.message);
    } else {
      alert("Success! You can now sign in.");
      setView('signin');
    }
    setLoading(false);
  };

  // 4. 登录逻辑 (Sign In)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("Sign in error: " + error.message);
    }
    setLoading(false);
  };

  // 5. 登出逻辑 (Sign Out)
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 全屏加载动画
  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a1b5d]" />
        <p className="text-xs text-gray-400 mt-4">Connecting to Imperial Auth...</p>
      </div>
    );
  }

  // --- 场景 A：已登录界面 (Profile Dashboard) ---
  if (user) {
    return (
      <div className="flex flex-col p-6 space-y-8 animate-in fade-in duration-500 bg-white min-h-screen">
        {/* 个人资料卡片 */}
        <div className="flex flex-col items-center py-10 bg-[#1a1b5d] rounded-[40px] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-indigo-300 rounded-full border-4 border-white/20 mb-4 overflow-hidden shadow-inner">
             <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}&backgroundColor=b6e3f4`} alt="avatar" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{user.email?.split('@')[0]}</h2>
          <div className="flex items-center mt-2 space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Verified Student</span>
          </div>
        </div>

        {/* 账户设置区域 */}
        <div className="space-y-6">
          <h3 className="text-[#1a1b5d] font-black text-xs px-2 uppercase tracking-[0.2em] opacity-50">Account Information</h3>
          
          <div className="bg-[#f8f9fc] rounded-3xl p-6 space-y-5 border border-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Mail className="w-4 h-4 text-[#1a1b5d]" /></div>
                <span className="text-gray-500 text-sm">Email</span>
              </div>
              <span className="font-bold text-[#1a1b5d] text-sm">{user.email}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-100 pt-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Building2 className="w-4 h-4 text-[#1a1b5d]" /></div>
                <span className="text-gray-500 text-sm">Main Campus</span>
              </div>
              <span className="font-bold text-[#1a1b5d] text-sm">South Kensington</span>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-3 text-red-500 font-black py-5 rounded-[24px] bg-red-50 hover:bg-red-100 transition-all active:scale-95 mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // --- 场景 B：未登录界面 (Auth Forms) ---
  return (
    <div className="flex flex-col p-8 space-y-10 min-h-screen bg-white">
      <div className="space-y-3 pt-10">
        <div className="w-12 h-12 bg-[#1a1b5d] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6">
          <Lock className="text-white w-6 h-6" />
        </div>
        <h1 className="text-4xl font-black text-[#1a1b5d] tracking-tighter">
          {view === 'signin' ? 'Welcome Back.' : view === 'signup' ? 'Create Account.' : 'Verify Email.'}
        </h1>
        <p className="text-gray-400 text-sm font-medium leading-relaxed">
          {view === 'signin' ? 'Sign in to access your smart restroom plans and history.' : 'Start your smart campus journey with an Imperial account.'}
        </p>
      </div>

      <form onSubmit={view === 'signin' ? handleSignIn : view === 'signup' ? handleSignUp : handleVerifyOtp} className="space-y-6">
        <div className="space-y-4">
          {/* Email Input */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-2 block tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-4.5 w-5 h-5 text-gray-300 group-focus-within:text-[#1a1b5d] transition-colors mt-0.5" />
              <input 
                type="email" placeholder="e.g. name@imperial.ac.uk" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4.5 bg-[#f8f9fc] rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a1b5d] transition-all"
              />
            </div>
          </div>

          {/* Password Input (仅在登录/注册时显示) */}
          {view !== 'verify' && (
            <div className="group">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-2 block tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-4.5 w-5 h-5 text-gray-300 group-focus-within:text-[#1a1b5d] transition-colors mt-0.5" />
                <input 
                  type="password" placeholder="••••••••" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 bg-[#f8f9fc] rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a1b5d] transition-all"
                />
              </div>
            </div>
          )}

          {/* OTP Input (仅在验证时显示) */}
          {view === 'verify' && (
            <div className="group animate-in slide-in-from-top-4">
              <label className="text-[10px] font-black uppercase text-[#f5a623] ml-4 mb-2 block tracking-widest">Enter 6-digit Code</label>
              <div className="relative">
                <KeyRound className="absolute left-5 top-4.5 w-5 h-5 text-[#f5a623] mt-0.5" />
                <input 
                  type="text" placeholder="Check your inbox" required
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 bg-orange-50 rounded-2xl text-sm font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#f5a623] text-[#1a1b5d]"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-3 ml-4 italic">{message}</p>
            </div>
          )}
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-[#1a1b5d] text-white font-black py-5 rounded-[24px] shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex justify-center items-center"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <span className="uppercase tracking-widest text-xs">
              {view === 'signin' ? 'Sign In Now' : view === 'signup' ? 'Send Verification' : 'Verify & Continue'}
            </span>
          )}
        </button>
      </form>

      <div className="text-center">
        <button 
          onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
          className="text-[#1a1b5d] text-xs font-black uppercase tracking-widest hover:underline"
        >
          {view === 'signin' ? "New here? Create Account" : "Back to Sign In"}
        </button>
      </div>
    </div>
  );
}
