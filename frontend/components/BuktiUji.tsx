import KartuLabel from "@/components/ui/KartuLabel";

// Bukti yang sudah ada (uji persepsi) dan yang belum (uji lab) — dipisah tegas.
// Sumber: 05_FAKTA §4. Kalau hasil uji lab keluar, perbarui 05_FAKTA dulu, baru file ini.
export default function BuktiUji({ tingkatJudul = "h3" }: { tingkatJudul?: "h2" | "h3" }) {
  return (
    <>
      <div className="grid items-start gap-5 md:grid-cols-2">
        <KartuLabel
          status="Sudah dilakukan"
          judul="Uji persepsi pengguna"
          tingkatJudul={tingkatJudul}
          baris={[
            { label: "Peserta", isi: "10 responden, usia 20–58 tahun" },
            { label: "Durasi", isi: "5 hari memakai sampel produk" },
            { label: "Kelayakan", isi: "92,8%" },
            { label: "Kepraktisan", isi: "94,5%" },
            { label: "Keefektifan", isi: "92,5% menurut penilaian responden" },
            { label: "Iritasi kulit", isi: "Tidak ada laporan selama uji coba" },
          ]}
          catatan="Uji persepsi pengguna, bukan uji klinis."
        />
        <KartuLabel
          varian="garis"
          status="Direncanakan"
          judul="Uji laboratorium"
          tingkatJudul={tingkatJudul}
          baris={[
            { label: "Efikasi", isi: "Adaptasi cage test WHO; target: Complete Protection Time terukur" },
            { label: "Keamanan kulit", isi: "Patch test pada panelis, pengamatan 30 menit sampai 96 jam" },
            { label: "Status", isi: "Belum dilakukan per 6 November 2026" },
          ]}
        />
      </div>
      <p className="keterangan mt-5">
        Sumber: Proposal UTU Awards 2026 (uji persepsi) dan Proposal PIKU Universitas Syiah Kuala 2026 (rencana uji).
      </p>
    </>
  );
}
