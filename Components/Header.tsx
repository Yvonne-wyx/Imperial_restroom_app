// components/Header.tsx
import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
      <h1 className="text-xl font-bold tracking-[0.2em] text-[#1a1b5d]">
        I M P E R I A L
      </h1>
      <button className="p-2 text-[#1a1b5d] hover:bg-gray-100 rounded-md">
        <Menu size={24} />
      </button>
    </header>
  );
}