import { CheckCircleIcon, InfoIcon, WarningIcon, WarningOctagonIcon } from "@phosphor-icons/react/ssr";

// Blok pemberitahuan: info, peringatan (mis. mode uji coba), galat, sukses.
// Teks selalu menjelaskan apa yang terjadi dan apa yang bisa dilakukan — bukan sekadar "Terjadi kesalahan".
type Nada = "info" | "peringatan" | "galat" | "sukses";

const GAYA: Record<Nada, { kotak: string; Ikon: typeof InfoIcon }> = {
  info: { kotak: "bg-kertas text-tinta", Ikon: InfoIcon },
  peringatan: { kotak: "bg-peringatan-latar text-peringatan-teks", Ikon: WarningIcon },
  galat: { kotak: "bg-risiko-tinggi-latar text-galat", Ikon: WarningOctagonIcon },
  sukses: { kotak: "bg-risiko-rendah-latar text-risiko-rendah", Ikon: CheckCircleIcon },
};

type Props = {
  nada?: Nada;
  judul?: React.ReactNode;
  children?: React.ReactNode;
  aksi?: React.ReactNode;
  className?: string;
  peran?: "status" | "alert";
};

export default function Catatan({ nada = "info", judul, children, aksi, className = "", peran }: Props) {
  const { kotak, Ikon } = GAYA[nada];
  return (
    <div
      role={peran ?? (nada === "galat" ? "alert" : "status")}
      className={`flex flex-col gap-3 rounded-kontrol px-4 py-3.5 sm:flex-row sm:items-center md:px-5 md:py-4 ${kotak} ${className}`}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <Ikon size={20} weight="duotone" aria-hidden="true" className="mt-0.5 shrink-0" />
        <div className="min-w-0 text-[15px] leading-relaxed">
          {judul && <p className="font-semibold">{judul}</p>}
          {children && <div>{children}</div>}
        </div>
      </div>
      {aksi && <div className="shrink-0 sm:ml-2">{aksi}</div>}
    </div>
  );
}
