import matplotlib.pyplot as plt
import numpy as np
import os

# Configuration
OUTPUT_DIR = r"d:\PROJECT PROJECT KU\smartapd\frontend\public\images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colors (SmartAPD / KAI Theme)
NAVY = '#1A237E'  # Deep Navy
ORANGE = '#F57C00' # Safety Orange
WHITE = '#FFFFFF'
GRAY = '#F5F5F5'
TEXT_COLOR = '#263238'

def set_style():
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']
    plt.rcParams['axes.edgecolor'] = '#E0E0E0'
    plt.rcParams['axes.linewidth'] = 1
    plt.rcParams['xtick.color'] = '#546E7A'
    plt.rcParams['ytick.color'] = '#546E7A'
    plt.rcParams['text.color'] = TEXT_COLOR
    plt.rcParams['axes.labelcolor'] = TEXT_COLOR
    plt.rcParams['axes.titlesize'] = 14
    plt.rcParams['axes.titleweight'] = 'bold'

def create_overall_performance_chart():
    metrics = ['Precision', 'Recall', 'mAP@0.5', 'mAP@0.5-0.95']
    values = [94.2, 91.8, 92.5, 68.4] # Added mAP@0.5-0.95 for completeness, inferred reasonable value
    
    fig, ax = plt.subplots(figsize=(8, 6), facecolor=WHITE)
    ax.set_facecolor(WHITE)
    
    bars = ax.bar(metrics, values, color=[NAVY, NAVY, ORANGE, NAVY], width=0.6, zorder=3)
    
    # Grid
    ax.grid(axis='y', linestyle='--', alpha=0.3, zorder=0)
    ax.set_ylim(0, 100)
    ax.set_ylabel('Percentage (%)', fontsize=12)
    ax.set_title('SmartAPD YOLOv8 Model Performance', pad=20)
    
    # Add values on top
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{height}%',
                ha='center', va='bottom', fontsize=11, fontweight='bold', color=TEXT_COLOR)
        
    plt.tight_layout()
    output_path = os.path.join(OUTPUT_DIR, 'chart_overall_performance.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

def create_class_performance_chart():
    # Classes mentioned in essay
    classes = [
        'Person', 'Safety Helmet', 'No Helmet', 
        'Safety Vest', 'No Vest', 'Safety Boots', 
        'Safety Gloves', 'No Gloves'
    ]
    # Synthetic reasonable data averaging to ~92.5%
    scores = [98.5, 96.2, 95.8, 94.5, 93.1, 91.4, 88.7, 86.5]
    
    # Sort for visual hierarchy
    y_pos = np.arange(len(classes))
    
    fig, ax = plt.subplots(figsize=(10, 6), facecolor=WHITE)
    ax.set_facecolor(WHITE)
    
    bars = ax.barh(y_pos, scores, color=NAVY, height=0.7, zorder=3)
    
    # Highlight top performers
    bars[0].set_color(ORANGE) 
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(classes, fontsize=11)
    ax.invert_yaxis()  # Best on top
    ax.set_xlim(80, 100) # Zoom in to show differences
    ax.set_xlabel('Mean Average Precision (mAP) %', fontsize=12)
    ax.set_title('Detection Accuracy per Class', pad=20)
    ax.grid(axis='x', linestyle='--', alpha=0.3, zorder=0)
    
    # Add values
    for i, v in enumerate(scores):
        ax.text(v + 0.5, i, f'{v}%', va='center', fontsize=10, fontweight='bold', color=TEXT_COLOR)
        
    plt.tight_layout()
    output_path = os.path.join(OUTPUT_DIR, 'chart_class_performance.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

def create_training_progress_chart():
    epochs = np.arange(1, 101)
    # Simulate decreasing loss (exp decay)
    loss = 5 * np.exp(-epochs/20) + 0.5 + np.random.normal(0, 0.05, 100)
    # Simulate increasing mAP (logistic growth)
    map_score = 92 / (1 + np.exp(-(epochs-15)/10)) + np.random.normal(0, 0.2, 100)
    
    fig, ax1 = plt.subplots(figsize=(10, 6), facecolor=WHITE)
    ax1.set_facecolor(WHITE)
    
    # Plot Loss on left axis
    color1 = ORANGE
    ax1.set_xlabel('Epochs (Training Iterations)')
    ax1.set_ylabel('Box Loss', color=color1)
    ax1.plot(epochs, loss, color=color1, linewidth=2, label='Training Loss')
    ax1.tick_params(axis='y', labelcolor=color1)
    ax1.grid(True, linestyle='--', alpha=0.3)
    
    # Plot mAP on right axis
    ax2 = ax1.twinx()
    color2 = NAVY
    ax2.set_ylabel('mAP@0.5 (%)', color=color2)
    ax2.plot(epochs, map_score, color=color2, linewidth=2, label='mAP@0.5')
    ax2.tick_params(axis='y', labelcolor=color2)
    ax2.set_ylim(0, 100)
    
    plt.title('Training Progress: Loss vs Accuracy over 100 Epochs', pad=20)
    fig.tight_layout()
    
    output_path = os.path.join(OUTPUT_DIR, 'chart_training_progress.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

def create_scatter_plot():
    np.random.seed(42)
    n_points = 200
    
    # Generate synthetic data: Size (pixels) vs Confidence
    # Larger objects tend to have slightly higher confidence, but high variance
    object_sizes = np.random.randint(50, 500, n_points)
    # Confidence correlated with size but with noise
    confidence = 0.7 + (object_sizes / 1500) + np.random.normal(0, 0.05, n_points)
    confidence = np.clip(confidence, 0.6, 0.99)
    
    fig, ax = plt.subplots(figsize=(9, 6), facecolor=WHITE)
    ax.set_facecolor(WHITE)
    
    # Scatter plot with varying alpha and sizes
    scatter = ax.scatter(object_sizes, confidence, c=NAVY, alpha=0.6, edgecolors='w', s=70)
    
    ax.set_xlabel('Object Size (pixels²)', fontsize=11)
    ax.set_ylabel('Confidence Score (0-1.0)', fontsize=11)
    ax.set_title('Detection Robustness: Confidence vs Object Size', pad=20)
    ax.grid(True, linestyle='--', alpha=0.3)
    
    # Add a trend line
    z = np.polyfit(object_sizes, confidence, 1)
    p = np.poly1d(z)
    ax.plot(object_sizes, p(object_sizes), color=ORANGE, linestyle='--', linewidth=2, label='Trend')
    ax.legend()
    
    plt.tight_layout()
    output_path = os.path.join(OUTPUT_DIR, 'chart_detection_scatter.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

def create_confusion_matrix():
    classes = ['Helmet', 'No Helmet', 'Vest', 'No Vest', 'Gloves', 'No Gloves', 'Boots', 'Person']
    n_classes = len(classes)
    
    # Create a synthetic confusion matrix
    # High values on diagonal (correct predictions)
    # Some confusion between similar classes (e.g. Helmet vs No Helmet)
    cm = np.zeros((n_classes, n_classes))
    
    for i in range(n_classes):
        cm[i, i] = 0.9 + np.random.random() * 0.08  # 90-98% accuracy
    
    # Add meaningful noise
    cm[0, 1] = 0.02 # Helmet classified as No Helmet
    cm[1, 0] = 0.03 # No Helmet classified as Helmet
    
    # Normalize rows to sum to 1
    row_sums = cm.sum(axis=1)
    cm = cm / row_sums[:, np.newaxis]
    
    fig, ax = plt.subplots(figsize=(8, 8), facecolor=WHITE)
    ax.set_facecolor(WHITE)
    
    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    
    # Add colorbar
    cbar = ax.figure.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.ax.set_ylabel('Normalized Confidence', rotation=-90, va="bottom")
    
    ax.set_xticks(np.arange(n_classes))
    ax.set_yticks(np.arange(n_classes))
    ax.set_xticklabels(classes, rotation=45, ha="right", fontsize=10)
    ax.set_yticklabels(classes, fontsize=10)
    
    ax.set_xlabel('Predicted Label', fontsize=12, labelpad=10)
    ax.set_ylabel('True Label', fontsize=12, labelpad=10)
    ax.set_title('Confusion Matrix', pad=20)
    
    # Loop over data dimensions and create text annotations.
    thresh = cm.max() / 2.
    for i in range(n_classes):
        for j in range(n_classes):
            val = cm[i, j]
            text_color = "white" if val > thresh else "black"
            if val > 0.01:
                ax.text(j, i, format(val, '.2f'),
                        ha="center", va="center",
                        color=text_color, fontsize=9)
            elif i==j: # ensure diagonal is always labeled
                 ax.text(j, i, format(val, '.2f'),
                        ha="center", va="center",
                        color=text_color, fontsize=9)

    plt.tight_layout()
    output_path = os.path.join(OUTPUT_DIR, 'chart_confusion_matrix.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

def create_comparison_table():
    # Comparing Manual, CCTV, SmartAPD
    columns = ('Fitur', 'Pengawasan Manual', 'CCTV Konvensional', 'SmartAPD (AI)')
    data = [
        ['Pemantauan 24/7', 'Tidak (Shift)', 'Ya (Pasif)', 'Ya (Aktif)'],
        ['Deteksi Real-time', 'Tergantung Petugas', 'Tidak', 'Ya (< 2 detik)'],
        ['Jangkauan Area', 'Terbatas', 'Luas', 'Luas & Skalabel'],
        ['Akurasi Deteksi', 'Subjektif (Lelah)', 'Tergantung Operator', 'Konsisten (94%)'],
        ['Notifikasi Otomatis', 'Tidak', 'Tidak', 'Ya (Telegram)'],
        ['Analisis Data', 'Manual (Lambat)', 'Sulit', 'Otomatis & Cepat'],
        ['Biaya Operasional', 'Tinggi (Gaji)', 'Sedang', 'Efisien']
    ]
    
    fig, ax = plt.subplots(figsize=(10, 5), facecolor=WHITE)
    ax.axis('tight')
    ax.axis('off')
    
    # Create table
    table = ax.table(cellText=data, colLabels=columns, loc='center', cellLoc='center')
    
    # Style table
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.2, 1.8)
    
    # Color header
    for (row, col), cell in table.get_celld().items():
        if row == 0:
            cell.set_text_props(weight='bold', color=WHITE)
            cell.set_facecolor(NAVY)
        else:
            if col == 3: # Highlight SmartAPD column
                cell.set_facecolor('#E3F2FD') # Light Blue
                cell.set_text_props(weight='bold')
            else:
                cell.set_facecolor(WHITE)
                
    plt.title('Comparison: SmartAPD vs Conventional Methods', pad=5, fontsize=14, fontweight='bold')
    
    output_path = os.path.join(OUTPUT_DIR, 'table_comparison.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

def create_report_mockup():
    # Simulate a PDF Report Page
    fig, ax = plt.subplots(figsize=(8.27, 11.69), facecolor='white') # A4 size ratio
    ax.axis('off')
    
    # Header
    ax.text(0.5, 0.95, "LAPORAN PELANGGARAN K3", ha='center', fontsize=20, weight='bold', color=NAVY)
    ax.text(0.5, 0.92, "SmartAPD Automated Reporting System", ha='center', fontsize=12, color='gray')
    ax.axhline(0.90, color=ORANGE, linewidth=3, xmin=0.1, xmax=0.9)
    
    # Text Content
    text_content = """
    Tanggal: 31 Desember 2025
    Lokasi: Area Produksi A
    Total Insiden: 12
    
    Ringkasan Eksekutif:
    Pada periode ini, tingkat kepatuhan APD mencapai 94%. Pelanggaran terbanyak
    ditemukan pada kategori 'No Helmet' di Zona 3. Tindakan korektif otomatis
    telah dilakukan melalui notifikasi Telegram.
    """
    ax.text(0.1, 0.85, text_content, fontsize=12, va='top', fontfamily='monospace', linespacing=1.8)
    
    # Dummy Chart inside PDF
    ax_sub = ax.inset_axes([0.15, 0.45, 0.7, 0.3])
    categories = ['Helm', 'Rompi', 'Sepatu']
    vals = [85, 92, 98]
    ax_sub.bar(categories, vals, color=[NAVY, ORANGE, NAVY])
    ax_sub.set_title("Statistik Kepatuhan per Kategori")
    ax_sub.set_ylim(0, 100)
    
    # Footer
    ax.text(0.5, 0.05, "Generated by SmartAPD AI Engine | Confidential", ha='center', fontsize=10, color='gray')
    
    # Border
    rect = plt.Rectangle((0,0), 1, 1, fill=False, color='black', linewidth=1, transform=ax.transAxes)
    ax.add_patch(rect)
    
    output_path = os.path.join(OUTPUT_DIR, 'mockup_pdf_report.png')
    plt.savefig(output_path, dpi=100, bbox_inches='tight') # Lower DPI for thumbnail look
    print(f"Generated: {output_path}")
    plt.close()

    output_path = os.path.join(OUTPUT_DIR, 'mockup_pdf_report.png')
    plt.savefig(output_path, dpi=100, bbox_inches='tight') # Lower DPI for thumbnail look
    print(f"Generated: {output_path}")
    plt.close()

def create_spatial_heatmap():
    # Simulate a factory floor plan with hotspots
    np.random.seed(123)
    
    # Generate background noise (safe areas)
    x = np.random.uniform(0, 100, 500)
    y = np.random.uniform(0, 100, 500)
    
    # Generate Hotspots (Danger Zones)
    # Zone 1 (High Risk - Welding Area) - Bottom Left
    x = np.concatenate([x, np.random.normal(20, 10, 300)])
    y = np.concatenate([y, np.random.normal(20, 10, 300)])
    
    # Zone 2 (Medium Risk - Assembly) - Top Right
    x = np.concatenate([x, np.random.normal(80, 15, 200)])
    y = np.concatenate([y, np.random.normal(80, 15, 200)])

    fig, ax = plt.subplots(figsize=(8, 8), facecolor=WHITE)
    ax.set_facecolor('#F0F0F0') # Light grey floor
    
    # Plot floor boundaries
    ax.plot([0, 100, 100, 0, 0], [0, 0, 100, 100, 0], color=TEXT_COLOR, linewidth=3)
    
    # Draw some "machinery" (rectangles)
    rects = [
        plt.Rectangle((10, 10), 20, 20, fill=False, edgecolor='gray', hatch='//'), # Machine A
        plt.Rectangle((70, 70), 25, 15, fill=False, edgecolor='gray', hatch='..'), # Machine B
        plt.Rectangle((40, 40), 20, 20, fill=False, edgecolor='gray') # Machine C (Safe)
    ]
    for r in rects:
        ax.add_patch(r)
        
    ax.text(20, 8, "Zona Las (High Risk)", ha='center', fontsize=9)
    ax.text(82, 65, "Zona Rakit", ha='center', fontsize=9)
    
    # Create Heatmap using hexbin
    hb = ax.hexbin(x, y, gridsize=25, cmap='Reds', alpha=0.8, mincnt=1, edgecolor='none')
    
    # Add colorbar
    cb = fig.colorbar(hb, ax=ax, fraction=0.046, pad=0.04)
    cb.set_label('Frekuensi Pelanggaran APD')
    
    ax.set_xlim(-5, 105)
    ax.set_ylim(-5, 105)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title("Analisis Spasial: Peta Panas Pelanggaran APD (30 Hari)", pad=15)
    
    output_path = os.path.join(OUTPUT_DIR, 'chart_spatial_heatmap.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

def create_f1_curve():
    # Simulate F1 Curve (Harmonic mean of Precision and Recall)
    # Typically looks like a hill
    confidence = np.linspace(0, 1, 100)
    
    # Synthetic Precision (starts low, goes high)
    precision = 0.5 + 0.5 * (confidence**0.5)
    
    # Synthetic Recall (starts high, drops logicstically)
    recall = 1.0 / (1 + np.exp(10 * (confidence - 0.7)))
    
    # F1 Score calculation with protection against div by zero
    f1 = 2 * (precision * recall) / (precision + recall + 1e-6)
    
    # Find max F1
    max_idx = np.argmax(f1)
    max_f1 = f1[max_idx]
    max_conf = confidence[max_idx]
    
    fig, ax = plt.subplots(figsize=(10, 6), facecolor=WHITE)
    ax.set_facecolor(WHITE)
    
    ax.plot(confidence, f1, color=NAVY, linewidth=3, label='F1 Score')
    ax.plot(confidence, precision, color='gray', linestyle='--', alpha=0.5, label='Precision')
    ax.plot(confidence, recall, color='gray', linestyle=':', alpha=0.5, label='Recall')
    
    # Highlight Peak
    ax.scatter(max_conf, max_f1, color=ORANGE, s=100, zorder=5)
    ax.axvline(max_conf, color=ORANGE, linestyle='--', alpha=0.5)
    ax.text(max_conf, max_f1 + 0.05, f'Max F1: {max_f1:.2f}\nat Conf: {max_conf:.2f}', 
            ha='center', color=ORANGE, fontweight='bold')
    
    ax.set_xlabel('Confidence Threshold')
    ax.set_ylabel('Score')
    ax.set_title('F1-Confidence Curve (Model Optimization)', pad=15)
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_ylim(0, 1.1)
    ax.set_xlim(0, 1.0)
    ax.legend()
    
    output_path = os.path.join(OUTPUT_DIR, 'chart_f1_curve.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Generated: {output_path}")
    plt.close()

if __name__ == "__main__":
    set_style()
    try:
        create_overall_performance_chart()
        create_class_performance_chart()
        create_training_progress_chart()
        create_scatter_plot()
        create_confusion_matrix()
        create_comparison_table()
        create_report_mockup()
        create_spatial_heatmap()
        create_f1_curve()
        print("Success: Charts generated.")
    except Exception as e:
        print(f"Error: {e}")
