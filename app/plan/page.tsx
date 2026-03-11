'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  ChevronDown, MapPin, Clock, Droplets, Wind, 
  Trash2, Sparkles, Navigation2, Timer, ExternalLink, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function PlanPage() {
  // --- 状态管理 ---
  const [rooms, setRooms] = useState<any[]>([]);
  const [toilets, setToilets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [timeType, setTimeType] = useState<'leave' | 'arrive'>('leave');
  const [timeValue, setTimeValue] = useState('12:00');
  const [results, setResults] = useState<any[]>([]);

  // 1. 初始化数据
  useEffect(() => {
    async function fetchData() {
      const { data: roomsData } = await supabase.from('rooms').select('*').order('room_name');
      const { data: toiletsData } = await supabase.from('toilets').select('*');
      setRooms(roomsData || []);
      setToilets(toiletsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. 核心算法：计算最优推荐
  const calculatePlan = () => {
    if (!source || !destination) {
      alert("Please select both source and destination");
      return;
    }

    setCalculating(true);
    
    // 模拟推荐算法逻辑
    setTimeout(() => {
      const sorted = [...toilets].map(t => {
        const walkingTime = Math.floor(Math.random() * 5) + 2; 
        const totalTime = walkingTime + (t.wait_time || 0);
        return { ...t, walkingTime, totalTime };
      }).sort((a, b) => a.totalTime - b.totalTime);

      setResults(sorted.slice(0, 2)); 
      setCalculating(false);
    }, 800);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="w-12 h-12 border-4 border-[#1a1b5d]/10 border-t-[#1a1b5d] rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-400 font-bold text-sm">Loading campus map...</p>
    </div>
  );

  return (
    <div className="flex flex-col p-5 space-y-6 pb-24 bg-white min-h-screen">
      
      {/* 1. 标题 */}
      <div className="pt-2">
        <h1 className="text-2xl font-black text-[#1a1b5d] tracking-tight">Smart Plan</h1>
        <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-wider">Optimized route for your schedule</p>
      </div>

      {/* 2. 搜索选择区域 */}
      <div className="bg-[#f8f9fc] rounded-[32px] p-6 space-y-4 shadow-sm border border-gray-50">
        
        {/* 起点选择 */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-[#1a1b5d] uppercase ml-1 opacity-60">Your current location</label>
          <div className="relative">
            <select 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 text-[#1a1b5d] text-sm py-4 px-4 rounded-2xl focus:outline-none shadow-sm font-bold"
            >
              <option value="">Search room or building...</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.building} - {r.room_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 终点选择 */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-[#1a1b5d] uppercase ml-1 opacity-60">Next destination</label>
          <div className="relative">
            <select 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 text-[#1a1b5d] text-sm py-4 px-4 rounded-2xl focus:outline-none shadow-sm font-bold"
            >
              <option value="">Where is your next class?</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.building} - {r.room_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 时间选择 */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-[#1a1b5d] uppercase ml-1 opacity-60">Schedule</label>
          <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-gray-100">
            <div className="flex bg-gray-50 rounded-xl p-1">
              <button 
                onClick={() => setTimeType('leave')}
                className={`px-3 py-2 text-[10px] font-bold rounded-lg transition-all ${timeType === 'leave' ? 'bg-white text-[#1a1b5d] shadow-sm' : 'text-gray-400'}`}
              >
                Leave
              </button>
              <button 
                onClick={() => setTimeType('arrive')}
                className={`px-3 py-2 text-[10px] font-bold rounded-lg transition-all ${timeType === 'arrive' ? 'bg-white text-[#1a1b5d] shadow-sm' : 'text-gray-400'}`}
              >
                Arrive
              </button>
            </div>
            <input 
              type="time" 
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="flex-1 text-sm font-black text-[#1a1b5d] focus:outline-none px-2"
            />
          </div>
        </div>

        <button 
          onClick={calculatePlan}
          disabled={calculating}
          className="w-full bg-[#1a1b5d] text-white font-black py-4 rounded-2xl mt-2 active:scale-95 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center space-x-2"
        >
          {calculating ? (
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Generate Smart Choice</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* 3. 结果列表 */}
      {results.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[#1a1b5d] font-black text-sm uppercase tracking-widest px-1">Top Recommendations</h3>
          {results.map((t, idx) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase mb-1.5 inline-block ${idx === 0 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {idx === 0 ? 'Best Choice' : 'Fast Alternative'}
                  </span>
                  <h4 className="text-[#1a1b5d] font-black text-xl">{t.name}</h4>
                  <p className="text-gray-400 text-xs font-bold">{t.floor}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#1a1b5d] font-black text-2xl">{t.totalTime}<span className="text-[10px] ml-0.5">MIN</span></p>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Est. Total Time</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center">
                  <Navigation2 className="w-4 h-4 text-blue-500 mr-3" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase">Walk</p>
                    <p className="text-xs font-bold text-[#1a1b5d]">{t.walkingTime} min</p>
                  </div>
                </div>
                <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center">
                  <Timer className="w-4 h-4 text-orange-500 mr-3" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase">Wait</p>
                    <p className="text-xs font-bold text-[#1a1b5d]">{t.wait_time} min</p>
                  </div>
                </div>
              </div>

              {/* 按钮区域：修复了 href 语法错误 */}
              <div className="pt-2 flex space-x-3">
                 <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.name + ' Imperial College London')}`}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex-1 bg-white border-2 border-[#1a1b5d] text-[#1a1b5d] text-center font-black py-3 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all"
                 >
                   <MapPin className="w-3 h-3" />
                   <span>Navigate</span>
                   <ExternalLink className="w-3 h-3 opacity-40" />
                 </a>
                 <Link 
                   href={`/detail?id=${t.id}`}
                   className="flex-1 bg-[#1a1b5d] text-white text-center font-black py-3 rounded-xl text-xs flex items-center justify-center active:scale-95 transition-all"
                 >
                   Details
                 </Link>
              </div>

              <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
                <div className="flex space-x-4">
                  <Droplets className={`w-4 h-4 ${t.has_paper ? 'text-blue-500' : 'text-gray-200'}`} />
                  <Wind className={`w-4 h-4 ${t.has_soap ? 'text-blue-500' : 'text-gray-200'}`} />
                  <Trash2 className={`w-4 h-4 ${t.has_bins ? 'text-blue-500' : 'text-gray-200'}`} />
                </div>
                <div className="flex items-center text-[10px] font-bold text-gray-400">
                   <Sparkles className="w-3 h-3 mr-1 text-orange-400" />
                   Last: {t.last_cleaned}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Alternative Nearby */}
      <div className="flex flex-col space-y-3 pt-4">
        <h3 className="text-gray-400 text-[11px] px-1 font-black uppercase tracking-widest">Nearby Buildings</h3>
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-300" />
               </div>
               <div>
                  <h4 className="text-[#1a1b5d] font-bold text-sm">Business School</h4>
                  <p className="text-gray-400 text-[10px] font-medium uppercase tracking-tight">120m • 2 min walk</p>
               </div>
            </div>
            <button className="bg-gray-50 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-bold">
               Explore
            </button>
        </div>
      </div>
    </div>
  );
}
