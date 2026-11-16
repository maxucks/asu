import { AssocHiddenPeek } from "@/practice/components/assoc/hidden_peek"
import { AssocImage } from "@/practice/components/assoc/image"
import { AssocMenu } from "@/practice/components/assoc/menu"
import { AssocStub } from "@/practice/components/assoc/stub"
import type { PracticeAssociation } from "@/practice/practice_model"
import { imageAssociationStubLabel, isImageAssociationStubRef, isImageAssociationUrl } from "@/practice/practice_utils"

const MEDIA_STUBS: Record<Exclude<PracticeAssociation["kind"], "text" | "image">, string> = {
  audio: "Audio placeholder",
  sketch: "Sketch placeholder",
  video: "Video placeholder",
}

type AssocCardLayoutProps = {
  readonly association: PracticeAssociation
  readonly visible: boolean
  readonly canEdit?: boolean
  readonly canHide?: boolean
  readonly canUnhide?: boolean
  readonly canDelete?: boolean
  readonly onEdit?: () => void
  readonly onHide?: () => void
  readonly onUnhide?: () => void
  readonly onDelete?: () => void
  readonly onReveal?: () => void
}

function Body({ association }: { readonly association: PracticeAssociation }) {
  if (association.kind === "text") {
    return (
      <div className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-3 text-sm leading-relaxed text-slate-100">{association.contentRef}</div>
    )
  }
  if (association.kind === "image") {
    if (isImageAssociationUrl(association.contentRef)) return <AssocImage url={association.contentRef} />
    const label = isImageAssociationStubRef(association.contentRef)
      ? (imageAssociationStubLabel(association.contentRef) ?? association.contentRef)
      : association.contentRef
    return <AssocStub kind="image" label={label} stacked />
  }
  return <AssocStub kind={association.kind} label={MEDIA_STUBS[association.kind]} />
}

function MenuRail(props: Omit<AssocCardLayoutProps, "association" | "visible" | "onReveal">) {
  return (
    <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 has-[button[aria-expanded=true]]:opacity-100" onClick={(e) => e.stopPropagation()}>
      <AssocMenu {...props} />
    </div>
  )
}

export function AssocCardLayout({ association, visible, onReveal, ...menu }: AssocCardLayoutProps) {
  if (!visible && association.hiddenFromPractice && onReveal) {
    return (
      <div className="group relative">
        <AssocHiddenPeek association={association} onReveal={onReveal} />
        <MenuRail {...menu} />
      </div>
    )
  }
  return (
    <div className="group relative">
      <Body association={association} />
      <MenuRail {...menu} />
    </div>
  )
}