'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Search, MapPin, Clock, CheckCircle2, ChevronRight, 
  ArrowRight, Droplets, Wind, Trash2, Sparkles, Lock, Star, Loader2 
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // --- 状态管理 ---
  const [toilets, setToilets] = useState<any[]>([]); // 存放数据库所有厕所
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // 搜索文字
  const [showDropdown, setShowDropdown] = useState(false); // 下拉框开关
  const [selectedToilet, setSelectedToilet] = useState<any>(null); // 当前选中的主显示厕所
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. 初始化：从数据库抓取所有厕所数据
  useEffect(() => {
    async function fetchToilets() {
      try {
        const { data, error } = await supabase
          .from('toilets')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data) {
          setToilets(data);
          // 默认进入页面显示列表第一个作为主展示
          setSelectedToilet(data[0]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchToilets();
  }, []);

  // 2. 点击页面其他地方时，自动关闭搜索下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. 搜索过滤逻辑：根据建筑名或楼层实时过滤
  const filteredToilets = toilets.filter(t => 
    `${t.name} ${t.floor}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理选择搜索建议
  const handleSelect = (toilet: any) => {
    setSelectedToilet(toilet);
    setSearchQuery(''); // 选中后清空搜索框
    setShowDropdown(false); // 关闭下拉
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Syncing with Imperial Campus Database...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 space-y-5 pb-24 bg-white min-h-screen">
      
      {/* 1. 智能搜索区域 */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#1a1b5d]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="block w-full pl-10 pr-3 py-3.5 border-none rounded-2xl bg-[#f0f2f9] text-[#1a1b5d] placeholder-[#7a7b9c] focus:outline-none focus:ring-2 focus:ring-[#1a1b5d] text-sm font-semibold shadow-inner"
            placeholder="Search building or floor (e.g. CAGB, Sherfield)"
          />
        </div>

        {/* 动态下拉建议列表 */}
        {showDropdown && searchQuery.length > 0 && (
          <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {filteredToilets.length > 0 ? (
              filteredToilets.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  className="px-4 py-3 hover:bg-[#f8f9fc] cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center group"
                >
                  <div>
                    <p className="text-[#1a1b5d] font-bold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">{t.floor}</p>
                  </div>
                  <div className="flex items-center text-gray-300 group-hover:text-[#1a1b5d]">
                    <span className="text-[10px] mr-2 opacity-0 group-hover:opacity-100">Select</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-gray-400 text-sm text-center italic">
                No restroom found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 地图展示区域 */}
      <div className="relative w-full h-44 rounded-3xl border border-gray-50 overflow-hidden shadow-sm">
        <iframe
  width="100%"
  height="100%"
  style={{ border: 0 }}
  loading="lazy"
  allowFullScreen
  referrerPolicy="no-referrer-when-downgrade"
  // 这是一个指向 Imperial College London 的真实 Embed 链接
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.540424380277!2d-0.1774290233795676!3d51.4983083718104!2m3!1f0!2f0!3f0!3m2!1i1024!2i1024!4f13.1!3m3!1m2!1s0x4876056ea04a1f59%3A0x6b801f92e44d3d7!2sImperial%20College%20London!5e0!3m2!1sen!2suk!4v1710110000000!5m2!1sen!2suk"
  className="absolute inset-0 grayscale-[10%] opacity-90"
></iframe>

        <div className="absolute top-3 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm text-[10px] font-black text-[#1a1b5d] z-10 border border-white/50">
           IMPERIAL CAMPUS MAP
        </div>
      </div>

      {/* 3. 动态主展示卡片 (根据搜索选择显示) */}
      {selectedToilet && (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm flex flex-col space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-black text-[#1a1b5d] tracking-tight">
              {selectedToilet.name} <span className="text-gray-300 font-normal text-sm ml-1">— {selectedToilet.floor}</span>
            </h2>
          </div>

          <div className="flex justify-between items-center">
            <div className={`flex items-center ${selectedToilet.is_available ? 'text-[#2ea862]' : 'text-orange-500'} font-bold text-sm`}>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {selectedToilet.is_available ? `Available, ${selectedToilet.wait_time} min wait` : 'Currently Busy'}
            </div>
            {/* 可视化隔间状态 */}
            <div className="flex space-x-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-[4px] ${i <= (selectedToilet.total_cubicles - selectedToilet.used_cubicles) ? 'bg-[#2ea862]' : 'bg-gray-100'}`}
                ></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-[11px] text-gray-500 font-semibold border-t border-gray-50 pt-4">
            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-300" /> {selectedToilet.distance_meters}m away</div>
            <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-300" /> ETA: {selectedToilet.eta}</div>
            <div className="flex items-center space-x-2">
              <Droplets className={`w-4 h-4 ${selectedToilet.has_paper ? 'text-blue-200' : 'text-red-200'}`} />
              <Wind className="w-4 h-4 text-gray-200" />
              <Trash2 className="w-4 h-4 text-gray-200" />
            </div>
            <div className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-gray-300" /> Cleaned: {selectedToilet.last_cleaned}</div>
          </div>

          {/* 双操作按钮：评价 + 详情 */}
          <div className="pt-2 flex justify-between items-center">
            <Link 
              href={`/rating?id=${selectedToilet.id}`} 
              className="text-[#f5a623] text-sm font-bold flex items-center hover:scale-105 transition-transform px-1"
            >
              <Star className="w-4 h-4 mr-1.5 fill-[#f5a623]" /> Rate & Review
            </Link>
            <Link 
              href={`/detail?id=${selectedToilet.id}`} 
              className="bg-[#1a1b5d] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center shadow-lg shadow-blue-900/10 active:scale-95 transition-all"
            >
              View details <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. 底部智能推荐 (默认显示距离最近的 3 个) */}
      <div className="flex flex-col space-y-3 pt-2">
        <h3 className="text-[#7a7b9c] text-[10px] font-black uppercase tracking-[0.1em] px-2 flex justify-between">
          Nearby Recommendations
          <span className="text-[#1a1b5d] normal-case tracking-normal">See all</span>
        </h3>
        {toilets.slice(0, 3).map((alt) => (
          <div 
            key={alt.id} 
            onClick={() => {
              setSelectedToilet(alt);
              window.scrollTo({ top: 0, behavior: 'smooth' }); // 选中后平滑滚动到顶部看大卡片
            }}
            className="bg-[#f8f9fc] border border-transparent hover:border-gray-100 rounded-[24px] p-4 flex justify-between items-center cursor-pointer transition-all active:bg-white active:shadow-sm"
          >
            <div className="flex items-center">
              <div className="bg-white p-2.5 rounded-xl mr-4 shadow-sm">
                 <Clock className={`w-4 h-4 ${alt.wait_time > 3 ? 'text-orange-400' : 'text-[#2ea862]'}`} />
              </div>
              <div>
                <p className="text-[#1a1b5d] font-bold text-sm">{alt.name}</p>
                <p className="text-gray-400 text-[10px] font-bold">{alt.floor} • {alt.distance_meters}m walk</p>
              </div>
            </div>
            <div className="flex items-center text-gray-300 space-x-2">
              <Star className="w-3 h-3 fill-gray-200" />
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
