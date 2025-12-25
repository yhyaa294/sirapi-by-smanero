'use client';

import { useState, useEffect } from 'react';
import {
    Shield, Activity, FileText, Laptop, Clock, MapPin,
    RefreshCw, Trash2, LogOut, Settings, Eye, User,
    CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface LoginActivity {
    id: number;
    user_id?: number;
    email: string;
    ip_address: string;
    user_agent: string;
    success: boolean;
    fail_reason?: string;
    created_at: string;
}

interface AuditLogEntry {
    id: number;
    user_id: number;
    action: string;
    resource: string;
    resource_id?: number;
    details: string;
    ip_address: string;
    created_at: string;
}

interface Session {
    id: number;
    device_name: string;
    ip_address: string;
    user_agent: string;
    last_active: string;
    created_at: string;
}

interface SecuritySettings {
    max_login_attempts: number;
    lockout_duration: number;
    session_timeout: number;
    ip_whitelist: string;
    two_factor_enabled: boolean;
}

const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    login: 'bg-purple-100 text-purple-700',
    logout: 'bg-gray-100 text-gray-700',
};

export default function SecurityPage() {
    const [tab, setTab] = useState<'activity' | 'audit' | 'sessions' | 'settings'>('activity');
    const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [settings, setSettings] = useState<SecuritySettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tab === 'activity') {
                const res = await fetch(`${API_BASE}/security/login-activity`);
                const data = await res.json();
                setLoginActivity(data.data || []);
            } else if (tab === 'audit') {
                const res = await fetch(`${API_BASE}/security/audit-log`);
                const data = await res.json();
                setAuditLogs(data.data || []);
            } else if (tab === 'sessions') {
                const res = await fetch(`${API_BASE}/security/sessions`);
                const data = await res.json();
                setSessions(data.data || []);
            } else if (tab === 'settings') {
                const res = await fetch(`${API_BASE}/security/settings`);
                const data = await res.json();
                setSettings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [tab]);

    const revokeSession = async (id: number) => {
        await fetch(`${API_BASE}/security/sessions/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const revokeAllSessions = async () => {
        await fetch(`${API_BASE}/security/sessions`, { method: 'DELETE' });
        fetchData();
    };

    const saveSettings = async () => {
        if (!settings) return;
        await fetch(`${API_BASE}/security/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        alert('Settings saved!');
    };

    const tabs = [
        { id: 'activity', label: 'Login Activity', icon: Activity },
        { id: 'audit', label: 'Audit Log', icon: FileText },
        { id: 'sessions', label: 'Active Sessions', icon: Laptop },
        { id: 'settings', label: 'Security Settings', icon: Settings },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-xl">
                        <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
                        <p className="text-gray-500">Monitor login activity, sessions, and security settings</p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${tab === t.id
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="py-12 text-center text-gray-500">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* LOGIN ACTIVITY */}
                        {tab === 'activity' && (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">IP Address</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Device</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loginActivity.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No login activity recorded</td></tr>
                                    ) : (
                                        loginActivity.map((a) => (
                                            <tr key={a.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    {a.success ? (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle className="w-4 h-4" /> Success
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600">
                                                            <XCircle className="w-4 h-4" /> {a.fail_reason || 'Failed'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium">{a.email}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{a.ip_address}</td>
                                                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{a.user_agent}</td>
                                                <td className="px-4 py-3 text-gray-500">{new Date(a.created_at).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* AUDIT LOG */}
                        {tab === 'audit' && (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Resource</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {auditLogs.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No audit logs yet</td></tr>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100'}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {log.resource} {log.resource_id && `#${log.resource_id}`}
                                                </td>
                                                <td className="px-4 py-3">User #{log.user_id}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{log.ip_address}</td>
                                                <td className="px-4 py-3 text-gray-500">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* SESSIONS */}
                        {tab === 'sessions' && (
                            <div>
                                <div className="p-4 border-b flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{sessions.length} active sessions</span>
                                    <button
                                        onClick={revokeAllSessions}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Revoke All Others
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {sessions.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500">No active sessions</div>
                                    ) : (
                                        sessions.map((s) => (
                                            <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Laptop className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{s.device_name || 'Unknown Device'}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-3">
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.ip_address}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {new Date(s.last_active).toLocaleString('id-ID')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => revokeSession(s.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SETTINGS */}
                        {tab === 'settings' && settings && (
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                                        <input
                                            type="number"
                                            value={settings.max_login_attempts}
                                            onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lock account after X failed attempts</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (min)</label>
                                        <input
                                            type="number"
                                            value={settings.lockout_duration}
                                            onChange={(e) => setSettings({ ...settings, lockout_duration: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (min)</label>
                                        <input
                                            type="number"
                                            value={settings.session_timeout}
                                            onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Two-Factor Auth</label>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.two_factor_enabled}
                                                onChange={(e) => setSettings({ ...settings, two_factor_enabled: e.target.checked })}
                                                className="w-5 h-5 rounded"
                                            />
                                            <span>Enable 2FA</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                                    <textarea
                                        value={settings.ip_whitelist}
                                        onChange={(e) => setSettings({ ...settings, ip_whitelist: e.target.value })}
                                        placeholder="192.168.1.1, 10.0.0.0/24"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Comma-separated IPs. Leave blank to allow all.</p>
                                </div>
                                <button
                                    onClick={saveSettings}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                                >
                                    Save Settings
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
