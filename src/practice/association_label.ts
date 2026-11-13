import type { AssociationKind } from "@/core/data_sources/case_data_source";

const KIND_LABELS: Record<AssociationKind, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  sketch: "Sketch",
  video: "Video",
};

export function associationKindLabel(kind: AssociationKind): string {
  return KIND_LABELS[kind];
}
