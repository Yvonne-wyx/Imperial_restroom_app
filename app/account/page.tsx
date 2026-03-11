'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Mail, KeyRound, Lock, ArrowRight, CheckCircle2, 
  User, LogOut, Loader2, ShieldCheck, ChevronRight, 
  Clock, CheckCircle, Camera, UserCircle, Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  // --- 用户资料与数据状态 ---
  const [session, setSession] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // --- 注册流程状态 (未登录时使用) ---
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [message, setMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 1. 初始化：检查 Session 并获取 Profile 资料
  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        // 同时获取 profile 表和 reports 列表
        await Promise.all([
          fetchProfile(session.user.id),
          fetchMyReports(session.user.id)
        ]);
      }
      setLoading(false);
    };
    initData();

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchMyReports(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // 获取 Profile 信息
  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', userId)
      .single();

    if (data) {
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url || '');
    }
  }

  // 获取报修记录
  async function fetchMyReports(userId: string) {
    const { data } = await supabase
      .from('reports')
      .select('*, toilets(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setReports(data);
  }

  // 2. 更换头像逻辑
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUpdating(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

      // 上传到 storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 获取链接并更新 profile 表
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      
      await supabase.from('profiles').upsert({
        id: session.user.id,
        avatar_url: publicUrl,
        updated_at: new Date()
      });

    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  // 3. 保存用户名修改
  const handleUpdateProfile = async () => {
    setUpdating(true);
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username: username,
      updated_at: new Date()
    });

    if (error) alert(error.message);
    else alert('Profile updated successfully!');
    setUpdating(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  // --- 注册逻辑函数 (handleSendOTP 等保持不变) ---
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(''); setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) setMessage(error.message); else setStep('otp');
    setAuthLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(''); setAuthLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) setMessage(error.message); else setStep('password');
    setAuthLoading(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage(error.message); else setStep('success');
    setAuthLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-[#1a1b5d] w-8 h-8" /></div>;

  // --- A. 已登录状态 (个人中心) ---
  if (session) {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`;

    return (
      <div className="min-h-screen bg-[#f8f9fc] pb-10">
        <div className="max-w-md mx-auto pt-6 px-5 space-y-6">
          
          {/* 蓝色悬浮卡片 */}
          <div className="bg-[#1a1b5d] py-10 px-6 rounded-[32px] shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full" />
            
            <div className="relative flex flex-col items-center">
              {/* 可点击头像 */}
              <div 
                className="relative w-20 h-20 bg-white rounded-full p-1 mb-4 shadow-xl cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full bg-[#eef0f7] rounded-full flex items-center justify-center overflow-hidden relative">
                  {updating ? (
                    <Loader2 className="animate-spin text-[#1a1b5d] w-6 h-6" />
                  ) : (
                    <img src={avatarUrl || defaultAvatar} alt="avatar" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />

              <h1 className="text-white text-2xl font-black mb-1">
                {username || session.user.email?.split('@')[0]}
              </h1>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Verified Student</span>
              </div>
            </div>
          </div>

          {/* 设置卡片 */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-6">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Settings</p>
              
              {/* 用户名输入 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 ml-1">DISPLAY NAME</label>
                <div className="flex items-center bg-[#f8f9fc] rounded-2xl p-4 border border-transparent focus-within:border-[#1a1b5d]/20 transition-all">
                  <UserCircle className="w-4 h-4 text-gray-300 mr-3" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Set your name"
                    className="bg-transparent border-none outline-none text-sm font-black text-[#1a1b5d] w-full placeholder:text-gray-300 placeholder:font-normal"
                  />
                  {username && (
                    <button onClick={handleUpdateProfile} disabled={updating}>
                      {updating ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Save className="w-4 h-4 text-[#1a1b5d]" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* My Reports 列表 */}
            <div className="space-y-4 pt-2 border-t border-gray-50">
              <div className="flex justify-between items-center px-1 pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Reports</p>
                <span className="text-[10px] font-bold text-[#1a1b5d] bg-[#f4f5ff] px-2 py-0.5 rounded-full">{reports.length}</span>
              </div>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">No reports yet</p>
                  </div>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${report.status === 'Resolved' ? 'bg-green-50' : 'bg-orange-50'}`}>
                          {report.status === 'Resolved' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-orange-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#1a1b5d]">{report.toilets?.name || 'Restroom'}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{report.status} • {new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  ))
                )}
              </div>
            </div>

            <button onClick={handleSignOut} className="w-full bg-[#fff4f4] text-[#ff4d4d] font-black py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all mt-4">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- B. 未登录状态 (注册/发送 OTP 流程) ---
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 justify-center max-w-md mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-[#1a1b5d]">{step === 'success' ? 'Welcome!' : 'Join iWash'}</h1>
          <p className="text-gray-400 text-sm font-medium">Enter your IC email to start</p>
        </div>

        <div className="bg-[#f8f9fc] rounded-[32px] p-8 shadow-sm border border-gray-50">
          {message && <p className="text-xs text-red-500 mb-4 font-bold text-center">{message}</p>}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <input 
                  type="email" placeholder="Email address" required
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-[#1a1b5d] font-bold focus:ring-2 focus:ring-[#1a1b5d]"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button disabled={authLoading} className="w-full bg-[#1a1b5d] text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2">
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send Code</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
               <div className="relative">
                <KeyRound className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <input type="text" placeholder="Code" required className="w-full bg-white rounded-2xl py-4 pl-12 text-center tracking-widest font-bold text-[#1a1b5d]" value={otp} onChange={(e) => setOtp(e.target.value)} />
              </div>
              <button disabled={authLoading} className="w-full bg-[#1a1b5d] text-white font-black py-4 rounded-2xl">Verify Code</button>
            </form>
          )}
          {step === 'password' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <input type="password" placeholder="Set Password" required className="w-full bg-white rounded-2xl py-4 pl-12 font-bold text-[#1a1b5d]" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button disabled={authLoading} className="w-full bg-[#1a1b5d] text-white font-black py-4 rounded-2xl">Complete Registration</button>
            </form>
          )}
          {step === 'success' && (
             <div className="text-center py-4">
               <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
               <button onClick={() => window.location.reload()} className="w-full bg-[#1a1b5d] text-white font-black py-4 rounded-2xl">Enter Profile</button>
             </div>
          )}
        </div>

        {step === 'email' && (
          <div className="text-center">
            <Link href="/login" className="text-xs font-medium text-gray-400">
              Already have account? <span className="text-[#1a1b5d] font-bold underline">Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
