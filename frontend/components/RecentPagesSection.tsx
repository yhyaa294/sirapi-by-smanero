"use client";

import { useRecentPages } from "@/hooks/useRecentPages";
import { Clock, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RecentPagesSection() {
  const { recentPages, clearRecentPages } = useRecentPages();
  const pathname = usePathname();

  if (recentPages.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Belum ada halaman yang dikunjungi
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {recentPages.map((page) => (
        <Link
          key={page.path}
          href={page.path}
          className={`
            flex items-center gap-3 p-2 rounded-lg text-sm transition-colors
            ${pathname === page.path 
              ? 'bg-orange-100 text-orange-700' 
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="flex-1 truncate">{page.label}</span>
        </Link>
      ))}
      
      {recentPages.length > 0 && (
        <button
          onClick={clearRecentPages}
          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 mt-2"
        >
          <X className="w-3 h-3" />
          Clear history
        </button>
      )}
    </div>
  );
}
