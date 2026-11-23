// Lingkaran + centang yang tergambar sekali — konfirmasi aksi berhasil (laporan terkirim, kode aktif).
export default function CentangBerhasil({ ukuran = 64, className = "" }: { ukuran?: number; className?: string }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <circle cx="32" cy="32" r="29" fill="var(--risiko-rendah-latar)" />
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke="var(--risiko-rendah)"
        strokeWidth="3"
        className="gambar-garis"
        style={{ "--panjang": 183 } as React.CSSProperties}
        transform="rotate(-90 32 32)"
      />
      <path
        d="M20 33.5 28.5 42 45 24"
        fill="none"
        stroke="var(--risiko-rendah)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="gambar-garis"
        style={{ "--panjang": 40, "--tunda": "450ms" } as React.CSSProperties}
      />
    </svg>
  );
}
