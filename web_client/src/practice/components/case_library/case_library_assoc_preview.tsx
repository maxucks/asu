import type { AssociationDto } from "@/core/data_sources/http_case_data_source"
import { AssocImage } from "@/practice/components/assoc/image"
import { isImageAssociationUrl } from "@/practice/practice_utils"

export function CaseLibraryAssocPreview({ association }: { readonly association: AssociationDto | null }) {
  if (!association) {
    return <div className="h-full w-full bg-tile" aria-hidden />
  }

  if (association.kind === "text") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-tile px-1 text-center text-sm leading-tight text-foreground">
        <span className="line-clamp-4">{association.contentRef}</span>
      </div>
    )
  }

  if (association.kind === "image" && isImageAssociationUrl(association.contentRef)) {
    return (
      <div className="h-full w-full bg-tile">
        <AssocImage url={association.contentRef} tile />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-tile px-1 text-center text-[9px] uppercase tracking-wide text-muted">
      {association.kind}
    </div>
  )
}