export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/** Rounds to a fixed precision so server- and client-rendered markup match exactly
 * (raw trig output can differ in its last bit between Node's and the browser's V8). */
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: round(cx + radius * Math.cos(angleRad)),
    y: round(cy + radius * Math.sin(angleRad)),
  };
}

/** Angle (degrees, 0 = top / 12 o'clock, clockwise) of a point relative to a center. */
export function angleFromCenter(
  clientX: number,
  clientY: number,
  center: { x: number; y: number }
): number {
  const dx = clientX - center.x;
  const dy = clientY - center.y;
  return normalizeAngle((Math.atan2(dx, -dy) * 180) / Math.PI);
}

/** SVG path for one donut (annulus) wedge between startAngle and endAngle. */
export function describeDonutSegment(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerR, outerR, 0, largeArc, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerR, innerR, 0, largeArc, 1, startInner.x, startInner.y,
    "Z",
  ].join(" ");
}
