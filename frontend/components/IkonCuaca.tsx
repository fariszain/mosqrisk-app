import { CloudFogIcon, CloudIcon, CloudLightningIcon, CloudRainIcon, CloudSunIcon, SunIcon } from "@phosphor-icons/react/ssr";

// Ikon untuk deskripsi cuaca BMKG ("Cerah", "Cerah Berawan", "Berawan", "Hujan Ringan", "Hujan Petir", "Udara Kabur", …).
export default function IkonCuaca({ desc, size = 22, className = "" }: { desc?: string | null; size?: number; className?: string }) {
  const p = { size, weight: "duotone" as const, className, "aria-hidden": true };
  const d = (desc || "").toLowerCase();
  if (d.includes("petir")) return <CloudLightningIcon {...p} />;
  if (d.includes("hujan")) return <CloudRainIcon {...p} />;
  if (d.includes("kabur") || d.includes("kabut") || d.includes("asap")) return <CloudFogIcon {...p} />;
  if (d.includes("cerah berawan")) return <CloudSunIcon {...p} />;
  if (d.includes("cerah")) return <SunIcon {...p} />;
  return <CloudIcon {...p} />;
}
