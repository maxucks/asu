import type { Association } from "@/practice/practice_model";

type AssociationStubUiProps = {
  readonly association: Association;
};

export function AssociationStubUi({ association }: AssociationStubUiProps) {
  if (association.kind === "text") {
    return (
      <div className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-3 text-sm leading-relaxed text-slate-100">
        {association.contentRef}
      </div>
    );
  }

  const placeholderLabel: Record<
    Exclude<Association["kind"], "text">,
    string
  > = {
    image: "Image placeholder",
    audio: "Audio placeholder",
    sketch: "Sketch placeholder",
    video: "Video placeholder",
  };

  return (
    <div
      className="flex min-h-[4.5rem] items-center justify-center rounded-lg border border-dashed border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-slate-400"
      aria-label={`${association.kind} association stub`}
    >
      <span className="uppercase tracking-wide text-xs text-slate-500">
        {association.kind}
      </span>
      <span className="mx-2 text-slate-600">·</span>
      <span>{placeholderLabel[association.kind]}</span>
    </div>
  );
}
