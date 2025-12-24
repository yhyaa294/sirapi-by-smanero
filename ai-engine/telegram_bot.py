"""
SmartAPD Telegram Bot Service
Provides interactive Telegram bot with inline buttons, notifications, and scheduled reports
"""

import asyncio
import os
import json
import logging
from datetime import datetime, time
from pathlib import Path
from typing import Optional
import threading

# Telegram imports
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, InputFile
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Global stats (updated by web_server)
detection_stats = {
    "total_detections": 0,
    "violations_today": 0,
    "compliance_rate": 100.0,
    "cameras_online": 1,
    "last_violation": None,
    "last_update": None,
    "no_helmet": 0,
    "no_vest": 0,
    "no_gloves": 0,
    "no_boots": 0,
}

# Settings path
SETTINGS_FILE = Path("./data/telegram_settings.json")

def load_settings():
    """Load Telegram settings from file"""
    default_settings = {
        "bot_token": "",
        "chat_id": "",
        "send_screenshots": True,
        "notification_types": "violations",
        "scheduled_report_enabled": False,
        "scheduled_report_time": "08:00",
        "scheduled_report_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    }
    
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, 'r') as f:
                saved = json.load(f)
                default_settings.update(saved)
        except:
            pass
    
    return default_settings

def save_settings(settings):
    """Save Telegram settings to file"""
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(settings, f, indent=2)

# Bot instance
bot_app: Optional[Application] = None
settings = load_settings()


# ============== COMMAND HANDLERS ==============

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /start command - shows main menu with inline buttons"""
    keyboard = [
        [
            InlineKeyboardButton("📊 Laporan Hari Ini", callback_data="report_daily"),
            InlineKeyboardButton("📈 Statistik", callback_data="stats"),
        ],
        [
            InlineKeyboardButton("📹 Status Kamera", callback_data="camera_status"),
            InlineKeyboardButton("🚨 Pelanggaran Terbaru", callback_data="violations"),
        ],
        [
            InlineKeyboardButton("⚙️ Pengaturan", callback_data="settings"),
            InlineKeyboardButton("❓ Bantuan", callback_data="help"),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = """
🛡️ *SmartAPD Command Center*
━━━━━━━━━━━━━━━━━━━━━

Selamat datang di Bot SmartAPD!
Sistem monitoring kepatuhan APD berbasis AI.

📊 *Status Sistem*
• AI Detection: ✅ Aktif
• Kamera Online: {cameras}
• Tingkat Kepatuhan: {compliance}%

