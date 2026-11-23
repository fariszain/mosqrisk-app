// Foto di frontend/public/foto/ beserta kreditnya (ditampilkan di keterangan foto & halaman /kredit).
// Foto Wikimedia Commons berlisensi CC BY-SA / domain publik — kredit wajib ikut ditampilkan.
// Foto tanpa `kredit` adalah foto lama proyek (sebelum 2026-11-07) yang asal-usulnya tidak tercatat.
export type Foto = {
  src: string;
  w: number;
  h: number;
  alt: string;
  kredit?: string;
  lisensi?: string;
  tautan?: string;
};

export const FOTO = {
  aedesCdc: {
    src: "/foto/aedes-cdc.webp",
    w: 1600,
    h: 1076,
    alt: "Nyamuk Aedes aegypti betina berbelang putih sedang mengisap darah di kulit manusia",
    kredit: "James Gathany, CDC",
    lisensi: "Domain publik",
    tautan: "https://commons.wikimedia.org/wiki/File:Aedes_aegypti_CDC9178.tif",
  },
  aedesGigit: {
    src: "/foto/aedes-gigit.webp",
    w: 1200,
    h: 896,
    alt: "Foto dekat nyamuk Aedes aegypti menggigit kulit",
  },
  nilamDaun: {
    src: "/foto/nilam-daun.webp",
    w: 1600,
    h: 1067,
    alt: "Rumpun daun nilam (Pogostemon cablin) yang hijau dan bergerigi",
    kredit: "Krzysztof Ziarnek, Kenraiz",
    lisensi: "CC BY-SA 4.0",
    tautan: "https://commons.wikimedia.org/wiki/File:Pogostemon_cablin_kz02.jpg",
  },
  nilamBunga: {
    src: "/foto/nilam-bunga.webp",
    w: 960,
    h: 1344,
    alt: "Pucuk tanaman nilam dengan bunga kecil berwarna pucat",
    kredit: "Krzysztof Ziarnek, Kenraiz",
    lisensi: "CC BY-SA 4.0",
    tautan: "https://commons.wikimedia.org/wiki/File:Pogostemon_cablin_kz03.jpg",
  },
  nilamBibit: {
    src: "/foto/nilam-bibit.webp",
    w: 960,
    h: 1280,
    alt: "Bibit tanaman nilam yang rimbun di kebun",
    kredit: "Raflinoer32",
    lisensi: "CC BY-SA 4.0",
    tautan: "https://commons.wikimedia.org/wiki/File:Bibit_nilam.jpg",
  },
  nilamRacik: {
    src: "/foto/nilam-racik.webp",
    w: 600,
    h: 896,
    alt: "Daun nilam segar dan daun nilam kering di atas papan marmer",
  },
  genangan: {
    src: "/foto/genangan.webp",
    w: 1376,
    h: 768,
    alt: "Genangan air keruh di antara tanaman, tempat jentik nyamuk bisa tumbuh",
  },
  siklusTelur: {
    src: "/foto/siklus-telur.webp",
    w: 960,
    h: 865,
    alt: "Telur nyamuk Aedes berwarna hitam dilihat dengan mikroskop",
    kredit: "Fedaro",
    lisensi: "CC BY-SA 4.0",
    tautan: "https://commons.wikimedia.org/wiki/File:Eggs_AEDES.jpg",
  },
  siklusJentik: {
    src: "/foto/siklus-jentik.webp",
    w: 960,
    h: 618,
    alt: "Jentik nyamuk Aedes aegypti di dalam air",
    kredit: "Fedaro",
    lisensi: "CC BY-SA 4.0",
    tautan: "https://commons.wikimedia.org/wiki/File:Aedes_Egypti_larva.jpg",
  },
  siklusPupa: {
    src: "/foto/siklus-pupa.webp",
    w: 960,
    h: 832,
    alt: "Pupa nyamuk Aedes aegypti berbentuk koma",
    kredit: "Fedaro",
    lisensi: "CC BY-SA 4.0",
    tautan: "https://commons.wikimedia.org/wiki/File:Aedes_Egypti_pupa.jpg",
  },
  siklusDewasa: {
    src: "/foto/siklus-dewasa.webp",
    w: 960,
    h: 1073,
    alt: "Nyamuk Aedes aegypti dewasa dengan sisik putih di tubuh dan kaki",
    kredit: "Fedaro",
    lisensi: "CC BY-SA 4.0",
    tautan: "https://commons.wikimedia.org/wiki/File:Aedes_aegypti_macro.jpg",
  },
} satisfies Record<string, Foto>;

export function teksKredit(f: Foto) {
  return f.kredit ? `Foto: ${f.kredit}${f.lisensi ? ` (${f.lisensi})` : ""}` : null;
}
