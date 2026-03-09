"use client";

import { useState, useEffect } from "react";
import {
    Send,
    Trash2,
    Plus,
    RefreshCw,
    CheckCircle,
    XCircle,
    ExternalLink,
    Copy,
    MessageCircle,
    Users,
    User,
    Bot,
    Link2,
    Hash,
} from "lucide-react";

interface TelegramStatus {
    status: "active" | "inactive";
    bot_username: string;
    registered_chats: number;
    mode: string;
}

interface TelegramChat {
    chat_id: number;
    title: string;
    chat_type: string;
    username?: string;
    is_active: boolean;
    created_at: string;
}

interface RegistrationLink {
    token: string;
    deep_link: string;
    expires_at: string;
}

export default function TelegramSettings() {
    const [status, setStatus] = useState<TelegramStatus | null>(null);
    const [chats, setChats] = useState<TelegramChat[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"link" | "manual">("link");

    // Registration link state
    const [regLink, setRegLink] = useState<RegistrationLink | null>(null);
    const [generatingLink, setGeneratingLink] = useState(false);

    // Manual add state
    const [manualChatId, setManualChatId] = useState("");
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        valid: boolean;
        message: string;
    } | null>(null);
    const [adding, setAdding] = useState(false);

    // Test/Delete states
    const [testing, setTesting] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Toast state
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch status and chats
    const fetchData = async () => {
        try {
            const [statusRes, chatsRes] = await Promise.all([
                fetch("http://localhost:8080/api/v1/telegram/status"),
                fetch("http://localhost:8080/api/v1/telegram/chats"),
            ]);

            if (statusRes.ok) {
                setStatus(await statusRes.json());
            }
            if (chatsRes.ok) {
                const data = await chatsRes.json();
                setChats(data.chats || []);
            }
        } catch (error) {
            console.error("Failed to fetch telegram data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Generate registration link
    const generateLink = async () => {
        setGeneratingLink(true);
        try {
            const res = await fetch(
                "http://localhost:8080/api/v1/telegram/registrations/create",
                { method: "POST" }
            );
            if (res.ok) {
                const data = await res.json();
                setRegLink(data);
            } else {
                showToast("Gagal membuat link registrasi", "error");
            }
        } catch (error) {
            showToast("Gagal membuat link registrasi", "error");
        } finally {
            setGeneratingLink(false);
        }
    };

    // Add chat manually
    const addChatManually = async () => {
        if (!manualChatId) return;

        setAdding(true);
        try {
            const res = await fetch(
                "http://localhost:8080/api/v1/telegram/chats/manual-add",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: parseInt(manualChatId) }),
                }
            );

            if (res.ok) {
                showToast("Chat berhasil ditambahkan!", "success");
                setManualChatId("");
                setValidationResult(null);
                setShowAddModal(false);
                fetchData();
            } else {
                const data = await res.json();
                showToast(data.error || "Gagal menambahkan chat", "error");
            }
        } catch (error) {
            showToast("Gagal menambahkan chat", "error");
        } finally {
            setAdding(false);
        }
    };

    // Test connection
    const testChat = async (chatId: number) => {
        setTesting(chatId);
        try {
            const res = await fetch(
                `http://localhost:8080/api/v1/telegram/chats/${chatId}/test`,
                { method: "POST" }
            );

            if (res.ok) {
                showToast("Pesan test berhasil dikirim! ✅", "success");
            } else {
                showToast("Gagal mengirim pesan test", "error");
            }
        } catch (error) {
            showToast("Gagal mengirim pesan test", "error");
        } finally {
            setTesting(null);
        }
    };

    // Delete chat
    const deleteChat = async (chatId: number) => {
        if (!confirm("Yakin ingin menghapus chat ini?")) return;

        setDeleting(chatId);
        try {
            const res = await fetch(
                `http://localhost:8080/api/v1/telegram/chats/${chatId}`,
                { method: "DELETE" }
            );

            if (res.ok) {
                showToast("Chat berhasil dihapus", "success");
                fetchData();
            } else {
                showToast("Gagal menghapus chat", "error");
            }
        } catch (error) {
            showToast("Gagal menghapus chat", "error");
        } finally {
            setDeleting(null);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Link disalin ke clipboard!", "success");
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-slate-200 rounded-xl" />
                <div className="h-48 bg-slate-200 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === "success"
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                        }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle size={18} />
                    ) : (
                        <XCircle size={18} />
                    )}
                    {toast.message}
                </div>
            )}

            {/* Status Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Telegram Bot</h3>
                            <p className="text-blue-100 text-sm">Central Bot • SiRapi</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <span
                                className={`w-3 h-3 rounded-full ${status?.status === "active"
                                    ? "bg-emerald-400 animate-pulse"
                                    : "bg-red-400"
                                    }`}
                            />
                            <span className="font-semibold">
                                {status?.status === "active" ? "Aktif" : "Tidak Aktif"}
                            </span>
                        </div>
                        {status?.bot_username && (
                            <p className="text-blue-100 text-sm mt-1">
                                @{status.bot_username}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{chats.length}</p>
                            <p className="text-xs text-blue-100">Chat Terdaftar</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Tambah Chat
                    </button>
                </div>
            </div>

            {/* Chat List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <MessageCircle size={18} className="text-blue-500" />
                        Chat Terdaftar
                    </h3>
                    <button
                        onClick={fetchData}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className="text-slate-600" />
                    </button>
                </div>

                {chats.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <MessageCircle size={48} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">Belum ada chat terdaftar</p>
                        <p className="text-sm mt-1">
                            Klik "Tambah Chat" untuk mendaftarkan chat Telegram
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {chats.map((chat) => (
                            <div
                                key={chat.chat_id}
                                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-lg ${chat.chat_type === "private"
                                            ? "bg-blue-100 text-blue-600"
                                            : chat.chat_type === "group"
                                                ? "bg-emerald-100 text-emerald-600"
                                                : "bg-purple-100 text-purple-600"
                                            }`}
                                    >
                                        {chat.chat_type === "private" ? (
                                            <User size={18} />
                                        ) : (
                                            <Users size={18} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {chat.title || chat.username || "Chat"}
                                        </p>
                                        <p className="text-xs text-slate-500 font-mono">
                                            ID: {chat.chat_id}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${chat.is_active
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {chat.chat_type}
                                    </span>
                                    <button
                                        onClick={() => testChat(chat.chat_id)}
                                        disabled={testing === chat.chat_id}
                                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors disabled:opacity-50"
                                        title="Test"
                                    >
                                        {testing === chat.chat_id ? (
                                            <RefreshCw size={16} className="animate-spin" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => deleteChat(chat.chat_id)}
                                        disabled={deleting === chat.chat_id}
                                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors disabled:opacity-50"
                                        title="Hapus"
                                    >
                                        {deleting === chat.chat_id ? (
                                            <RefreshCw size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Chat Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-900">Tambah Chat Telegram</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setRegLink(null);
                                    setManualChatId("");
                                    setValidationResult(null);
                                }}
                                className="p-2 hover:bg-slate-200 rounded-lg"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab("link")}
                                className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === "link"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <Link2 size={16} className="inline mr-2" />
                                Via Deep Link
                            </button>
                            <button
                                onClick={() => setActiveTab("manual")}
                                className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === "manual"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <Hash size={16} className="inline mr-2" />
                                Input Chat ID
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "link" ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                                        <p className="font-medium mb-2">Cara Mendaftarkan:</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Klik tombol "Generate Link" di bawah</li>
                                            <li>Buka link di Telegram</li>
                                            <li>Tekan Start untuk mendaftarkan chat</li>
                                        </ol>
                                    </div>

                                    {!regLink ? (
                                        <button
                                            onClick={generateLink}
                                            disabled={generatingLink}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {generatingLink ? (
                                                <>
                                                    <RefreshCw size={18} className="animate-spin" />
                                                    Membuat Link...
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 size={18} />
                                                    Generate Link
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="bg-slate-100 p-3 rounded-xl">
                                                <p className="text-xs text-slate-500 mb-1">
                                                    Deep Link:
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs text-slate-700 flex-1 truncate">
                                                        {regLink.deep_link}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(regLink.deep_link)}
                                                        className="p-2 hover:bg-slate-200 rounded-lg"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <a
                                                href={regLink.deep_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                            >
                                                <ExternalLink size={18} />
                                                Buka di Telegram
                                            </a>

                                            <p className="text-xs text-slate-500 text-center">
                                                ⏱️ Link expired dalam 10 menit
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-amber-50 p-4 rounded-xl text-sm text-amber-800">
                                        <p className="font-medium mb-2">Cara Mendapat Chat ID:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>
                                                • <b>Private:</b> Kirim /start ke @userinfobot
                                            </li>
                                            <li>
                                                • <b>Group:</b> Tambahkan @RawDataBot ke grup
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Chat ID
                                        </label>
                                        <input
                                            type="text"
                                            value={manualChatId}
                                            onChange={(e) => {
                                                setManualChatId(e.target.value);
                                                setValidationResult(null);
                                            }}
                                            placeholder="Contoh: 123456789 atau -1001234567890"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    {validationResult && (
                                        <div
                                            className={`p-3 rounded-xl text-sm ${validationResult.valid
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {validationResult.valid ? "✅ " : "❌ "}
                                            {validationResult.message}
                                        </div>
                                    )}

                                    <button
                                        onClick={addChatManually}
                                        disabled={!manualChatId || adding}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {adding ? (
                                            <>
                                                <RefreshCw size={18} className="animate-spin" />
                                                Menambahkan...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                Tambahkan Chat
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
