"use client";

import Dialog from "@/components/ui/Dialog";
import PanelKlaim from "@/components/PanelKlaim";

// Modal klaim kode Premium (tab "Beli Akses" berisi QR dummy sudah dihapus di Fase 1;
// pembelian lewat /checkout). Status Premium diperbarui lewat lib/premium (tanpa pindah halaman).
interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  return (
    <Dialog terbuka={isOpen} onTutup={onClose} judul="Aktifkan Premium MosqRisk">
      <PanelKlaim onSelesai={onClose} />
    </Dialog>
  );
}
