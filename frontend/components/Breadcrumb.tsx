"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

const breadcrumbLabels: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/mobile": "Mobile Dashboard",
  "/monitoring": "CCTV Monitoring",
  "/alerts": "Alerts & Violations",
  "/reports": "Reports",
  "/admin": "Admin Panel",
  "/settings": "Settings",
  "/admin/cameras": "Cameras",
  "/admin/workers": "Workers",
  "/admin/violations": "Violation Types",
};

export default function Breadcrumb() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const label = breadcrumbLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { path, label };
  });

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </li>
          
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link 
                  href={crumb.path} 
                  className="text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
