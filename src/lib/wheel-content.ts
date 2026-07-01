import { ContentType } from "@/generated/prisma/enums";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateLabels(
  contentType: ContentType,
  segmentCount: number,
  customLabels?: string[]
): string[] {
  switch (contentType) {
    case ContentType.ALPHABET:
      return Array.from({ length: segmentCount }, (_, i) =>
        i < ALPHABET.length ? ALPHABET[i] : `?${i + 1}`
      );
    case ContentType.NUMERIC:
      return Array.from({ length: segmentCount }, (_, i) => String(i + 1));
    case ContentType.CUSTOM:
      if (!customLabels || customLabels.length !== segmentCount) {
        throw new Error(
          `CUSTOM content type requires exactly ${segmentCount} labels`
        );
      }
      return customLabels;
    case ContentType.BLANK:
      return Array.from({ length: segmentCount }, () => "");
  }
}
