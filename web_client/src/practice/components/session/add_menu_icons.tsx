import { EmojiPickerTriggerIcon, MutedMenuGlyph } from "@/core/components/atoms/emoji_picker_trigger_icon"
import { IMAGE_ASSOCIATION_STUB_REFS, type AssociationAddMenuItem } from "@/practice/practice_utils"

export function AddMenuItemIcon({ item }: { readonly item: AssociationAddMenuItem }) {
  const pick = item.pick
  if (pick.action === "text") {
    return <EmojiPickerTriggerIcon size={18} className="text-muted opacity-70" />
  }
  if (pick.action === "image_url") return <MutedMenuGlyph>🔗</MutedMenuGlyph>
  if (pick.action === "image_stub") {
    if (pick.contentRef === IMAGE_ASSOCIATION_STUB_REFS.upload) return <MutedMenuGlyph>📤</MutedMenuGlyph>
    if (pick.contentRef === IMAGE_ASSOCIATION_STUB_REFS.gifLibrary) return <MutedMenuGlyph>🎞️</MutedMenuGlyph>
    return <MutedMenuGlyph>🖼️</MutedMenuGlyph>
  }
  if (pick.action === "kind_stub") {
    if (pick.kind === "audio") return <MutedMenuGlyph>🔈</MutedMenuGlyph>
    if (pick.kind === "sketch") return <MutedMenuGlyph>✏️</MutedMenuGlyph>
    return <MutedMenuGlyph>🎬</MutedMenuGlyph>
  }
  return <EmojiPickerTriggerIcon size={18} className="text-muted opacity-70" />
}