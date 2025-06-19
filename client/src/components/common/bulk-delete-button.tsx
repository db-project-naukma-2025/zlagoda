import { IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { Button } from "@/components/ui/button";

interface BulkDeleteButtonProps<T> {
  selectedItems: T[];
  onDelete: (items: T[]) => Promise<void>;
  onSuccess: () => void;
  isPending: boolean;
  itemName: string;
}

export function BulkDeleteButton<T>({
  selectedItems,
  onDelete,
  onSuccess,
  isPending,
  itemName,
}: BulkDeleteButtonProps<T>) {
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      await onDelete(selectedItems);
      toast.success(
        `${selectedItems.length.toString()} ${itemName} deleted successfully`,
      );
      onSuccess();
    } catch {
      toast.error(`Failed to delete ${itemName}`);
    }
  };

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description={`Are you sure you want to delete ${selectedItems.length.toString()} selected ${itemName}? This action cannot be undone.`}
      isPending={isPending}
      title={`Delete ${itemName}`}
      trigger={
        <Button
          disabled={isPending || selectedItems.length === 0}
          size="sm"
          variant="destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          {isPending
            ? "Deleting..."
            : `Delete (${selectedItems.length.toString()})`}
        </Button>
      }
      onConfirm={() => {
        void handleBulkDelete();
      }}
    />
  );
}
