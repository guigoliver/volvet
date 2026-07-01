"use client";

import { useMemo, useRef, useState } from "react";
import {
  angleFromCenter,
  describeDonutSegment,
  normalizeAngle,
  polarToCartesian,
} from "@/lib/polar";
import type { CombinationData, RingData } from "@/lib/types";

const RING_COLORS = [
  "#c5ebf5",
  "#ffe3b3",
  "#d9f2c4",
  "#f5c5e0",
  "#d6c5f5",
  "#f5d6c5",
];

const SIZE = 520;
const CENTER = SIZE / 2;
const BASE_RADIUS = 46;
const RING_THICKNESS = 56;
const CLICK_THRESHOLD_DEGREES = 1.5;

type DragState = {
  pointerId: number;
  ringId: string;
  startAngle: number;
  startRotation: number;
  segmentId: string;
  segmentIndex: number;
  moved: boolean;
};

interface ConcentricWheelProps {
  rings: RingData[];
  combinations?: CombinationData[];
  selectedSegmentIds?: Set<string>;
  highlightedSegmentIds?: Set<string>;
  onRotateEnd: (ringId: string, rotationDegrees: number) => void;
  onSegmentClick?: (ringId: string, segmentIndex: number, segmentId: string) => void;
}

export function ConcentricWheel({
  rings,
  combinations = [],
  selectedSegmentIds,
  highlightedSegmentIds,
  onRotateEnd,
  onSegmentClick,
}: ConcentricWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const [rotations, setRotations] = useState<Record<string, number>>(() =>
    Object.fromEntries(rings.map((r) => [r.id, r.rotationDegrees]))
  );
  const rotationsRef = useRef(rotations);
  rotationsRef.current = rotations;

  const orderedRings = useMemo(
    () => [...rings].sort((a, b) => a.order - b.order),
    [rings]
  );

  function rotationOf(ringId: string, fallback: number) {
    return rotations[ringId] ?? fallback;
  }

  function getCenter() {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function handlePointerDown(
    e: React.PointerEvent<SVGPathElement>,
    ring: RingData,
    segmentId: string,
    segmentIndex: number
  ) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const angle = angleFromCenter(e.clientX, e.clientY, getCenter());
    dragStateRef.current = {
      pointerId: e.pointerId,
      ringId: ring.id,
      startAngle: angle,
      startRotation: rotationOf(ring.id, ring.rotationDegrees),
      segmentId,
      segmentIndex,
      moved: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent<SVGPathElement>) {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const angle = angleFromCenter(e.clientX, e.clientY, getCenter());
    const delta = angle - drag.startAngle;
    if (Math.abs(delta) > CLICK_THRESHOLD_DEGREES) {
      drag.moved = true;
    }
    const newRotation = normalizeAngle(drag.startRotation + delta);
    setRotations((prev) => ({ ...prev, [drag.ringId]: newRotation }));
  }

  function handlePointerUp(e: React.PointerEvent<SVGPathElement>) {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
    if (drag.moved) {
      onRotateEnd(drag.ringId, rotationsRef.current[drag.ringId]);
    } else {
      onSegmentClick?.(drag.ringId, drag.segmentIndex, drag.segmentId);
    }
  }

  const currentAlignment = useMemo(() => {
    const bySegmentAtMarker: Record<string, { id: string; label: string }> = {};
    for (const ring of orderedRings) {
      const rotation = rotationOf(ring.id, ring.rotationDegrees);
      const step = 360 / ring.segmentCount;
      const angleInRing = normalizeAngle(-rotation);
      const index = Math.floor(angleInRing / step) % ring.segmentCount;
      const segment = ring.segments.find((s) => s.index === index);
      if (segment) {
        bySegmentAtMarker[ring.id] = { id: segment.id, label: segment.label };
      }
    }
    const matches = combinations.filter((combo) =>
      combo.parts.every((part) => bySegmentAtMarker[part.ringId]?.id === part.segmentId)
    );
    return { bySegmentAtMarker, matches };
  }, [orderedRings, rotations, combinations]);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="max-w-full touch-none select-none"
      >
        {orderedRings.map((ring) => {
          const innerR = BASE_RADIUS + ring.order * RING_THICKNESS;
          const outerR = innerR + RING_THICKNESS;
          const rotation = rotationOf(ring.id, ring.rotationDegrees);
          const step = 360 / ring.segmentCount;
          const color = RING_COLORS[ring.order % RING_COLORS.length];

          return (
            <g key={ring.id}>
              {ring.segments.map((segment) => {
                const start = segment.index * step + rotation;
                const end = start + step;
                const path = describeDonutSegment(
                  CENTER,
                  CENTER,
                  innerR,
                  outerR,
                  start,
                  end
                );
                const mid = (start + end) / 2;
                const textPos = polarToCartesian(
                  CENTER,
                  CENTER,
                  (innerR + outerR) / 2,
                  mid
                );
                const isSelected = selectedSegmentIds?.has(segment.id);
                const isHighlighted = highlightedSegmentIds?.has(segment.id);
                const isAtMarker =
                  currentAlignment.bySegmentAtMarker[ring.id]?.id === segment.id;

                let textRotation = mid;
                if (mid > 90 && mid < 270) {
                  textRotation = mid + 180;
                }

                return (
                  <g key={segment.id}>
                    <path
                      d={path}
                      fill={color}
                      stroke={
                        isSelected ? "#e11d48" : isHighlighted ? "#eab308" : "#0055dc"
                      }
                      strokeWidth={isSelected || isHighlighted ? 3 : 1}
                      opacity={isAtMarker ? 1 : 0.85}
                      onPointerDown={(e) =>
                        handlePointerDown(e, ring, segment.id, segment.index)
                      }
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="cursor-grab active:cursor-grabbing"
                    />
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      transform={`rotate(${textRotation}, ${textPos.x}, ${textPos.y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={12}
                      className="pointer-events-none select-none fill-neutral-900"
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* fixed marker at 12 o'clock (non-interactive so clicks reach the wedges underneath) */}
        <g className="pointer-events-none">
          <line x1={CENTER} y1={CENTER} x2={CENTER} y2={10} stroke="#e11d48" strokeWidth={2} />
          <polygon points={`${CENTER - 6},6 ${CENTER + 6},6 ${CENTER},20`} fill="#e11d48" />
        </g>
      </svg>

      <div className="text-center text-sm text-neutral-600">
        <p>
          Current alignment:{" "}
          {orderedRings
            .map((r) => currentAlignment.bySegmentAtMarker[r.id]?.label)
            .filter(Boolean)
            .join(" / ") || "—"}
        </p>
        {currentAlignment.matches.length > 0 && (
          <p className="mt-1 font-medium text-amber-700">
            {currentAlignment.matches.map((m) => m.meaning).join("; ")}
          </p>
        )}
      </div>
    </div>
  );
}
