'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Star, X, Loader2, MessageSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// --- 内部逻辑组件 ---
function RatingContent() {
  const searchParams = useSearchParams();
  const toiletId = searchParams.get('id');

  // --- 状态管理 ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- 提交表单的状态 ---
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 获取评论数据
  useEffect(() => {
    async function fetchReviews() {
      // 如果没有 ID，直接停止加载，显示空状态
      if (!toiletId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('toilet_id', toiletId)
          .order('created_at', { ascending: false });

        if (!error) {
          setReviews(data || []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false); // 无论成功失败，都关闭加载动画
      }
    }
    fetchReviews();
  }, [toiletId]);

  // 2. 提交新评论
  const handleSubmitReview = async () => {
    if (!newContent.trim()) return alert('Please write something!');
    setIsSubmitting(true);

    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          toilet_id: toiletId,
          rating: newRating,
          content: newContent,
          user_name: 'Imperial Student',
        }
      ]);

    if (!error) {
      setIsModalOpen(false);
      setNewContent('');
      // 提交后立即刷新列表
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('toilet_id', toiletId)
        .order('created_at', { ascending: false });
      setReviews(data || []);
    } else {
      alert('Error: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // 星星渲染辅助
  const RenderStars = ({ count, size = 4, onStarClick }: { count: number, size?: number, onStarClick?: (val: number) => void }) => {
    return (
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            onClick={() => onStarClick?.(star)}
            className={`w-${size} h-${size} ${onStarClick ? 'cursor-pointer' : ''} ${star <= count ? 'text-[#f5a623] fill-[#f5a623]' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading reviews...</p>
      </div>
    );
  }

  // 如果没有 ID（直接从底部导航进来）
  if (!toiletId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <MapPin className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1b5d] mb-2">No Restroom Selected</h2>
        <p className="text-gray-500 text-sm mb-6">Please select a restroom from the map to view or leave reviews.</p>
        <Link href="/" className="bg-[#1a1b5d] text-white px-6 py-3 rounded-xl font-bold">
          Go back to Map
        </Link>
      </div>
    );
  }

  // 计算平均分
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="flex flex-col p-4 space-y-6 pb-24 relative min-h-screen bg-white">
      
      <div className="flex items-center space-x-4">
        <Link href={`/detail?id=${toiletId}`}>
           <ChevronLeft className="w-6 h-6 text-[#1a1b5d]" />
        </Link>
        <h1 className="text-2xl font-bold text-[#1a1b5d]">Ratings & Reviews</h1>
      </div>

      {/* 2. 评分卡片 */}
      <div className="bg-[#f8f9fc] border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-5xl font-black text-[#1a1b5d]">{avgRating}</span>
            <div>
              <RenderStars count={Math.round(Number(avgRating))} size={5} />
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{reviews.length} Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 评论列表 */}
      <div className="space-y-4">
        <h3 className="font-bold text-[#1a1b5d] text-[15px] flex items-center px-1">
          <MessageSquare className="w-4 h-4 mr-2 text-[#1a1b5d]" /> Recent reviews
        </h3>
        
        <div className="space-y-4">
          {reviews.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to share!</p>
            </div>
          )}
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex space-x-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex-shrink-0 overflow-hidden border border-gray-100">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${rev.user_name}&backgroundColor=f1f5f9`} alt="avatar" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-[#1a1b5d]">{rev.user_name}</h4>
                  <RenderStars count={rev.rating} size={3} />
                </div>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{rev.content}</p>
                <span className="text-[9px] text-gray-300 mt-2 block font-medium">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 悬浮按钮 */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-900/20"
        >
          Leave a review
        </button>
      </div>

      {/* --- 弹窗 Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#1a1b5d] mb-6 text-center">Your Rating</h2>
            
            <div className="flex flex-col items-center space-y-8">
              <div className="scale-150 py-4">
                <RenderStars count={newRating} size={6} onStarClick={setNewRating} />
              </div>

              <textarea 
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What did you think of the cleanliness and facilities?"
                className="w-full border-0 bg-gray-50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1b5d] h-32 resize-none"
              />

              <button 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Review'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// 辅助图标
function MapPin(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

// --- 最终导出的包装组件 ---
export default function RatingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    }>
      <RatingContent />
    </Suspense>
  );
}
