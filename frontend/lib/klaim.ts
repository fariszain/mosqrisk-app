import { aktifkanPremium } from "@/lib/premium";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// QR di kemasan berisi URL .../claim?code=MOSQ-XXXX — ambil kodenya; kalau bukan URL, pakai teksnya.
export function kodeDariTeks(teks: string) {
  const m = teks.match(/[?&]code=([^&#]+)/i);
  let kode = teks;
  if (m) {
    try {
      kode = decodeURIComponent(m[1]);
    } catch {
      kode = m[1];
    }
  }
  return kode.trim().toUpperCase();
}

export function bersihkanKode(teks?: string | null) {
  return (teks ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 40);
}

export async function klaimKode(kode: string): Promise<{ ok: boolean; pesan: string }> {
  const k = kode.trim().toUpperCase();
  if (k.length < 4) return { ok: false, pesan: "Kode terlalu pendek. Contoh kode: MOSQ-X7B9." };
  try {
    const res = await fetch(`${API_URL}/api/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: k }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      aktifkanPremium();
      return { ok: true, pesan: data.message || "Premium aktif di perangkat ini." };
    }
    // 422 (format kode tidak valid) tidak membawa "message"
    return { ok: false, pesan: data.message || "Kode tidak valid atau tidak ditemukan." };
  } catch {
    return { ok: false, pesan: "Server MosqRisk tidak bisa dihubungi. Periksa koneksi internet, lalu coba lagi." };
  }
}
