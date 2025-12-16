import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters

# --- KONFIGURASI LOGGING ---
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# --- KREDENSIAL ---
TOKEN = "8302407915:AAG2JSTTiJdVnrKM8jElv-6ZTIawNMtJsgM"

# --- COMMAND HANDLERS ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handler untuk command /start.
    Menampilkan pesan sambutan dan menu tombol interaktif.
    """
    user_name = update.effective_user.first_name
    
    welcome_text = (
        f"👮‍♂️ *Halo Commander {user_name}!* \n\n"
        "Saya **AI Assistant SmartAPD**. Sistem pemantauan K3 aktif.\n"
        "Apa yang ingin Anda periksa hari ini?"
    )

    # Definisi Tombol Inline
    keyboard = [
        [
            InlineKeyboardButton("📸 Cek Live CCTV", callback_data='cek_cctv'),
            InlineKeyboardButton("📊 Status Laporan", callback_data='cek_status')
        ],
        [
            InlineKeyboardButton("🚨 Cek Pelanggaran", callback_data='cek_alert'),
            InlineKeyboardButton("📞 Kontak Admin", callback_data='kontak_admin')
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=welcome_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

# --- CALLBACK QUERY HANDLER (LOGIKA TOMBOL) ---

async def button_click(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Menangani klik tombol dari Inline Keyboard.
    """
    query = update.callback_query
    
    # Wajib di-answer agar loading di tombol hilang
    await query.answer()
    
    data = query.data
    
    if data == 'cek_cctv':
        # Kirim gambar dummy CCTV
        await context.bot.send_photo(
            chat_id=update.effective_chat.id,
            photo="https://placehold.co/600x400/1e293b/ffffff?text=CCTV+FEED+LIVE",
            caption="📡 **CCTV Gudang A - Online**\nKoneksi stabil. Latency: 24ms.",
            parse_mode='Markdown'
        )
        
    elif data == 'cek_status':
        await query.edit_message_text(
            text="📊 **Status Laporan Harian:**\n✅ Sistem Aman.\n✅ 0 Insiden Kritis hari ini.\n✅ 100% Pekerja terdeteksi memakai APD.",
            parse_mode='Markdown'
        )
        
    elif data == 'cek_alert':
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="⚠️ **PERINGATAN KESELAMATAN**\n\nDitemukan:\n- 3 Pelanggaran Helm di Zona B\n- 1 Pelanggaran Rompi di Loading Dock\n\n_Mohon segera ditinjau._",
            parse_mode='Markdown'
        )
        
    elif data == 'kontak_admin':
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="📞 **Kontak Admin Pusat:**\n\nMr. Safety Officer\nWA: 0812-3456-7890\nEmail: safety@smartapd.id",
            parse_mode='Markdown'
        )

# --- MESSAGE HANDLER (AUTO REPLY LOGIC) ---

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Menjawab pesan teks user secara otomatis (Simple AI Response).
    """
    text = update.message.text.lower()
    chat_id = update.effective_chat.id
    
    response = ""
    
    if any(word in text for word in ["halo", "hai", "pagi", "siang"]):
        response = "👋 Halo! Tetap utamakan keselamatan kerja ya pak. Ada yang bisa dibantu?"
        
    elif "helm" in text:
        response = "⛑️ **Aturan K3 Pasal 1:**\nHelm keselamatan wajib digunakan di semua zona konstruksi dan area berbahaya. Jangan lupa dipakai ya!"
        
    elif "laporan" in text:
        response = "📄 Laporan lengkap dapat diunduh melalui Dashboard Web SmartAPD.\nLogin di: `dashboard.smartapd.id`"
        
    elif "aman" in text or "status" in text:
        response = "🛡️ **Analisis AI:**\nBerdasarkan pantauan real-time, kondisi lapangan saat ini **98% AMAN**. Tidak ada anomali berat."
        
    else:
        response = "🤖 Maaf, saya hanya bot AI K3. Saya belum mengerti perintah tersebut.\n\nSilakan ketik **/start** untuk membuka menu utama."

    await context.bot.send_message(
        chat_id=chat_id,
        text=response,
        parse_mode='Markdown'
    )

# --- MAIN APPLICATION ---

if __name__ == '__main__':
    print("🚀 SmartAPD Assistant Bot sedang berjalan...")
    
    # Inisialisasi Aplikasi
    application = ApplicationBuilder().token(TOKEN).build()
    
    # Registrasi Handler
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CallbackQueryHandler(button_click))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
    
    # Jalankan Bot (Polling)
    application.run_polling()
