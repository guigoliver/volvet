export type SegmentData = {
  id: string;
  index: number;
  label: string;
  meaning: string | null;
};

export type RingData = {
  id: string;
  order: number;
  segmentCount: number;
  contentType: string;
  rotationDegrees: number;
  segments: SegmentData[];
};

export type CombinationPartData = {
  ringId: string;
  segmentId: string;
};

export type CombinationData = {
  id: string;
  meaning: string;
  parts: CombinationPartData[];
};

export type WheelData = {
  id: string;
  name: string;
  templateId: string | null;
  rings: RingData[];
  combinations: CombinationData[];
};
