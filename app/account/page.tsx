'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [message, setMessage] = useState('');

  // 1. 发送验证码
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: { shouldCreateUser: true } // 如果用户不存在则创建
    });
    if (error) setMessage(error.message);
    else {
      setStep('otp');
      setMessage('Code sent to your email!');
    }
    setLoading(false);
  };

  // 2. 验证验证码
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup', // 或者是 'magiclink'
    });
    if (error) setMessage(error.message);
    else {
      setStep('password');
      setMessage('Verified! Now set your password.');
    }
    setLoading(false);
  };

  // 3. 设置新密码
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage(error.message);
    else setStep('success');
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 justify-center max-w-md mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-[#1a1b5d]">
            {step === 'success' ? 'Welcome!' : 'Join iWash'}
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            {step === 'email' && "Enter your IC email to start"}
            {step === 'otp' && "We've sent a 6-digit code to your inbox"}
            {step === 'password' && "Create a secure password"}
          </p>
        </div>

        {/* Form Steps */}
        <div className="bg-[#f8f9fc] rounded-[32px] p-8 shadow-sm border border-gray-50">
          {message && <p className="text-xs text-red-500 mb-4 font-bold text-center">{message}</p>}

          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <input 
                  type="email" placeholder="Email address" required
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#1a1b5d] transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button disabled={loading} className="w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all">
                <span>{loading ? 'Sending...' : 'Send Code'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <input 
                  type="text" placeholder="6-digit code" required
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm tracking-[0.5em] font-bold focus:ring-2 focus:ring-[#1a1b5d]"
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button disabled={loading} className="w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl active:scale-95 transition-all">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <input 
                  type="password" placeholder="New password" required
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#1a1b5d]"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button disabled={loading} className="w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl active:scale-95 transition-all">
                {loading ? 'Setting up...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-[#2ea862]" />
              </div>
              <p className="font-bold text-[#1a1b5d]">Your account is ready!</p>
              <Link href="/" className="block w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl">
                Go to Home
              </Link>
            </div>
          )}
        </div>

        {step === 'email' && (
          <div className="text-center">
            <p className="text-xs text-gray-400 font-medium">
              Already have an account? <Link href="/login" className="text-[#1a1b5d] font-bold">Sign In</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
