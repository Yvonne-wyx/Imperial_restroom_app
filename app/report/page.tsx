'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Camera, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();
  
  // --- 状态管理 ---
  const [toilets, setToilets] = useState<any[]>([]); 
  const [selectedToiletId, setSelectedToiletId] = useState<string>(''); // 现在存储数字 ID 的字符串形式
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [otherDetails, setOtherDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 图片处理状态 ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化：抓取真实的厕所清单（包含 ID）
  useEffect(() => {
    async function fetchToilets() {
      // 必须查询 id，用于数据库关联
      const { data } = await supabase.from('toilets').select('id, name, floor').order('name');
      if (data) {
        setToilets(data);
        if (data.length > 0) setSelectedToiletId(data[0].id.toString());
      }
    }
    fetchToilets();
  }, []);

  // 2. 选择图片处理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleProblem = (problem: string) => {
    setSelectedProblems(prev => 
      prev.includes(problem) ? prev.filter(p => p !== problem) : [...prev, problem]
    );
  };

  // 3. 核心提交逻辑
  const handleSubmit = async () => {
    // A. 基础校验
    if (!selectedToiletId) {
      alert('Please select a toilet.'); return;
    }
    if (selectedProblems.length === 0 && !otherDetails) {
      alert('Please provide some details about the issue.'); return;
    }

    setIsSubmitting(true);

    try {
      // B. 身份校验：获取当前登录用户
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please sign in to submit a report.');
        router.push('/account'); // 引导去登录
        return;
      }

      let photoUrl = null;

      // C. 图片上传逻辑 (确保你的 Supabase Storage 已经创建了 'toilet-photos' 存储桶并设为 Public)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('toilet-photos')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('toilet-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrlData.publicUrl;
      }

      // D. 存入 reports 表
      const { error: insertError } = await supabase
        .from('reports')
        .insert([{
          user_id: session.user.id,             // 关联登录用户
          toilet_id: parseInt(selectedToiletId), // 关联厕所 ID (转为整数)
          problems: selectedProblems,           // 选中的问题数组
          other_details: otherDetails,          // 详细描述
          photo_url: photoUrl,                  // 图片链接
          status: 'Pending'                     // 初始状态
        }]);

      if (insertError) throw insertError;

      // E. 成功反馈并跳转
      alert('Report submitted! You can track the progress in your account.');
      
      // 清空本地状态
      setSelectedProblems([]);
      setOtherDetails('');
      setImageFile(null);
      setImagePreview(null);

      // 跳转到个人中心查看 My Reports
      router.push('/account');

    } catch (error: any) {
      alert('Submission failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col p-5 space-y-6 pb-24 bg-white min-h-screen">
      
      {/* 1. Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-black text-[#1a1b5d] tracking-tight">Report Issue</h1>
        <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-wider">Help us maintain the standard</p>
      </div>

      {/* 2. 厕所选择下拉框 */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-[#1a1b5d] uppercase ml-1 opacity-60">Location</label>
        <div className="relative">
          <select 
            value={selectedToiletId}
            onChange={(e) => setSelectedToiletId(e.target.value)}
            className="w-full appearance-none bg-[#f8f9fc] border border-gray-100 text-[#1a1b5d] text-sm py-4 px-4 rounded-2xl focus:outline-none font-bold"
          >
            {toilets.map((t) => (
              <option key={t.id} value={t.id}>{t.name} • {t.floor}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-4.5 w-4 h-4 text-[#1a1b5d] pointer-events-none" />
        </div>
      </div>

      {/* 3. 问题类型勾选 */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#1a1b5d] uppercase ml-1 opacity-60">What's wrong?</label>
        <div className="grid grid-cols-2 gap-3">
          {['No paper', 'No soap', 'Clogged', 'Dirty', 'Broken lock', 'No water'].map((prob) => (
            <div 
              key={prob}
              onClick={() => toggleProblem(prob)}
              className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedProblems.includes(prob) 
                ? 'border-[#1a1b5d] bg-[#f4f5ff]' 
                : 'border-gray-50 bg-[#f8f9fc]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedProblems.includes(prob) ? 'bg-[#1a1b5d] border-[#1a1b5d]' : 'border-gray-300 bg-white'
              }`}>
                {selectedProblems.includes(prob) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-xs font-bold ${selectedProblems.includes(prob) ? 'text-[#1a1b5d]' : 'text-gray-400'}`}>
                {prob}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 文字描述 */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-[#1a1b5d] uppercase ml-1 opacity-60">Additional Info</label>
        <textarea
          value={otherDetails}
          onChange={(e) => setOtherDetails(e.target.value)}
          placeholder="e.g. The third cubicle from the left..."
          className="w-full bg-[#f8f9fc] border-none rounded-2xl p-4 text-sm font-bold text-[#1a1b5d] h-28 focus:ring-2 focus:ring-[#1a1b5d] placeholder:text-gray-300 placeholder:font-normal"
        />
      </div>

      {/* 5. 图片上传 */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#1a1b5d] uppercase ml-1 opacity-60">Proof (Optional)</label>
        
        <input 
          type="file" 
          accept="image/*" 
          hidden 
          ref={fileInputRef} 
          onChange={handleImageChange} 
        />

        {!imagePreview ? (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-100 bg-[#f8f9fc] rounded-[24px] py-8 flex flex-col items-center justify-center active:scale-[0.98] transition-all"
          >
            <Camera className="w-6 h-6 text-[#1a1b5d] mb-2 opacity-30" />
            <span className="text-[10px] text-[#1a1b5d] font-black uppercase tracking-widest">Attach Photo</span>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg animate-in zoom-in-95">
            <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
            <button 
              onClick={() => {setImageFile(null); setImagePreview(null);}}
              className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 6. 提交按钮 */}
      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-[#1a1b5d] text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/10 active:scale-95 transition-all flex justify-center items-center space-x-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span className="uppercase tracking-widest text-sm">Submit Report</span>
          </>
        )}
      </button>

      {/* 提示信息 */}
      <div className="flex items-start space-x-2 px-1">
        <AlertCircle className="w-3.5 h-3.5 text-gray-300 mt-0.5" />
        <p className="text-[10px] text-gray-400 font-medium">Your report will be sent to the campus facilities team. You can track its status in the Account tab.</p>
      </div>
    </div>
  );
}
