import Link from "next/link";

const arah = [
  { href: "/design-lab/a", nama: "A. Label Apotek Botani", isi: "Sistem visual dari kemasan: hijau kotak, garis foil emas, kartu label berisi fakta & status uji." },
  { href: "/design-lab/b", nama: "B. Instrumen Kesehatan Publik", isi: "Layar pertama berisi skor risiko hari ini (live dari BMKG) lengkap dengan rincian faktornya." },
  { href: "/design-lab/c", nama: "C. Rantai Nilam Aceh", isi: "Halaman sebagai perjalanan material: petani nilam sampai data MosqRisk, dijahit garis tangkai daun." },
];

export default function DesignLabIndex() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 lab-jakarta text-[#0B321E]">
      <p className="text-sm text-[#4A5A4F] mb-2">Prototipe sementara, Fase 2 (checkpoint C5)</p>
      <h1 className="text-3xl font-extrabold mb-8">Pilih arah desain</h1>
      <ul className="flex flex-col gap-4">
        {arah.map((a) => (
          <li key={a.href}>
            <Link href={a.href} className="block border border-[#D5DDD6] rounded-lg p-5 hover:border-[#0B321E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B321E]">
              <span className="block font-bold text-lg">{a.nama}</span>
              <span className="block text-[#4A5A4F] mt-1">{a.isi}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-[#4A5A4F] mt-10">Penjelasan lengkap tiap arah: docs/expo/design-lab.md</p>
    </main>
  );
}
