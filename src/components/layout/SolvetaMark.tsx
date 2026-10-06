/**
 * The Solvetaworld mark — "Forest & Stone" edition.
 *
 * A flat deep-forest disc carrying a stone meridian and a curved horizon, with
 * a single copper node sitting on the rim. Flat colour only — the brand draws
 * with hairlines and solid fills, never gradients — and a circular silhouette,
 * so the mark reads nothing like a rounded-square badge at any size.
 *
 * `gradientId` is kept in the signature for call-site compatibility (header,
 * drawer, footer all pass one) but is no longer used: flat fills need no defs.
 */
export function SolvetaMark({
  size = 28,
}: {
  size?: number;
  gradientId?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="16" fill="#2E5E4E" />
      <ellipse
        cx="20"
        cy="20"
        rx="6.5"
        ry="16"
        fill="none"
        stroke="#F4F2ED"
        strokeWidth="2"
        strokeOpacity="0.85"
      />
      <path
        d="M5.5 24.5 C 12 19.5, 28 19.5, 34.5 24.5"
        fill="none"
        stroke="#F4F2ED"
        strokeWidth="2"
        strokeOpacity="0.85"
      />
      <circle cx="31" cy="11.5" r="5" fill="#A5561F" stroke="#F4F2ED" strokeWidth="2" />
    </svg>
  );
}
