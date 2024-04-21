import Link from "next/link";
import Image from "next/image";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
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
import { ArrowDownToLine, Eye } from "lucide-react";

type FilesPreviewProps = {
  files: EmployeeDocumentFileSchemaType[];
  documentType: DocumentTypeSchemaType;
  employee: Omit<UserType, "password">;
};

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function DocumentsPreview({
  files,
  employee,
  documentType,
}: FilesPreviewProps) {
  if (documentType.fileType === "application/pdf") {
    return (
      <article>
        {files.map((file) => (
          <Dialog key={file.id}>
            <DialogTrigger>pdf</DialogTrigger>
            <DialogContent className="min-h-[80%] min-w-[90%]">
              <DialogTitle className="text-base font-semibold">
                {employee.name}&apos;s {documentType.type} pdf
              </DialogTitle>
              <div className="h-full overflow-auto">
                <Document file={file.fileUrl.slice(21)} className="mx-auto">
                  <Page pageNumber={1} />
                </Document>
              </div>
              <DialogFooter>
                <Link
                  download
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
                download
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
