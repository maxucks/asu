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
  "w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none disabled:opacity-60"

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
  const [pickerOpen, setPickerOpen] = useState(false)

  const stringValue = typeof value === "string" ? value : value === undefined ? "" : String(value)

  const applyValue = useCallback(
    (nextValue: string, caret: number) => {
      const element = fieldRef.current
      if (!element || !onChange) return

      onChange({
        target: { ...element, value: nextValue },
        currentTarget: { ...element, value: nextValue },
      } as ChangeEvent<T>)

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
      const { nextValue, caret } = insertTextAtCaret(
        stringValue,
        element.selectionStart,
        element.selectionEnd,
        emoji,
      )
      applyValue(nextValue, caret)
    },
    [applyValue, stringValue],
  )

  return { fieldRef, pickerOpen, setPickerOpen, onEmojiPick }
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
  const { fieldRef, pickerOpen, setPickerOpen, onEmojiPick } = useEmojiInsert<HTMLInputElement>(value, onChange)

  return (
    <div className="relative">
      <input
        {...rest}
        ref={mergeRefs(ref, fieldRef)}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={className ?? textFieldClassName}
      />
      <EmojiTriggerButton
        disabled={disabled}
        multiline={false}
        onClick={() => setPickerOpen((open) => !open)}
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
  const { fieldRef, pickerOpen, setPickerOpen, onEmojiPick } = useEmojiInsert<HTMLTextAreaElement>(value, onChange)

  return (
    <div className="relative">
      <textarea
        {...rest}
        ref={mergeRefs(ref, fieldRef)}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={className ?? textFieldClassName}
      />
      <EmojiTriggerButton disabled={disabled} multiline onClick={() => setPickerOpen((open) => !open)} />
      {pickerOpen && !disabled ? (
        <EmojiPop onPick={onEmojiPick} onClose={() => setPickerOpen(false)} />
      ) : null}
    </div>
  )
})