import { useState } from "react"

type AssociationImageUiProps = {
  readonly url: string
}

export function AssociationImageUi({ url }: AssociationImageUiProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-3 text-sm text-slate-300">
        <p className="text-slate-400">Image could not be loaded.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block break-all text-accent underline-offset-2 hover:underline"
        >
          Open link
        </a>
      </div>
    )
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-slate-700/80 bg-slate-900/50">
      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary user URLs */}
      <img
        src={url}
        alt="Association image"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="max-h-64 w-full object-contain"
      />
    </figure>
  )
}
