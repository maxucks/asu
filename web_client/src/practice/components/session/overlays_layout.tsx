import { NewCaseLayout } from "@/practice/components/case/new_case_layout"
import { ConfirmBox } from "@/practice/components/session/confirm_box"

type OverlaysLayoutProps = {
  readonly createOpen: boolean
  readonly createBusy: boolean
  readonly onCloseCreate: () => void
  readonly onCreate: (value: string, meaning: string) => void
  readonly assocDelete: { readonly open: boolean; readonly message: string; readonly busy: boolean; readonly onCancel: () => void; readonly onConfirm: () => void }
  readonly caseDelete: { readonly open: boolean; readonly message: string; readonly busy: boolean; readonly onCancel: () => void; readonly onConfirm: () => void }
}

export function OverlaysLayout(props: OverlaysLayoutProps) {
  return (
    <>
      <NewCaseLayout open={props.createOpen} saving={props.createBusy} onCancel={props.onCloseCreate} onCreate={props.onCreate} />
      <ConfirmBox open={props.assocDelete.open} title="Delete association?" message={props.assocDelete.message} confirmLabel="Delete" busy={props.assocDelete.busy} onCancel={props.assocDelete.onCancel} onConfirm={props.assocDelete.onConfirm} />
      <ConfirmBox open={props.caseDelete.open} title="Delete this entry?" message={props.caseDelete.message} confirmLabel="Delete" busy={props.caseDelete.busy} onCancel={props.caseDelete.onCancel} onConfirm={props.caseDelete.onConfirm} />
    </>
  )
}