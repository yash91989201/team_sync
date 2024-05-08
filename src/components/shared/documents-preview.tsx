import Link from "next/link";
import Image from "next/image";
// UTILS
import { buttonVariants } from "@/components/ui/button";
// TYPES
import type {
  UserType,
  DocumentTypeSchemaType,
  EmployeeDocumentFileSchemaType,
} from "@/lib/types";
// UI
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
// ICONS
import { ArrowDownToLine, Eye, FileText } from "lucide-react";

type FilesPreviewProps = {
  files: EmployeeDocumentFileSchemaType[];
  documentType: DocumentTypeSchemaType;
  employee: UserType;
};

export default function DocumentsPreview({
  files,
  employee,
  documentType,
}: FilesPreviewProps) {
  if (documentType.fileType === "application/pdf") {
    return (
      <article>
        {files.map((file) => (
          <Link
            key={file.id}
            target="_blank"
            href={file.fileUrl}
            className={buttonVariants({
              variant: "ghost",
              className: "group relative gap-1",
            })}
          >
            <Eye className="hidden size-4 text-gray-600 group-hover:block" />
            <FileText className="size-4 group-hover:hidden" />
          </Link>
        ))}
      </article>
    );
  }

  return (
    <picture className="flex flex-wrap gap-3">
      {files.map((file) => (
        <Dialog key={file.id}>
          <DialogTrigger className="group relative p-2">
            <div className="absolute inset-0 z-50 hidden items-center justify-center rounded-md bg-gray-300/50 group-hover:flex">
              <Eye className="size-5 text-gray-600" />
            </div>
            <div className="relative flex h-16 w-16 cursor-pointer p-3">
              <Image
                src={file.fileUrl.slice(21)}
                alt={file.empDocumentId}
                fill
              />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="text-base font-semibold">
              {employee.name}&apos;s {documentType.type} image
            </DialogTitle>
            <div className="relative mx-auto h-72 w-72">
              <Image
                src={file.fileUrl.slice(21)}
                alt={file.empDocumentId}
                fill
              />
            </div>
            <DialogFooter>
              <Link
                download={`${employee.name}'s ${documentType.type}`}
                target="_blank"
                href={file.fileUrl.slice(21)}
                className={buttonVariants({ className: "gap-1" })}
              >
                <ArrowDownToLine className="size-4" />
                <span>Download</span>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </picture>
  );
}
