export function StatusLayout(props: { readonly kind: "loading" | "finished" | "error"; readonly message?: string; readonly code?: string }) {
  if (props.kind === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center p-6">
        <p className="text-slate-400">Loading practice queue…</p>
      </main>
    )
  }

  if (props.kind === "error") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-danger">{props.message}</p>
        <p className="text-xs uppercase tracking-wider text-slate-500">{props.code}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-100">Queue complete</h1>
      <p className="text-slate-400">Session ended — reload to practice again.</p>
    </main>
  )
}