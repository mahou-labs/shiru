import { Dialog, DialogPopup } from "@shiru/ui/dialog";

import { CreateOrgWizard } from "./create-org-wizard";

type CreateOrgDialogProps = {
  allowClosing?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function CreateOrgDialog({
  allowClosing = false,
  isOpen,
  onSuccess,
  onOpenChange,
}: CreateOrgDialogProps) {
  return (
    <Dialog disablePointerDismissal={!allowClosing} onOpenChange={onOpenChange} open={isOpen}>
      <DialogPopup className="sm:max-w-lg" showCloseButton={allowClosing}>
        <div className="p-6">
          <CreateOrgWizard
            onCancel={allowClosing ? () => onOpenChange(false) : undefined}
            onSuccess={onSuccess}
          />
        </div>
      </DialogPopup>
    </Dialog>
  );
}
