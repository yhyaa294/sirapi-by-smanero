"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Camera, Users, AlertTriangle, Settings } from "lucide-react";

type Camera = {
  id: number;
  name: string;
  location: string;
  rtsp_url: string;
  status: "online" | "offline";
};

type Tab = "cameras" | "workers" | "violations";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("cameras");
  const [cameras, setCameras] = useState<Camera[]>([
    { id: 1, name: "CCTV Workshop A", location: "Workshop A", rtsp_url: "rtsp://192.168.1.100:554", status: "online" },
    { id: 2, name: "CCTV Gudang", location: "Gudang Utama", rtsp_url: "rtsp://192.168.1.101:554", status: "online" }
  ]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleSave = () => {
    if (editingId === -1) {
      setCameras([...cameras, { ...formData, id: Date.now(), status: "offline" }]);
    } else {
      setCameras(cameras.map(c => c.id === editingId ? { ...c, ...formData } : c));
    }
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus?")) {
      setCameras(cameras.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Admin Panel - SmartAPD™</h1>
          <p className="text-sm opacity-90">Kelola Data Sistem Tanpa Coding</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Kelola Kamera CCTV</h2>
          <button
            onClick={() => { setEditingId(-1); setFormData({}); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Kamera
          </button>
        </div>

        {editingId !== null && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-orange-500">
            <h3 className="font-bold text-lg mb-4">{editingId === -1 ? "Tambah Kamera" : "Edit Kamera"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                placeholder="Nama Kamera"
              />
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                placeholder="Lokasi"
              />
              <input
                type="text"
                value={formData.rtsp_url || ""}
                onChange={(e) => setFormData({ ...formData, rtsp_url: e.target.value })}
                className="col-span-2 px-3 py-2 border rounded-lg"
                placeholder="RTSP URL"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Simpan
              </button>
              <button onClick={() => { setEditingId(null); setFormData({}); }} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4" />
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-semibold">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-semibold">RTSP URL</th>
                <th className="px-6 py-3 text-left text-xs font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cameras.map((camera) => (
                <tr key={camera.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{camera.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{camera.name}</td>
                  <td className="px-6 py-4 text-sm">{camera.location}</td>
                  <td className="px-6 py-4 text-xs font-mono">{camera.rtsp_url}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${camera.status === "online" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {camera.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingId(camera.id); setFormData(camera); }} 
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit camera"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(camera.id)} 
                        className="text-red-600 hover:text-red-800"
                        aria-label="Delete camera"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
