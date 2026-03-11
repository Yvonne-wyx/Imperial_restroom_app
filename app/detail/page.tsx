'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  ChevronLeft, MapPin, Clock, Sparkles, 
  Droplets, Wind, Trash2, Zap, CheckCircle2, XCircle,
  CheckSquare, CalendarClock
} from 'lucide-react';
import Link from 'next/link';

function DetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [toilet, setToilet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      const { data } = await supabase.from('toilets').select('*').eq('id', id).single();
      if (data) setToilet(data);
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading details...</div>;
  if (!toilet) return <div className="p-10 text-center">Toilet not found.</div>;

  return (
    <div className="flex flex-col pb-24 bg-white min-h-screen">
      {/* 1. 顶部导航与基本信息 */}
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <Link href="/"><ChevronLeft className="w-6 h-6 text-[#1a1b5d]" /></Link>
          <h1 className="text-xl font-bold text-[#1a1b5d]">{toilet.name}</h1>
        </div>

        <div className="bg-[#f8f9fc] rounded-[32px] p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-black text-[#1a1b5d]">{toilet.floor}</h2>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${toilet.is_available ? 'bg-[#2ea862] text-white' : 'bg-orange-500 text-white'}`}>
              {toilet.is_available ? 'Available' : 'Busy'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 text-[11px] text-gray-500 font-bold">
            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 opacity-40" /> {toilet.distance_meters}m away</div>
            <div className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-40" /> Avg: {toilet.wait_time} min</div>
            <div className="flex items-center"><Sparkles className="w-4 h-4 mr-2 opacity-40" /> Last cleaned: {toilet.last_cleaned}</div>
            <div className="flex items-center text-blue-600"><CalendarClock className="w-4 h-4 mr-2 opacity-70" /> Next: {toilet.next_cleaning || 'TBC'}</div>
          </div>
        </div>
      </div>

      {/* 2. Hygiene Status (白色区域) */}
      <div className="px-6 py-4 space-y-4">
        <h3 className="text-[#1a1b5d] font-black text-sm uppercase tracking-widest">Hygiene Status</h3>
        <div className="space-y-0">
          {[
            { icon: Droplets, label: 'Toilet paper', val: toilet.has_paper },
            { icon: Wind, label: 'Soap', val: toilet.has_soap },
            { icon: Trash2, label: 'Sanitary bins', val: toilet.has_bins },
            { icon: Zap, label: 'Dryer', val: toilet.has_dryer },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
              <div className="flex items-center text-[#1a1b5d]">
                <item.icon className="w-5 h-5 mr-3 opacity-70" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className={`text-xs font-bold ${item.val ? 'text-[#2ea862]' : 'text-red-400'}`}>
                {item.val ? 'Available' : 'Empty'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Facilities (浅紫色区域 - 对应图2) */}
      <div className="mx-4 mt-2 mb-6 bg-[#f4f5ff] rounded-[32px] p-6 space-y-5">
        <h3 className="text-[#1a1b5d] font-black text-sm uppercase tracking-widest">Facilities</h3>
        <div className="grid grid-cols-1 gap-4">
          {[
            { label: 'Hooks for bags', val: toilet.has_hooks },
            { label: 'Shelf for belongings', val: toilet.has_shelf },
            { label: 'Accessible cubicle', val: toilet.has_accessible },
            { label: 'Sanitary product dispenser', val: toilet.has_dispenser },
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded flex items-center justify-center border ${item.val ? 'bg-[#1a1b5d] border-[#1a1b5d]' : 'bg-transparent border-gray-300'}`}>
                {item.val && <CheckSquare className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm font-medium ${item.val ? 'text-[#1a1b5d]' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 底部悬浮按钮 */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto flex space-x-3 z-50">
        <Link href={`/report?id=${id}`} className="flex-1 bg-white border-2 border-[#1a1b5d] text-[#1a1b5d] text-center font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-sm">
          Report
        </Link>
        <Link href={`/rating?id=${id}`} className="flex-1 bg-[#1a1b5d] text-white text-center font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          Review
        </Link>
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}
