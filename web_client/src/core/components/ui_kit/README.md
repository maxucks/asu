# UI kit (`core/components/ui_kit`)

App-wide visual primitives — not practice-specific. Prefer these before adding one-off classes in feature folders.

| Module | Use for |
|--------|---------|
| `control_styles.ts` | Shared toolbar control sizing (`uiToolbarControlClassName`, `uiSearchFieldClassName`) |
| `search_field.tsx` | `SearchField` — library lists, modals, filters |

**Atoms** (`core/components/atoms/`) remain for fields with emoji picker etc. New generic controls go here; promote from `practice/components` when a second screen needs the same pattern.

When extending the kit: one component per file, export className constants when the same chrome is reused in multiple components.