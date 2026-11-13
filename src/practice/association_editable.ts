import type { Association } from "@/practice/practice_model";
import { isImageAssociationUrl } from "@/practice/image_association_ref";

export function isEditableAssociation(association: Association): boolean {
  if (association.kind === "text") return true;
  if (association.kind === "image") {
    return isImageAssociationUrl(association.contentRef);
  }
  return false;
}

export function associationComposeModeForEdit(
  association: Association,
): "text" | "image_url" | null {
  if (association.kind === "text") return "text";
  if (association.kind === "image" && isImageAssociationUrl(association.contentRef)) {
    return "image_url";
  }
  return null;
}
