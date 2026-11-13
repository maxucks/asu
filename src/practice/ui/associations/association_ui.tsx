import type { Association } from "@/practice/practice_model";
import {
  imageAssociationStubLabel,
  isImageAssociationStubRef,
  isImageAssociationUrl,
} from "@/practice/image_association_ref";
import { AssociationActionsMenuUi } from "@/practice/ui/associations/association_actions_menu_ui";
import { AssociationHiddenPeekUi } from "@/practice/ui/associations/association_hidden_peek_ui";
import { AssociationImageUi } from "@/practice/ui/associations/association_image_ui";
import { AssociationPlaceholderUi } from "@/practice/ui/associations/association_placeholder_ui";

const MEDIA_STUB_LABELS: Record<
  Exclude<Association["kind"], "text" | "image">,
  string
> = {
  audio: "Audio placeholder",
  sketch: "Sketch placeholder",
  video: "Video placeholder",
};

type AssociationUiProps = {
  readonly association: Association;
  readonly contentVisible: boolean;
  readonly canEdit?: boolean;
  readonly canHide?: boolean;
  readonly canUnhide?: boolean;
  readonly canDelete?: boolean;
  readonly onEdit?: () => void;
  readonly onHide?: () => void;
  readonly onUnhide?: () => void;
  readonly onDelete?: () => void;
  readonly onRevealHidden?: () => void;
};

function AssociationBody({ association }: { readonly association: Association }) {
  if (association.kind === "text") {
    return (
      <div className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-3 text-sm leading-relaxed text-slate-100">
        {association.contentRef}
      </div>
    );
  }

  if (association.kind === "image") {
    if (isImageAssociationUrl(association.contentRef)) {
      return <AssociationImageUi url={association.contentRef} />;
    }

    const label = isImageAssociationStubRef(association.contentRef)
      ? (imageAssociationStubLabel(association.contentRef) ??
        association.contentRef)
      : association.contentRef;

    return (
      <AssociationPlaceholderUi kind="image" label={label} layout="stacked" />
    );
  }

  return (
    <AssociationPlaceholderUi
      kind={association.kind}
      label={MEDIA_STUB_LABELS[association.kind]}
    />
  );
}

function AssociationActionsRail(
  props: Omit<AssociationUiProps, "association" | "contentVisible" | "onRevealHidden">,
) {
  return (
    <div
      className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 has-[button[aria-expanded=true]]:opacity-100"
      onClick={(event) => event.stopPropagation()}
    >
      <AssociationActionsMenuUi {...props} />
    </div>
  );
}

export function AssociationUi({
  association,
  contentVisible,
  canEdit,
  canHide,
  canUnhide,
  canDelete,
  onEdit,
  onHide,
  onUnhide,
  onDelete,
  onRevealHidden,
}: AssociationUiProps) {
  const actions = {
    canEdit,
    canHide,
    canUnhide,
    canDelete,
    onEdit,
    onHide,
    onUnhide,
    onDelete,
  };

  if (!contentVisible && association.hiddenFromPractice && onRevealHidden) {
    return (
      <div className="group relative">
        <AssociationHiddenPeekUi association={association} onReveal={onRevealHidden} />
        <AssociationActionsRail {...actions} />
      </div>
    );
  }

  return (
    <div className="group relative">
      <AssociationBody association={association} />
      <AssociationActionsRail {...actions} />
    </div>
  );
}