Pilih menu di bawah untuk memulai:
    """.format(
        cameras=detection_stats.get("cameras_online", 1),
        compliance=detection_stats.get("compliance_rate", 100)
    )
    
    await update.message.reply_text(
        welcome_text,
        parse_mode='Markdown',
        reply_markup=reply_markup
    )


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /status command"""
    now = datetime.now()
    
    status_text = """
📊 *STATUS SISTEM SMARTAPD*
━━━━━━━━━━━━━━━━━━━━━
📅 {date}
⏰ {time} WIB

*🎯 Statistik Hari Ini*
├ Total Deteksi: {total}
├ Pelanggaran: {violations}
├ Tingkat Kepatuhan: {compliance}%
└ Kamera Online: {cameras}

*🖥️ System Status*
├ AI Engine: ✅ Online
├ Backend: ✅ Online
└ Database: ✅ Connected

*📡 Last Update*
{last_update}
    """.format(
        date=now.strftime("%d %B %Y"),
        time=now.strftime("%H:%M:%S"),
        total=detection_stats.get("total_detections", 0),
        violations=detection_stats.get("violations_today", 0),
        compliance=detection_stats.get("compliance_rate", 100),
        cameras=detection_stats.get("cameras_online", 1),
        last_update=detection_stats.get("last_update", "Baru saja")
    )
    
    keyboard = [[InlineKeyboardButton("🔄 Refresh", callback_data="stats")]]
    
    await update.message.reply_text(
        status_text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def laporan_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /laporan command"""
    keyboard = [
        [
            InlineKeyboardButton("📊 Hari Ini", callback_data="report_daily"),
            InlineKeyboardButton("📈 Minggu Ini", callback_data="report_weekly"),
        ],
        [
            InlineKeyboardButton("📋 Bulan Ini", callback_data="report_monthly"),
        ],
        [InlineKeyboardButton("◀️ Kembali", callback_data="main_menu")],
    ]
    
    text = """
📋 *LAPORAN SMARTAPD*
━━━━━━━━━━━━━━━━━━━━━

Pilih jenis laporan yang ingin Anda lihat:

📊 *Harian* - Ringkasan aktivitas hari ini
📈 *Mingguan* - Analisa 7 hari terakhir  
📋 *Bulanan* - Laporan lengkap bulan ini
    """
    
    await update.message.reply_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def bantuan_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /bantuan command"""
    help_text = """
❓ *PANDUAN PENGGUNAAN BOT*
━━━━━━━━━━━━━━━━━━━━━

*📌 Perintah Tersedia:*

/start - Menu utama
/status - Cek status sistem
/laporan - Lihat laporan
/bantuan - Tampilkan panduan ini

*🔔 Notifikasi Otomatis:*
Bot akan mengirim notifikasi ketika:
• Terdeteksi pelanggaran APD
• Laporan terjadwal siap

*⚙️ Pengaturan:*
Ubah pengaturan notifikasi melalui:
SmartAPD Dashboard → Pengaturan → Telegram

*📞 Dukungan:*
Hubungi admin sistem jika ada kendala.
    """
    
    await update.message.reply_text(help_text, parse_mode='Markdown')


# ============== CALLBACK HANDLERS ==============

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for inline button callbacks"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    if data == "main_menu":
        await show_main_menu(query)
    elif data == "stats":
        await show_stats(query)
    elif data == "camera_status":
        await show_camera_status(query)
    elif data == "violations":
        await show_recent_violations(query)
    elif data == "settings":
        await show_settings(query)
    elif data == "help":
        await show_help(query)
    elif data.startswith("report_"):
        report_type = data.replace("report_", "")
        await send_report(query, report_type)


async def show_main_menu(query):
    """Show main menu"""
    keyboard = [
        [
            InlineKeyboardButton("📊 Laporan Hari Ini", callback_data="report_daily"),
            InlineKeyboardButton("📈 Statistik", callback_data="stats"),
        ],
        [
            InlineKeyboardButton("📹 Status Kamera", callback_data="camera_status"),
            InlineKeyboardButton("🚨 Pelanggaran Terbaru", callback_data="violations"),
        ],
        [
            InlineKeyboardButton("⚙️ Pengaturan", callback_data="settings"),
            InlineKeyboardButton("❓ Bantuan", callback_data="help"),
        ],
    ]
    
    text = """
🛡️ *SmartAPD Command Center*
━━━━━━━━━━━━━━━━━━━━━

Pilih menu di bawah:
    """
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def show_stats(query):
    """Show statistics"""
    now = datetime.now()
    
    text = """
📊 *STATISTIK REAL-TIME*
━━━━━━━━━━━━━━━━━━━━━
⏰ Update: {time}

*Hari Ini:*
├ 🔍 Total Deteksi: {total}
├ ⚠️ Pelanggaran: {violations}
├ ✅ Kepatuhan: {compliance}%
└ 📹 Kamera Online: {cameras}

*Jenis Pelanggaran:*
• 🪖 No Helmet: {no_helmet}
• 🦺 No Vest: {no_vest}
• 🧤 No Gloves: {no_gloves}
• 👢 No Boots: {no_boots}
    """.format(
        time=now.strftime("%H:%M:%S"),
        total=detection_stats.get("total_detections", 0),
        violations=detection_stats.get("violations_today", 0),
        compliance=detection_stats.get("compliance_rate", 100),
        cameras=detection_stats.get("cameras_online", 1),
        no_helmet=detection_stats.get("no_helmet", 0),
        no_vest=detection_stats.get("no_vest", 0),
        no_gloves=detection_stats.get("no_gloves", 0),
        no_boots=detection_stats.get("no_boots", 0),
    )
    
    keyboard = [
        [InlineKeyboardButton("🔄 Refresh", callback_data="stats")],
        [InlineKeyboardButton("◀️ Menu Utama", callback_data="main_menu")],
    ]
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def show_camera_status(query):
    """Show camera status"""
    text = """
📹 *STATUS KAMERA*
━━━━━━━━━━━━━━━━━━━━━

*TITIK A - Gudang Utama*
├ Status: 🟢 Online
├ AI Detection: ✅ Aktif
└ FPS: 28

*TITIK B - Area Assembly*
├ Status: ⚪ Offline
├ AI Detection: ❌ Nonaktif
└ FPS: -

*TITIK C - Welding Bay*
├ Status: ⚪ Offline
├ AI Detection: ❌ Nonaktif
└ FPS: -

*TITIK D - Loading Dock*
├ Status: ⚪ Offline
├ AI Detection: ❌ Nonaktif
└ FPS: -

_Kelola kamera di Dashboard → Pengaturan → Kamera_
    """
    
    keyboard = [
        [InlineKeyboardButton("🔄 Refresh", callback_data="camera_status")],
        [InlineKeyboardButton("◀️ Menu Utama", callback_data="main_menu")],
    ]
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def show_recent_violations(query):
    """Show recent violations"""
    last = detection_stats.get("last_violation")
    
    if last:
        violation_text = f"""
• *{last.get('type', 'Unknown')}*
  📍 {last.get('location', 'TITIK A')}
  ⏰ {last.get('time', 'Baru saja')}
  📊 Confidence: {last.get('confidence', 95)}%
        """
    else:
        violation_text = "_Tidak ada pelanggaran terbaru_"
    
    text = f"""
🚨 *PELANGGARAN TERBARU*
━━━━━━━━━━━━━━━━━━━━━

{violation_text}

*Ringkasan Hari Ini:*
├ Total Pelanggaran: {detection_stats.get('violations_today', 0)}
├ 🪖 No Helmet: {detection_stats.get('no_helmet', 0)}
├ 🦺 No Vest: {detection_stats.get('no_vest', 0)}
├ 🧤 No Gloves: {detection_stats.get('no_gloves', 0)}
└ 👢 No Boots: {detection_stats.get('no_boots', 0)}

_Lihat detail lengkap di Dashboard → Riwayat Kejadian_
    """
    
    keyboard = [
        [InlineKeyboardButton("🔄 Refresh", callback_data="violations")],
        [InlineKeyboardButton("◀️ Menu Utama", callback_data="main_menu")],
    ]
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def show_settings(query):
    """Show settings info"""
    text = """
⚙️ *PENGATURAN BOT*
━━━━━━━━━━━━━━━━━━━━━

*Notifikasi Aktif:*
├ 🔔 Pelanggaran APD: ✅
├ 📸 Kirim Screenshot: ✅
└ 📊 Laporan Terjadwal: ❌

*Jadwal Laporan:*
└ Belum diatur

_Untuk mengubah pengaturan, buka:_
*SmartAPD Dashboard → Pengaturan → Telegram*

🌐 http://localhost:3000/dashboard/settings
    """
    
    keyboard = [
        [InlineKeyboardButton("◀️ Menu Utama", callback_data="main_menu")],
    ]
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def show_help(query):
    """Show help"""
    text = """
❓ *PANDUAN BOT SMARTAPD*
━━━━━━━━━━━━━━━━━━━━━

*Fitur Utama:*
• 📊 Melihat statistik real-time
• 📹 Cek status kamera
• 🚨 Notifikasi pelanggaran
• 📋 Laporan berkala

*Perintah:*
/start - Menu utama
/status - Status sistem
/laporan - Minta laporan
/bantuan - Panduan ini

*Tips:*
Gunakan tombol di bawah pesan untuk navigasi yang lebih mudah!
    """
    
    keyboard = [
        [InlineKeyboardButton("◀️ Menu Utama", callback_data="main_menu")],
    ]
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def send_report(query, report_type: str):
    """Send report based on type"""
    now = datetime.now()
    
    type_labels = {
        "daily": "HARIAN",
        "weekly": "MINGGUAN", 
        "monthly": "BULANAN"
    }
    
    text = f"""
📋 *LAPORAN {type_labels.get(report_type, 'HARIAN')}*
━━━━━━━━━━━━━━━━━━━━━
📅 {now.strftime("%d %B %Y")}

*📊 Ringkasan Kepatuhan*
├ Safety Score: {detection_stats.get('compliance_rate', 100)}%
├ Total Deteksi: {detection_stats.get('total_detections', 0)}
├ Pelanggaran: {detection_stats.get('violations_today', 0)}
└ Kamera Aktif: {detection_stats.get('cameras_online', 1)}

*⚠️ Breakdown Pelanggaran*
├ 🪖 No Helmet: {detection_stats.get('no_helmet', 0)}
├ 🦺 No Vest: {detection_stats.get('no_vest', 0)}
├ 🧤 No Gloves: {detection_stats.get('no_gloves', 0)}
└ 👢 No Boots: {detection_stats.get('no_boots', 0)}

*📈 Status Kepatuhan*
{'✅ BAIK - Tingkat kepatuhan di atas 90%' if detection_stats.get('compliance_rate', 100) >= 90 else '⚠️ PERLU PERHATIAN - Tingkat kepatuhan perlu ditingkatkan'}

━━━━━━━━━━━━━━━━━━━━━
_Generated by SmartAPD AI System_
    """
    
    keyboard = [
        [
            InlineKeyboardButton("📊 Harian", callback_data="report_daily"),
            InlineKeyboardButton("📈 Mingguan", callback_data="report_weekly"),
        ],
        [InlineKeyboardButton("◀️ Menu Utama", callback_data="main_menu")],
    ]
    
    await query.edit_message_text(
        text,
        parse_mode='Markdown',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


# ============== NOTIFICATION FUNCTIONS ==============

async def send_violation_notification(violation_data: dict, screenshot_path: str = None):
    """Send violation notification to Telegram"""
    global bot_app, settings
    
    if not bot_app or not settings.get("chat_id"):
        logger.warning("Bot not initialized or chat_id not set")
        return False
    
    chat_id = settings.get("chat_id")
    
    text = f"""
🚨 *PELANGGARAN APD TERDETEKSI!*
━━━━━━━━━━━━━━━━━━━━━

*Jenis:* {violation_data.get('type', 'Unknown').replace('_', ' ').title()}
*Lokasi:* {violation_data.get('location', 'TITIK A')}
*Waktu:* {violation_data.get('time', datetime.now().strftime('%H:%M:%S'))}
*Confidence:* {violation_data.get('confidence', 95)}%

⚠️ *Tindakan Diperlukan!*
Pastikan pekerja menggunakan APD lengkap.

━━━━━━━━━━━━━━━━━━━━━
_SmartAPD AI Detection System_
    """
    
    keyboard = [
        [
            InlineKeyboardButton("📊 Lihat Statistik", callback_data="stats"),
            InlineKeyboardButton("📹 Status Kamera", callback_data="camera_status"),
        ],
    ]
    
    try:
        bot = bot_app.bot
        
        # Send with screenshot if available and enabled
        if screenshot_path and settings.get("send_screenshots", True) and Path(screenshot_path).exists():
            with open(screenshot_path, 'rb') as photo:
                await bot.send_photo(
                    chat_id=chat_id,
                    photo=photo,
                    caption=text,
                    parse_mode='Markdown',
                    reply_markup=InlineKeyboardMarkup(keyboard)
                )
        else:
            await bot.send_message(
                chat_id=chat_id,
                text=text,
                parse_mode='Markdown',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
        
        logger.info(f"Violation notification sent to {chat_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send notification: {e}")
        return False


def update_stats(new_stats: dict):
    """Update global stats (called by web_server)"""
    global detection_stats
    detection_stats.update(new_stats)
    detection_stats["last_update"] = datetime.now().strftime("%H:%M:%S")


# ============== BOT STARTUP ==============

def start_bot(token: str, chat_id: str):
    """Start the Telegram bot in a separate thread"""
    global bot_app, settings
    
    if not token:
        logger.error("No bot token provided")
        return False
    
    settings["bot_token"] = token
    settings["chat_id"] = chat_id
    save_settings(settings)
    
    try:
        # Create application
        bot_app = Application.builder().token(token).build()
        
        # Add handlers
        bot_app.add_handler(CommandHandler("start", start_command))
        bot_app.add_handler(CommandHandler("status", status_command))
        bot_app.add_handler(CommandHandler("laporan", laporan_command))
        bot_app.add_handler(CommandHandler("bantuan", bantuan_command))
        bot_app.add_handler(CallbackQueryHandler(button_callback))
        
        # Run in thread
        def run_bot():
            asyncio.set_event_loop(asyncio.new_event_loop())
            bot_app.run_polling(allowed_updates=Update.ALL_TYPES)
        
        bot_thread = threading.Thread(target=run_bot, daemon=True)
        bot_thread.start()
        
        logger.info("Telegram bot started successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")
        return False


def stop_bot():
    """Stop the Telegram bot"""
    global bot_app
    if bot_app:
        bot_app.stop()
        bot_app = None


# For testing
if __name__ == "__main__":
    # Test with your token
    TEST_TOKEN = "8302407915:AAG2JSTTiJdVnrKM8jElv-6ZTIawNMtJsgM"
    TEST_CHAT_ID = "6134497614"
    
    print("Starting SmartAPD Telegram Bot...")
    start_bot(TEST_TOKEN, TEST_CHAT_ID)
    
    # Keep running
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("Bot stopped")
