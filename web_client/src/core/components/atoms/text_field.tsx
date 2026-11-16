import { EmojiPop } from "@/core/components/atoms/emoji_pop"
import { insertTextAtCaret } from "@/core/utils/insert_text_at_caret"
import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type Ref,
  type TextareaHTMLAttributes,
} from "react"

export const textFieldClassName =
  "w-full rounded-lg border border-grid-line bg-tile px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") ref(value)
      else ref.current = value
    }
  }
}

type SharedProps = {
  readonly className?: string
}

export type TextFieldProps = SharedProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">

export type TextAreaProps = SharedProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">

function useEmojiInsert<T extends HTMLInputElement | HTMLTextAreaElement>(
  value: string | number | readonly string[] | undefined,
  onChange: ((event: ChangeEvent<T>) => void) | undefined,
) {
  const fieldRef = useRef<T | null>(null)
  const selectionRef = useRef({ start: 0, end: 0 })
  const [pickerOpen, setPickerOpen] = useState(false)

  const stringValue = typeof value === "string" ? value : value === undefined ? "" : String(value)

  const rememberSelection = useCallback(() => {
    const element = fieldRef.current
    if (!element) return
    const start = element.selectionStart
    const end = element.selectionEnd
    if (start === null || end === null) return
    selectionRef.current = { start, end }
  }, [])

  const applyValue = useCallback(
    (nextValue: string, caret: number, refocusField = true) => {
      const element = fieldRef.current
      if (!element || !onChange) return

      selectionRef.current = { start: caret, end: caret }

      onChange({
        target: { ...element, value: nextValue },
        currentTarget: { ...element, value: nextValue },
      } as ChangeEvent<T>)

      if (!refocusField) return

      requestAnimationFrame(() => {
        element.focus()
        element.setSelectionRange(caret, caret)
      })
    },
    [onChange],
  )

  const onEmojiPick = useCallback(
    (emoji: string) => {
      const element = fieldRef.current
      if (!element) return

      const live = document.activeElement === element
      const selectionStart = live ? element.selectionStart : selectionRef.current.start
      const selectionEnd = live ? element.selectionEnd : selectionRef.current.end

      const { nextValue, caret } = insertTextAtCaret(stringValue, selectionStart, selectionEnd, emoji)
      applyValue(nextValue, caret)
    },
    [applyValue, stringValue],
  )

  const togglePicker = useCallback(() => {
    rememberSelection()
    setPickerOpen((open) => !open)
  }, [rememberSelection])

  const fieldSelectionHandlers = {
    onSelect: rememberSelection,
    onKeyUp: rememberSelection,
    onMouseUp: rememberSelection,
    onBlur: rememberSelection,
  }

  return { fieldRef, pickerOpen, setPickerOpen, onEmojiPick, togglePicker, fieldSelectionHandlers }
}

function EmojiTriggerButton({
  disabled,
  multiline,
  onClick,
}: {
  readonly disabled?: boolean
  readonly multiline: boolean
  readonly onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={
        multiline
          ? "absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-md text-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"
          : "absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"
      }
      aria-label="Insert emoji"
      title="Insert emoji"
    >
      <span aria-hidden>😀</span>
    </button>
  )
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { className, disabled, onChange, value, ...rest },
  ref,
) {
  const { fieldRef, pickerOpen, setPickerOpen, onEmojiPick, togglePicker, fieldSelectionHandlers } =
    useEmojiInsert<HTMLInputElement>(value, onChange)

  return (
    <div className="relative">
      <input
        {...rest}
        {...fieldSelectionHandlers}
        ref={mergeRefs(ref, fieldRef)}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={className ?? textFieldClassName}
      />
      <EmojiTriggerButton
        disabled={disabled}
        multiline={false}
        onClick={togglePicker}
      />
      {pickerOpen && !disabled ? (
        <EmojiPop onPick={onEmojiPick} onClose={() => setPickerOpen(false)} />
      ) : null}
    </div>
  )
})

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, disabled, onChange, value, ...rest },
  ref,
) {
  const { fieldRef, pickerOpen, setPickerOpen, onEmojiPick, togglePicker, fieldSelectionHandlers } =
    useEmojiInsert<HTMLTextAreaElement>(value, onChange)

  return (
    <div className="relative">
      <textarea
        {...rest}
        {...fieldSelectionHandlers}
        ref={mergeRefs(ref, fieldRef)}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={className ?? textFieldClassName}
      />
      <EmojiTriggerButton disabled={disabled} multiline onClick={togglePicker} />
      {pickerOpen && !disabled ? (
        <EmojiPop onPick={onEmojiPick} onClose={() => setPickerOpen(false)} />
      ) : null}
    </div>
  )
})