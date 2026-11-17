import { EmojiIconPicker } from "@/core/components/atoms/emoji_icon_picker"
import { singleEmoji } from "@/core/utils/single_emoji"
import type { LanguageDto } from "@/core/data_sources/http_language_data_source"
import { LanguageFormActions } from "@/practice/components/language/language_form_actions"
import { LanguageNameField } from "@/practice/components/language/language_name_field"
import { IconButton, IconEdit, IconPlus, IconTrash } from "@/practice/components/session/icon_button"
import type { PracticeRepository } from "@/practice/practice_repository"
import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from "react"

type LanguageSwitchModalProps = {
  readonly open: boolean
  readonly activeLanguageId: string
  readonly repo: PracticeRepository
  readonly onClose: () => void
  readonly onSwitch: (languageId: string) => void
}

export function LanguageSwitchModal({ open, activeLanguageId, repo, onClose, onSwitch }: LanguageSwitchModalProps) {
  const [languages, setLanguages] = useState<readonly LanguageDto[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [newName, setNewName] = useState("")
  const [newIcon, setNewIcon] = useState("🌐")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    const result = await repo.listLanguages()
    setLoading(false)
    if (!result.ok) {
      setMessage(result.error.message)
      return
    }
    setLanguages(result.value)
  }, [repo])

  useEffect(() => {
    if (!open) return
    setEditingId(null)
    setCreateOpen(false)
    setNewName("")
    setNewIcon("🌐")
    void refresh()
  }, [open, refresh])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, open])

  if (!open) return null

  async function saveIcon(languageId: string, raw: string) {
    const icon = singleEmoji(raw)
    if (icon.length === 0) {
      setMessage("Pick an icon for the language.")
      return
    }
    setBusyId(languageId)
    setMessage(null)
    const result = await repo.updateLanguage(languageId, { icon })
    setBusyId(null)
    if (!result.ok) {
      setMessage(result.error.message)
      return
    }
    await refresh()
  }

  function startEdit(language: LanguageDto) {
    setCreateOpen(false)
    setEditingId(language.id)
    setEditName(language.name)
    setMessage(null)
  }

  async function saveEditName(languageId: string) {
    const name = editName.trim()
    if (name.length === 0) {
      setMessage("Language name cannot be empty.")
      return
    }
    setBusyId(languageId)
    setMessage(null)
    const result = await repo.updateLanguage(languageId, { name })
    setBusyId(null)
    if (!result.ok) {
      setMessage(result.error.message)
      return
    }
    setEditingId(null)
    await refresh()
  }

  async function remove(language: LanguageDto) {
    if (language.caseCount > 0) {
      setMessage("Delete all vocabulary entries in this language first.")
      return
    }
    setBusyId(language.id)
    const result = await repo.deleteLanguage(language.id)
    setBusyId(null)
    if (!result.ok) {
      setMessage(result.error.message)
      return
    }
    if (language.id === activeLanguageId) {
      const fallback = languages.find((item) => item.id !== language.id)
      if (fallback) onSwitch(fallback.id)
    }
    await refresh()
  }

  async function createLanguage() {
    const name = newName.trim()
    const icon = singleEmoji(newIcon)
    if (name.length === 0 || icon.length === 0) {
      setMessage("Name and icon are required.")
      return
    }
    setBusyId("new")
    const result = await repo.createLanguage(name, icon)
    setBusyId(null)
    if (!result.ok) {
      setMessage(result.error.message)
      return
    }
    setNewName("")
    setNewIcon("🌐")
    setCreateOpen(false)
    await refresh()
    onSwitch(result.value.id)
  }

  function openCreate() {
    setEditingId(null)
    setMessage(null)
    setCreateOpen(true)
  }

  function cancelCreate() {
    setCreateOpen(false)
    setNewName("")
    setNewIcon("🌐")
    setMessage(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onClick={onClose}>
      <DialogPanel
        className="flex max-h-[min(32rem,90dvh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-grid-line bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-grid-line px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Languages</h2>
          <p className="mt-1 text-sm text-muted">Tap an icon to change it. Delete only when no entries remain.</p>
        </div>

        <ul className="scrollbar-hidden flex-1 overflow-y-auto divide-y divide-grid-line">
          {loading ? (
            <li className="px-5 py-6 text-sm text-muted">Loading…</li>
          ) : (
            languages.map((language) => {
              const active = language.id === activeLanguageId
              const editing = editingId === language.id
              const rowBusy = busyId === language.id

              if (editing) {
                return (
                  <li key={language.id} className="px-5 py-3">
                    <div className="rounded-xl border border-grid-line bg-tile/30 p-3">
                      <div className="flex items-start gap-2">
                        <EmojiIconPicker
                          variant="compact"
                          value={language.icon}
                          ariaLabel={`Icon for ${language.name}`}
                          busy={rowBusy}
                          onPick={(emoji) => void saveIcon(language.id, emoji)}
                        />
                        <LanguageNameField
                          value={editName}
                          autoFocus
                          disabled={rowBusy}
                          onChange={setEditName}
                        />
                      </div>
                      <div className="mt-3">
                        <LanguageFormActions
                          saving={rowBusy}
                          onCancel={() => setEditingId(null)}
                          onSave={() => void saveEditName(language.id)}
                        />
                      </div>
                    </div>
                  </li>
                )
              }

              return (
                <li key={language.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <EmojiIconPicker
                      variant="compact"
                      value={language.icon}
                      ariaLabel={`Change icon for ${language.name}`}
                      busy={rowBusy}
                      onPick={(emoji) => void saveIcon(language.id, emoji)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onSwitch(language.id)
                        onClose()
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${active ? "bg-accent/15 ring-1 ring-accent/50" : "hover:bg-tile"}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">{language.name}</span>
                        <span className="text-xs text-muted">{language.caseCount} entries</span>
                      </span>
                      {active ? (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-accent">Active</span>
                      ) : null}
                    </button>
                    <IconButton
                      label={`Edit ${language.name}`}
                      disabled={editingId !== null || createOpen}
                      onClick={() => startEdit(language)}
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton
                      label={`Delete ${language.name}`}
                      tone="danger"
                      disabled={language.caseCount > 0 || rowBusy || editingId !== null || createOpen}
                      title={language.caseCount > 0 ? "Delete all entries first" : "Delete language"}
                      onClick={() => void remove(language)}
                    >
                      <IconTrash />
                    </IconButton>
                  </div>
                </li>
              )
            })
          )}
        </ul>

        {createOpen ? (
          <div className="shrink-0 border-t border-grid-line bg-tile/50 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">New language</p>
            <div className="mt-2 flex items-start gap-2">
              <EmojiIconPicker
                variant="compact"
                value={newIcon}
                ariaLabel="New language icon"
                disabled={busyId === "new"}
                onPick={setNewIcon}
              />
              <LanguageNameField
                value={newName}
                disabled={busyId === "new"}
                placeholder="Name"
                autoFocus
                onChange={setNewName}
              />
            </div>
            <div className="mt-3">
              <LanguageFormActions
                saveLabel="Create language"
                saving={busyId === "new"}
                onCancel={cancelCreate}
                onSave={() => void createLanguage()}
              />
            </div>
            {message ? <p className="mt-2 text-sm text-danger">{message}</p> : null}
          </div>
        ) : (
          <div className="shrink-0 border-t border-grid-line bg-tile/50 px-5 py-3">
            <button
              type="button"
              onClick={openCreate}
              disabled={editingId !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-grid-line bg-card py-2.5 text-sm font-medium text-foreground transition hover:border-accent/40 hover:text-accent disabled:opacity-40"
            >
              <IconPlus />
              Add language
            </button>
            {message ? <p className="mt-2 text-center text-sm text-danger">{message}</p> : null}
          </div>
        )}
      </DialogPanel>
    </div>
  )
}

function DialogPanel({
  className,
  children,
  onClick,
}: {
  readonly className: string
  readonly children: ReactNode
  readonly onClick: (event: MouseEvent) => void
}) {
  return (
    <div role="dialog" aria-modal="true" className={className} onClick={onClick}>
      {children}
    </div>
  )
}