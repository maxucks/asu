"use client"

import { NoteAddStepperControl } from "@/practice/components/notes/note_add_stepper_control"

type NotesAddControlProps = {
  readonly saving?: boolean
  readonly onCreate: (name: string, content: string) => boolean | Promise<boolean>
  readonly className?: string
  readonly label?: string
}

export function NotesAddControl({ saving, onCreate, className, label = "Add note" }: NotesAddControlProps) {
  return (
    <NoteAddStepperControl
      className={className}
      saving={saving}
      onCreate={onCreate}
      triggerLabel={label}
    />
  )
}