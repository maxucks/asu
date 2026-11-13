import type { AssociationComposeMode } from "@/practice/association_add_actions";

export type AssociationEditorState =
  | { readonly intent: "add"; readonly mode: AssociationComposeMode }
  | {
      readonly intent: "edit";
      readonly mode: AssociationComposeMode;
      readonly associationId: string;
    };
