import { AssocHiddenPeek } from "@/practice/components/assoc/hidden_peek"
import { AssocImage } from "@/practice/components/assoc/image"
import { AssocMenu } from "@/practice/components/assoc/menu"
import { AssocStub } from "@/practice/components/assoc/stub"
import type { PracticeAssociation } from "@/practice/practice_model"
import { imageAssociationStubLabel, isImageAssociationStubRef, isImageAssociationUrl } from "@/practice/practice_utils"

const MEDIA_STUBS: Record<Exclude<PracticeAssociation["kind"], "text" | "image">, string> = {
  audio: "Audio",
  sketch: "Sketch",
  video: "Video",
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
      <div className="flex size-full items-center justify-center p-2 text-center text-xs leading-snug text-foreground">
        {association.contentRef}
      </div>
    )
  }
  if (association.kind === "image") {
    if (isImageAssociationUrl(association.contentRef)) {
      return (
        <div className="size-full">
          <AssocImage url={association.contentRef} tile />
        </div>
      )
    }
    const label = isImageAssociationStubRef(association.contentRef)
      ? (imageAssociationStubLabel(association.contentRef) ?? association.contentRef)
      : association.contentRef
    return <AssocStub kind="image" label={label} stacked tile />
  }
  return <AssocStub kind={association.kind} label={MEDIA_STUBS[association.kind]} tile />
}

function MenuRail(props: Omit<AssocCardLayoutProps, "association" | "visible" | "onReveal">) {
  return (
    <div
      className="absolute right-1 top-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 has-[button[aria-expanded=true]]:opacity-100"
      onClick={(e) => e.stopPropagation()}
    >
      <AssocMenu {...props} />
    </div>
  )
}

export function AssocCardLayout({ association, visible, onReveal, ...menu }: AssocCardLayoutProps) {
  if (!visible && association.hiddenFromPractice && onReveal) {
    return (
      <div className="group relative aspect-square w-full overflow-hidden">
        <AssocHiddenPeek association={association} onReveal={onReveal} tile />
        <MenuRail {...menu} />
      </div>
    )
  }
  return (
    <div className="group relative aspect-square w-full overflow-hidden bg-tile">
      <Body association={association} />
      <MenuRail {...menu} />
    </div>
  )
}