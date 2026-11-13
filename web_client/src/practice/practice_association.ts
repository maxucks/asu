import { ASSOCIATION_KINDS, type AssociationKind } from "@/core/data_sources/case_data_source"
import type { PracticeAssociation } from "@/practice/practice_model"

/** Image association `contentRef` helpers (no I/O). */

export const IMAGE_ASSOCIATION_STUB_REFS = {
  library: "stub:image-library",
  upload: "stub:image-upload",
  gifLibrary: "stub:gif-library",
  legacy: "stub:image",
} as const

export type ImageAssociationStubRef = (typeof IMAGE_ASSOCIATION_STUB_REFS)[keyof typeof IMAGE_ASSOCIATION_STUB_REFS]

const IMAGE_STUB_LABELS: Record<ImageAssociationStubRef, string> = {
  [IMAGE_ASSOCIATION_STUB_REFS.library]: "Image library (coming soon)",
  [IMAGE_ASSOCIATION_STUB_REFS.upload]: "Upload image (coming soon)",
  [IMAGE_ASSOCIATION_STUB_REFS.gifLibrary]: "GIF library (coming soon)",
  [IMAGE_ASSOCIATION_STUB_REFS.legacy]: "Image placeholder",
}

const IMAGE_STUB_REF_SET = new Set<string>(Object.values(IMAGE_ASSOCIATION_STUB_REFS))

export function normalizeImageAssociationUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0 || trimmed.length > 2048) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
  return parsed.toString()
}

export function isImageAssociationUrl(contentRef: string): boolean {
  return normalizeImageAssociationUrl(contentRef) !== null
}

export function isImageAssociationStubRef(contentRef: string): contentRef is ImageAssociationStubRef {
  return IMAGE_STUB_REF_SET.has(contentRef)
}

export function imageAssociationStubLabel(contentRef: string): string | null {
  if (!isImageAssociationStubRef(contentRef)) return null
  return IMAGE_STUB_LABELS[contentRef]
}

const ASSOCIATION_KIND_LABELS: Record<AssociationKind, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  sketch: "Sketch",
  video: "Video",
}

export function associationKindLabel(kind: AssociationKind): string {
  return ASSOCIATION_KIND_LABELS[kind]
}

export type AssociationComposeMode = "text" | "image_url"

export type AssociationAddAction =
  | { readonly action: "text" }
  | { readonly action: "image_url" }
  | {
      readonly action: "image_stub"
      readonly contentRef:
        | typeof IMAGE_ASSOCIATION_STUB_REFS.library
        | typeof IMAGE_ASSOCIATION_STUB_REFS.upload
        | typeof IMAGE_ASSOCIATION_STUB_REFS.gifLibrary
    }
  | {
      readonly action: "kind_stub"
      readonly kind: Exclude<AssociationKind, "text" | "image">
    }

const NON_TEXT_IMAGE_KINDS = ASSOCIATION_KINDS.filter(
  (kind): kind is Exclude<AssociationKind, "text" | "image"> => kind !== "text" && kind !== "image",
)

const KIND_STUB_MENU_LABELS: Record<Exclude<AssociationKind, "text" | "image">, string> = {
  audio: "Audio (stub)",
  sketch: "Sketch (stub)",
  video: "Video (stub)",
}

export const ASSOCIATION_ADD_MENU: readonly {
  readonly pick: AssociationAddAction
  readonly label: string
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
    label: KIND_STUB_MENU_LABELS[kind],
  })),
]

export type AssociationEditorState =
  | { readonly intent: "add"; readonly mode: AssociationComposeMode }
  | {
      readonly intent: "edit"
      readonly mode: AssociationComposeMode
      readonly associationId: string
    }

export function isEditableAssociation(association: PracticeAssociation): boolean {
  if (association.kind === "text") return true
  if (association.kind === "image") {
    return isImageAssociationUrl(association.contentRef)
  }
  return false
}

export function associationComposeModeForEdit(association: PracticeAssociation): AssociationComposeMode | null {
  if (association.kind === "text") return "text"
  if (association.kind === "image" && isImageAssociationUrl(association.contentRef)) {
    return "image_url"
  }
  return null
}
