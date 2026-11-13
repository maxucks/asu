import {
  ASSOCIATION_KINDS,
  type AssociationKind,
} from "@/core/data_sources/case_data_source";
import { IMAGE_ASSOCIATION_STUB_REFS } from "@/practice/image_association_ref";

export type AssociationAddAction =
  | { readonly action: "text" }
  | { readonly action: "image_url" }
  | {
      readonly action: "image_stub";
      readonly contentRef:
        | typeof IMAGE_ASSOCIATION_STUB_REFS.library
        | typeof IMAGE_ASSOCIATION_STUB_REFS.upload
        | typeof IMAGE_ASSOCIATION_STUB_REFS.gifLibrary;
    }
  | {
      readonly action: "kind_stub";
      readonly kind: Exclude<AssociationKind, "text" | "image">;
    };

export type AssociationComposeMode = "text" | "image_url";

const NON_TEXT_IMAGE_KINDS = ASSOCIATION_KINDS.filter(
  (kind): kind is Exclude<AssociationKind, "text" | "image"> =>
    kind !== "text" && kind !== "image",
);

const KIND_STUB_LABELS: Record<
  Exclude<AssociationKind, "text" | "image">,
  string
> = {
  audio: "Audio (stub)",
  sketch: "Sketch (stub)",
  video: "Video (stub)",
};

export const ASSOCIATION_ADD_MENU: readonly {
  readonly pick: AssociationAddAction;
  readonly label: string;
}[] = [
  { pick: { action: "text" }, label: "Text mnemonic" },
  { pick: { action: "image_url" }, label: "Image from URL" },
  {
    pick: {
      action: "image_stub",
      contentRef: IMAGE_ASSOCIATION_STUB_REFS.library,
    },
    label: "Image from library (stub)",
  },
  {
    pick: {
      action: "image_stub",
      contentRef: IMAGE_ASSOCIATION_STUB_REFS.upload,
    },
    label: "Upload image (stub)",
  },
  {
    pick: {
      action: "image_stub",
      contentRef: IMAGE_ASSOCIATION_STUB_REFS.gifLibrary,
    },
    label: "GIF from library (stub)",
  },
  ...NON_TEXT_IMAGE_KINDS.map((kind) => ({
    pick: { action: "kind_stub" as const, kind },
    label: KIND_STUB_LABELS[kind],
  })),
];
