import { toast } from "sonner";
import { useState } from "react";
// UITLS
import { api } from "@/trpc/react";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UI
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@ui/button";
// ICONS
import { Input } from "@/components/ui/input";
import { Loader2, Trash } from "lucide-react";

export default function DeleteDocumentTypeForm({
  id,
  type,
}: {
  id: string;
  type: string;
}) {
  const dialog = useToggle(false);
  const [documentType, setDocumentType] = useState("");

  const { refetch: refetchDocumentTypes } =
    api.documentRouter.getTypes.useQuery();

  const { mutateAsync: deleteDocumentType, isPending } =
    api.documentRouter.deleteDocumentType.useMutation();

  const toggleDialog = () => {
    dialog.toggle();
    setDocumentType("");
  };

  const deleteDocumentTypeAction = async () => {
    if (documentType !== type) {
      return;
    }

    const actionResponse = await deleteDocumentType({ id });

    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchDocumentTypes();
      dialog.close();
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Dialog open={dialog.isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-red-500 text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500 [&>svg]:size-4"
        >
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deleting &apos;{type}&apos; document type ?</DialogTitle>
        </DialogHeader>
        <div className="my-3 space-y-3">
          <p className="text-sm font-medium text-red-500">
            Deleting a document type will also delete employee&apos;s document
            and document files with this document type. Do you still want to
            continue ?
          </p>
          <p className="text-sm text-gray-700">
            Enter document type to confirm deletion.
          </p>
          <Input
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="Enter document type"
          />
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="secondary">No! go back.</Button>
          </DialogTrigger>
          <Button
            variant="destructive"
            className="gap-1"
            disabled={isPending || documentType !== type}
            onClick={deleteDocumentTypeAction}
          >
            {isPending ? <Loader2 /> : null}
            <span>Yes, continue.</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
