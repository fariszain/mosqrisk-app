// Ilustrasi garis nyamuk Aedes (belang putih di kaki & perut) dengan jalur terbang putus-putus.
// Dipakai di halaman 404 dan galat. Dekoratif → aria-hidden.
export default function NyamukIlustrasi({ className = "" }: { className?: string }) {
  const kaki = [
    "M4 7 L-8 26 L-16 44",
    "M8 8 L2 28 L-2 46",
    "M11 7 L16 27 L24 44",
  ];
  return (
    <svg viewBox="0 0 240 160" className={className} aria-hidden="true">
      <path
        d="M14 136 C 52 70, 96 150, 138 92"
        fill="none"
        stroke="var(--garis-kuat)"
        strokeWidth="2.2"
        strokeDasharray="1 9"
        strokeLinecap="round"
      />
      <g className="melayang-pelan" style={{ transformOrigin: "160px 70px" }}>
        <g transform="translate(160 70) rotate(-14)">
          <ellipse cx="-4" cy="-21" rx="25" ry="8.5" transform="rotate(-22 -4 -21)" fill="#fff" fillOpacity="0.75" stroke="var(--sekunder)" strokeWidth="1.2" />
          <ellipse cx="6" cy="-19" rx="19" ry="6.5" transform="rotate(-52 6 -19)" fill="#fff" fillOpacity="0.6" stroke="var(--sekunder)" strokeWidth="1.2" />
          {kaki.map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke="var(--tinta)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke="#fff" strokeWidth="1.8" strokeDasharray="0 9 3 6" strokeLinecap="round" />
            </g>
          ))}
          <ellipse cx="-22" cy="3" rx="25" ry="6.5" fill="var(--tinta)" />
          <path d="M-38 -2.5v11M-30 -3.5v13M-22 -3.5v13M-14 -3v12" stroke="#fff" strokeWidth="2" />
          <ellipse cx="8" cy="0" rx="10" ry="8.5" fill="var(--tinta)" />
          <path d="M4.5 -5.5q3.5 5.5 0 11M10.5 -5.5q-3.5 5.5 0 11" stroke="#fff" strokeWidth="1.4" fill="none" />
          <circle cx="20.5" cy="2" r="5.5" fill="var(--tinta)" />
          <path d="M25.5 4 L45 12.5" stroke="var(--tinta)" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
