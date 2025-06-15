import { type ReactNode, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ConfirmationDialogProps {
  trigger?: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
  confirmText?: string;
  cancelText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmButtonVariant?: ButtonProps["variant"];
}

export function ConfirmationDialog({
  trigger,
  title,
  description,
  onConfirm,
  isPending,
  confirmText = "Confirm",
  cancelText = "Cancel",
  open: controlledOpen,
  onOpenChange,
  confirmButtonVariant,
}: ConfirmationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setOpen(false); }}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            disabled={isPending}
            onClick={handleConfirm}
          >
            <Button disabled={isPending} variant={confirmButtonVariant}>
              {isPending ? "Loading..." : confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
