'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/account'); // 登录成功去个人中心
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 justify-center max-w-md mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-[#1a1b5d]">Welcome Back</h1>
          <p className="text-gray-400 text-sm font-medium">Log in to your iWash account</p>
        </div>

        <div className="bg-[#f8f9fc] rounded-[32px] p-8 shadow-sm border border-gray-50">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-center text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
              <input 
                type="email" placeholder="Email address" required
                className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-[#1a1b5d] font-bold focus:ring-2 focus:ring-[#1a1b5d]"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
              <input 
                type="password" placeholder="Password" required
                className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-[#1a1b5d] font-bold focus:ring-2 focus:ring-[#1a1b5d]"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button disabled={loading} className="w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/account" className="text-xs font-medium text-gray-400">
            New here? <span className="text-[#1a1b5d] font-bold underline">Create Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
