/** Image association `contentRef` helpers (no I/O). */

export const IMAGE_ASSOCIATION_STUB_REFS = {
  library: "stub:image-library",
  upload: "stub:image-upload",
  gifLibrary: "stub:gif-library",
  legacy: "stub:image",
} as const;

export type ImageAssociationStubRef =
  (typeof IMAGE_ASSOCIATION_STUB_REFS)[keyof typeof IMAGE_ASSOCIATION_STUB_REFS];

const STUB_LABELS: Record<ImageAssociationStubRef, string> = {
  [IMAGE_ASSOCIATION_STUB_REFS.library]: "Image library (coming soon)",
  [IMAGE_ASSOCIATION_STUB_REFS.upload]: "Upload image (coming soon)",
  [IMAGE_ASSOCIATION_STUB_REFS.gifLibrary]: "GIF library (coming soon)",
  [IMAGE_ASSOCIATION_STUB_REFS.legacy]: "Image placeholder",
};

export function normalizeImageAssociationUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return parsed.toString();
}

export function isImageAssociationUrl(contentRef: string): boolean {
  return normalizeImageAssociationUrl(contentRef) !== null;
}

const IMAGE_STUB_REF_SET = new Set<string>(Object.values(IMAGE_ASSOCIATION_STUB_REFS));

export function isImageAssociationStubRef(
  contentRef: string,
): contentRef is ImageAssociationStubRef {
  return IMAGE_STUB_REF_SET.has(contentRef);
}

export function imageAssociationStubLabel(contentRef: string): string | null {
  if (!isImageAssociationStubRef(contentRef)) return null;
  return STUB_LABELS[contentRef];
}
