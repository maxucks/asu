import { useState } from "react"

export function AssocImage({ url, tile }: { readonly url: string; readonly tile?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className={`flex size-full flex-col items-center justify-center gap-2 bg-tile p-2 text-center text-xs text-muted ${tile ? "" : "rounded-lg border border-grid-line px-4 py-3"}`}
      >
        <p>Image failed</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-2 hover:underline">
          Open link
        </a>
      </div>
    )
  }
  return (
    <figure className={tile ? "size-full" : "overflow-hidden rounded-lg border border-grid-line bg-tile"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Association image"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={tile ? "size-full object-cover" : "max-h-64 w-full object-contain"}
      />
    </figure>
  )
}