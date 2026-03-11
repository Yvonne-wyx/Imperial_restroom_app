'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  ChevronDown, MapPin, Clock, Droplets, Wind, 
  Trash2, Sparkles, Activity, Search, Navigation2, Timer
} from 'lucide-react';

export default function PlanPage() {
  // --- 状态管理 ---
  const [rooms, setRooms] = useState<any[]>([]);
  const [toilets, setToilets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [timeType, setTimeType] = useState<'leave' | 'arrive'>('leave');
  const [timeValue, setTimeValue] = useState('12:00');
  const [results, setResults] = useState<any[]>([]);

  // 1. 初始化数据
  useEffect(() => {
    async function fetchData() {
      const { data: roomsData } = await supabase.from('rooms').select('*');
      const { data: toiletsData } = await supabase.from('toilets').select('*');
      setRooms(roomsData || []);
      setToilets(toiletsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. 核心算法：计算最优推荐
  const calculatePlan = () => {
    if (!source || !destination) return;

    // 模拟算法：在实际应用中，这里会根据地图坐标计算
    // 我们这里假设一个随机的距离分值，加上厕所本身的排队时间
    const sorted = [...toilets].map(t => {
      const walkingTime = Math.floor(Math.random() * 5) + 2; // 模拟 2-7 分钟步行
      const totalTime = walkingTime + (t.wait_time || 0);
      return { ...t, walkingTime, totalTime };
    }).sort((a, b) => a.totalTime - b.totalTime);

    setResults(sorted.slice(0, 2)); // 选出总耗时最短的 2 个
  };

  if (loading) return <div className="p-10 text-center">Loading campus map...</div>;

  return (
    <div className="flex flex-col p-5 space-y-6 pb-24 bg-white min-h-screen">
      
      {/* 1. 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1b5d]">Smart Plan</h1>
        <p className="text-gray-500 text-sm mt-1">Check our smart choice for your next class or meeting location.</p>
      </div>

      {/* 2. 搜索选择区域 */}
      <div className="bg-[#f8f9fc] rounded-2xl p-5 space-y-4 shadow-sm border border-gray-100">
        
        {/* 起点选择 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#1a1b5d] uppercase ml-1">Choose your location</label>
          <div className="relative">
            <select 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 text-[#1a1b5d] text-sm py-3 px-4 rounded-xl focus:outline-none shadow-sm"
            >
              <option value="">Where are you now?</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.building} - {r.floor} - {r.room_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 终点选择 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#1a1b5d] uppercase ml-1">Choose your destination</label>
          <div className="relative">
            <select 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 text-[#1a1b5d] text-sm py-3 px-4 rounded-xl focus:outline-none shadow-sm"
            >
              <option value="">Where is your next class?</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.building} - {r.floor} - {r.room_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 时间选择 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#1a1b5d] uppercase ml-1">Choose your time</label>
          <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-100">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setTimeType('leave')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${timeType === 'leave' ? 'bg-white text-[#1a1b5d] shadow-sm' : 'text-gray-400'}`}
              >
                Leave at
              </button>
              <button 
                onClick={() => setTimeType('arrive')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${timeType === 'arrive' ? 'bg-white text-[#1a1b5d] shadow-sm' : 'text-gray-400'}`}
              >
                Arrive by
              </button>
            </div>
            <input 
              type="time" 
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="flex-1 text-sm font-bold text-[#1a1b5d] focus:outline-none px-2"
            />
          </div>
        </div>

        <button 
          onClick={calculatePlan}
          className="w-full bg-[#1a1b5d] text-white font-bold py-3.5 rounded-xl mt-2 active:scale-95 transition-all shadow-lg shadow-blue-900/10"
        >
          Generate Smart Choice
        </button>
      </div>

      {/* 3. 结果列表 */}
      {results.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[#1a1b5d] font-bold text-sm px-1">Top Recommendations</h3>
          {results.map((t, idx) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase mb-1 inline-block">Option {idx + 1}</span>
                  <h4 className="text-[#1a1b5d] font-bold text-lg">{t.name} - {t.floor}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[#2ea862] font-black text-lg">{t.totalTime} min</p>
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Total Time</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 flex items-center">
                  <Navigation2 className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Distance</p>
                    <p className="text-xs font-bold text-[#1a1b5d]">{t.distance_meters}m away</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center">
                  <Timer className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Avg Wait</p>
                    <p className="text-xs font-bold text-[#1a1b5d]">{t.wait_time} min/person</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                <div className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1.5"/> Last: {t.last_cleaned}</div>
                <div className="flex items-center text-blue-500 font-bold"><Clock className="w-3.5 h-3.5 mr-1.5"/> Next: {t.next_cleaning}</div>
              </div>

              {/* Hygiene Status */}
              <div className="border-t border-gray-50 pt-3 flex justify-between">
                <div className="flex space-x-3">
                  <Droplets className={`w-4 h-4 ${t.has_paper ? 'text-green-500' : 'text-gray-300'}`} />
                  <Wind className={`w-4 h-4 ${t.has_soap ? 'text-green-500' : 'text-gray-300'}`} />
                  <Trash2 className={`w-4 h-4 ${t.has_bins ? 'text-green-500' : 'text-gray-300'}`} />
                </div>
                <span className="text-[10px] font-bold text-[#2ea862] uppercase tracking-widest">All Available</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Alternative Nearby (保持不变，显示在最后) */}
      <div className="flex flex-col space-y-2">
        <h3 className="text-[#7a7b9c] text-[13px] px-1 font-bold">Alternative nearby</h3>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="w-2.5 h-2.5 bg-[#2ea862] rounded-full mt-1.5 mr-2"></div>
              <div>
                <h4 className="text-[#1a1b5d] font-bold text-sm">Business School - Floor 1</h4>
                <p className="text-orange-500 text-[10px] font-bold">Moderate queue</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-[10px]">80m walk</p>
              <p className="text-gray-500 text-[10px] font-bold">ETA: 2-3 min</p>
            </div>
          </div>
          <button className="w-full bg-gray-50 text-gray-400 text-xs py-2 rounded-lg font-bold flex items-center justify-center border border-gray-100">
            Search rooms <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

    </div>
  );
}
