export function AddCaseFab({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Add vocabulary entry"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-light text-accent-foreground shadow-lg transition hover:brightness-110"
    >
      +
    </button>
  )
}