'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Camera, Loader2, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function ReportPage() {
  // --- 状态管理 ---
  const [toilets, setToilets] = useState<any[]>([]); // 动态厕所列表
  const [selectedToilet, setSelectedToilet] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [otherDetails, setOtherDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 图片处理状态 ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化：抓取真实的厕所名单
  useEffect(() => {
    async function fetchToilets() {
      const { data } = await supabase.from('toilets').select('name, floor');
      if (data) {
        setToilets(data);
        if (data.length > 0) setSelectedToilet(`${data[0].name} • ${data[0].floor}`);
      }
    }
    fetchToilets();
  }, []);

  // 2. 选择图片处理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // 生成预览图
    }
  };

  const toggleProblem = (problem: string) => {
    setSelectedProblems(prev => 
      prev.includes(problem) ? prev.filter(p => p !== problem) : [...prev, problem]
    );
  };

  // 3. 核心提交逻辑
  const handleSubmit = async () => {
    if (selectedProblems.length === 0 && !otherDetails) {
      alert('Please provide some details.'); return;
    }
    setIsSubmitting(true);

    try {
      let photoUrl = null;

      // 如果有图片，先上传到 Supabase Storage
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('toilet-photos')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // 获取图片的公开访问链接
        const { data: publicUrlData } = supabase.storage
          .from('toilet-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrlData.publicUrl;
      }

      // 存入 reports 表
      const { error: insertError } = await supabase
        .from('reports')
        .insert([{
          toilet_name: selectedToilet,
          problems: selectedProblems,
          other_details: otherDetails,
          photo_url: photoUrl // 把图片链接存进去
        }]);

      if (insertError) throw insertError;

      alert('Report submitted! Our team will check it soon.');
      // 重置表单
      setSelectedProblems([]);
      setOtherDetails('');
      setImageFile(null);
      setImagePreview(null);

    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col p-5 space-y-6 pb-24 bg-white min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1b5d]">Report a Problem</h1>
        <p className="text-gray-400 text-sm mt-2">Help us keep our restrooms in top condition.</p>
      </div>

      {/* 动态下拉框 */}
      <div className="relative">
        <select 
          value={selectedToilet}
          onChange={(e) => setSelectedToilet(e.target.value)}
          className="w-full appearance-none bg-[#f4f5fa] border border-gray-100 text-[#1a1b5d] text-sm py-3.5 px-4 rounded-xl focus:outline-none"
        >
          {toilets.map((t, i) => (
            <option key={i}>{t.name} • {t.floor}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-[#1a1b5d] pointer-events-none" />
      </div>

      {/* 问题勾选 */}
      <div className="space-y-3">
        <h2 className="text-[#1a1b5d] font-bold text-sm">Select the problem(s)</h2>
        <div className="grid grid-cols-1 gap-3">
          {['No toilet paper', 'Soap empty', 'Broken lock', 'Dirty cubicle'].map((prob) => (
            <div 
              key={prob}
              onClick={() => toggleProblem(prob)}
              className={`flex items-center p-3 rounded-xl border transition-all ${
                selectedProblems.includes(prob) ? 'border-[#1a1b5d] bg-blue-50' : 'border-gray-100 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border mr-3 flex items-center justify-center ${
                selectedProblems.includes(prob) ? 'bg-[#1a1b5d] border-[#1a1b5d]' : 'border-gray-300'
              }`}>
                {selectedProblems.includes(prob) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm text-[#1a1b5d] font-medium">{prob}</span>
            </div>
          ))}
        </div>
      </div>

      <textarea
        value={otherDetails}
        onChange={(e) => setOtherDetails(e.target.value)}
        placeholder="Other details..."
        className="w-full bg-[#f4f5fa] rounded-xl p-4 text-sm h-24 focus:outline-none"
      />

      {/* 图片上传区域 */}
      <div className="space-y-3">
        <h2 className="text-[#1a1b5d] font-bold text-sm">Optional photo</h2>
        
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
            className="w-full border-2 border-dashed border-gray-100 bg-[#f8f9fc] rounded-2xl py-10 flex flex-col items-center justify-center group hover:bg-gray-50 transition-all"
          >
            <Camera className="w-8 h-8 text-[#1a1b5d] mb-2 opacity-40 group-hover:opacity-100" />
            <span className="text-xs text-[#1a1b5d] font-bold">Add a photo</span>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-in fade-in">
            <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
            <button 
              onClick={() => {setImageFile(null); setImagePreview(null);}}
              className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-[#1a1b5d] text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex justify-center items-center"
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit report'}
      </button>
    </div>
  );
}
