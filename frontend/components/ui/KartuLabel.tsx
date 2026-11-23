// Kartu fakta — pasangan label + nilai, dengan status yang jelas.
//   varian "isi"   = fakta/hal yang SUDAH ada (bidang hijau kemasan)
//   varian "garis" = hal yang DIRENCANAKAN/belum ada (hanya bingkai putus-putus) — jangan dipakai untuk fakta
//   tata "lebar"   = judul di kiri, fakta berjajar (desktop)
export type BarisLabel = { label: string; isi: React.ReactNode };

type Props = {
  judul: React.ReactNode;
  baris: BarisLabel[];
  varian?: "isi" | "garis";
  tata?: "daftar" | "lebar";
  catatan?: React.ReactNode;
  tingkatJudul?: "h2" | "h3" | "p";
  status?: React.ReactNode;
  className?: string;
};

export default function KartuLabel({ judul, baris, varian = "isi", tata = "daftar", catatan, tingkatJudul = "h3", status, className = "" }: Props) {
  const isi = varian === "isi";
  const Judul = tingkatJudul;
  const permukaan = isi ? "bg-kemasan text-white permukaan-gelap" : "bg-white text-tinta border-[1.5px] border-dashed border-garis-kuat";
  const warnaLabel = isi ? "text-pucat" : "text-sekunder";
  const garisBaris = isi ? "border-white/12" : "border-garis";
  const lencana = status && (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold ${
        isi ? "bg-white/10 text-pucuk" : "bg-peringatan-latar text-peringatan-teks"
      }`}
    >
      {status}
    </span>
  );

  if (tata === "lebar") {
    return (
      <div className={`rounded-kartu px-5 py-5 md:px-8 md:py-7 ${permukaan} ${className}`}>
        <div className="md:flex md:items-start md:gap-10">
          <div className="shrink-0 md:w-56">
            {lencana}
            <Judul className={`text-[22px] font-bold leading-tight tracking-tight ${status ? "mt-3" : ""}`}>{judul}</Judul>
          </div>
          <dl className="mt-3 grid flex-1 grid-cols-1 text-[15px] leading-relaxed md:mt-0 md:grid-cols-4 md:gap-8">
            {baris.map((b) => (
              <div key={b.label} className={`grid grid-cols-[7.5rem_1fr] gap-4 border-t py-2.5 first:border-t-0 md:block md:border-t-0 md:py-0 ${garisBaris}`}>
                <dt className={warnaLabel}>{b.label}</dt>
                <dd className="font-medium md:mt-1">{b.isi}</dd>
              </div>
            ))}
          </dl>
        </div>
        {catatan && <p className={`mt-4 text-[13px] leading-relaxed ${warnaLabel}`}>{catatan}</p>}
      </div>
    );
  }

  return (
    <div className={`rounded-kartu p-5 md:p-7 ${permukaan} ${className}`}>
      {lencana}
      <Judul className={`text-[22px] font-bold leading-tight tracking-tight md:text-[24px] ${status ? "mt-4" : ""}`}>{judul}</Judul>
      <dl className="mt-4 text-[15px] leading-relaxed">
        {baris.map((b) => (
          <div key={b.label} className={`grid grid-cols-[7.5rem_1fr] gap-4 border-t py-2.5 first:border-t-0 sm:grid-cols-[9rem_1fr] ${garisBaris}`}>
            <dt className={warnaLabel}>{b.label}</dt>
            <dd className="angka font-medium">{b.isi}</dd>
          </div>
        ))}
      </dl>
      {catatan && <p className={`mt-3 text-[13px] leading-relaxed ${warnaLabel}`}>{catatan}</p>}
    </div>
  );
}
