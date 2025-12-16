"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface FavoritePage {
  path: string;
  label: string;
  icon: string;
  timestamp: number;
}

const FAVORITES_KEY = "smartapd_favorites";
const MAX_FAVORITES = 8;

const pageIcons: Record<string, string> = {
  "/mobile": "📱",
  "/dashboard": "💻",
  "/monitoring": "📹",
  "/alerts": "🚨",
  "/reports": "📊",
  "/admin": "⚙️",
  "/settings": "🔧",
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const addFavorite = (path: string, label: string) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.path === path);
      if (exists) return prev;
      
      const updated = [
        { path, label, icon: pageIcons[path] || "📄", timestamp: Date.now() },
        ...prev
      ].slice(0, MAX_FAVORITES);
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (path: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.path !== path);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (path: string) => {
    return favorites.some(f => f.path === path);
  };

  const toggleFavorite = (path: string, label: string) => {
    if (isFavorite(path)) {
      removeFavorite(path);
    } else {
      addFavorite(path, label);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}
