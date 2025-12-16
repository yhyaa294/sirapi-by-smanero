"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Filter, Search, Calendar, MapPin, User, Clock, CheckCircle, X } from "lucide-react";
import { api } from "@/services/api";

type Alert = {
  id: number;
  worker: string;
  violation: string;
  location: string;
  time: string;
  severity: "high" | "medium" | "low";
  status: "resolved" | "unresolved";
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const violationsData = await api.getViolations(50);
      const mappedAlerts = violationsData.map(v => ({
        ...v,
        severity: v.violation.toLowerCase().includes('helm') ? 'high' as const :
                  v.violation.toLowerCase().includes('rompi') ? 'medium' as const : 'low' as const
      }));
      setAlerts(mappedAlerts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "low": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "resolved" 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === "all" || alert.severity === filter;
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    const matchesSearch = searchTerm === "" || 
      alert.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.violation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesStatus && matchesSearch;
  });

  const resolveAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: "resolved" as const } : alert
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Alerts & Violations</h1>
          <p className="text-sm opacity-90">Monitor dan kelola pelanggaran keselamatan</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pekerja, pelanggaran, atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              aria-label="Filter by severity"
            >
              <option value="all">Semua Severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              <option value="all">Semua Status</option>
              <option value="unresolved">Belum Resolved</option>
              <option value="resolved">Sudah Resolved</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.severity === "high").length}</div>
              <div className="text-sm text-gray-600">High Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{alerts.filter(a => a.severity === "medium").length}</div>
              <div className="text-sm text-gray-600">Medium Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{alerts.filter(a => a.severity === "low").length}</div>
              <div className="text-sm text-gray-600">Low Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === "resolved").length}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Daftar Pelanggaran ({filteredAlerts.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data pelanggaran...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada pelanggaran</h3>
              <p className="text-gray-600">Semua pekerja patuh dengan standar keselamatan!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(alert.status)}`}>
                          {alert.status === "resolved" ? "RESOLVED" : "UNRESOLVED"}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.time}
                        </span>
                      </div>

                      <div className="mb-3">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {alert.worker}
                        </h3>
                        <p className="text-red-600 font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {alert.violation}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {alert.status === "unresolved" && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                      )}
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Mobile */}
        <div className="mt-6 text-center lg:hidden">
          <button
            onClick={() => window.location.href = '/mobile'}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Kembali ke Mobile Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
