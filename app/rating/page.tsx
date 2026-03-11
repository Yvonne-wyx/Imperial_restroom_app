'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Star, ArrowLeft, Loader2, Send, CheckCircle2, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RatingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toiletId = searchParams.get('id');

  // --- 状态管理 ---
  const [toiletName, setToiletName] = useState('Restroom');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!toiletId) return;

    const initPage = async () => {
      // 1. 获取登录状态
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // 2. 获取厕所名称和已有的评价（带上用户信息）
      await Promise.all([
        fetchToiletInfo(),
        fetchReviews()
      ]);
      setLoading(false);
    };

    initPage();
  }, [toiletId]);

  // 获取厕所基础信息
  const fetchToiletInfo = async () => {
    const { data } = await supabase.from('toilets').select('name').eq('id', toiletId).single();
    if (data) setToiletName(data.name);
  };

  // 关键：获取评价列表并关联 profiles 表
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq('toilet_id', toiletId)
      .order('created_at', { ascending: false });

    if (!error) setReviews(data || []);
  };

  // 提交评价逻辑
  const handleSubmit = async () => {
    if (!session) {
      alert('Please sign in to leave a review.');
      router.push('/account');
      return;
    }
    if (rating === 0) {
      alert('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert([
      {
        toilet_id: parseInt(toiletId!),
        user_id: session.user.id, // 👈 关键：关联当前用户 ID
        rating: rating,
        comment: comment,
      }
    ]);

    if (error) {
      alert(error.message);
    } else {
      setRating(0);
      setComment('');
      fetchReviews(); // 刷新列表
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#1a1b5d] w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-24">
      {/* Header */}
      <div className="bg-white p-6 flex items-center space-x-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#1a1b5d]" />
        </button>
        <h1 className="text-xl font-black text-[#1a1b5d]">{toiletName}</h1>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-6">
        
        {/* 1. 写评价卡片 */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate your experience</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1 transform active:scale-90 transition-transform">
                  <Star 
                    className={`w-8 h-8 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about the cleanliness..."
            className="w-full bg-[#f8f9fc] border-none rounded-2xl p-4 text-sm font-bold text-[#1a1b5d] h-24 focus:ring-2 focus:ring-[#1a1b5d] placeholder:text-gray-300 placeholder:font-normal outline-none"
          />

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#1a1b5d] text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Post Review</span><Send className="w-4 h-4" /></>}
          </button>
        </div>

        {/* 2. 评论列表 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Community Reviews</p>
            <span className="text-[10px] font-bold text-[#1a1b5d] bg-white px-2 py-0.5 rounded-full shadow-sm">{reviews.length}</span>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-[32px] border border-dashed border-gray-200">
                <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">No reviews yet</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-50 flex space-x-4">
                  {/* 用户头像显示 */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner">
                    <img 
                      src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.id}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-[#1a1b5d]">
                          {review.profiles?.username || 'Anonymous User'}
                        </h4>
                        <div className="flex mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed pt-1">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
