"use client";
import Link from "next/link";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { useDropzone } from "react-dropzone";
// UTILS
import { formatFileSize } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
// TYPES
import type { DropzoneOptions } from "react-dropzone";
import type { DocumentTypeSchemaType } from "@/lib/types";
// ICONS
import { UploadCloudIcon } from "lucide-react";

const variants = {
  base: "relative rounded-md p-4 flex justify-center items-center flex-col cursor-pointer border border-dashed border-gray-400 dark:border-gray-300 transition-colors duration-200 ease-in-out",
  active: "border-2",
  disabled:
    "bg-gray-200 border-gray-300 cursor-default pointer-events-none bg-opacity-30 dark:bg-gray-700 dark:border-gray-600",
  accept: "border border-blue-500 bg-blue-500 bg-opacity-10",
  reject: "border border-red-700 bg-red-700 bg-opacity-10",
};

type InputProps = {
  className?: string;
  fileUrl: string;
  fileType: DocumentTypeSchemaType["fileType"];
  fileIndex: number;
  onChange?: (file?: File) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, "disabled">;
};

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: number) {
    return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
  },
  fileInvalidType() {
    return "Invalid file type.";
  },
  tooManyFiles(maxFiles: number) {
    return `You can only add ${maxFiles} file(s).`;
  },
  fileNotSupported() {
    return "The file is not supported.";
  },
};

const UpdateDocumentInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      dropzoneOptions,
      fileUrl,
      fileType,
      fileIndex,
      className,
      disabled,
      onChange,
    },
    ref,
  ) => {
    const [value, setValue] = React.useState<File | undefined>(undefined);

    const imageUrl = React.useMemo(() => {
      if (value) {
        return URL.createObjectURL(value);
      }
      return null;
    }, [value]);
    // dropzone configuration
    const {
      getRootProps,
      getInputProps,
      fileRejections,
      isFocused,
      acceptedFiles,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      disabled,
      multiple: false,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          setValue(file);
          void onChange?.(file);
        }
      },
      ...dropzoneOptions,
    });

    // styling
    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className,
        ).trim(),
      [
        isFocused,
        fileRejections,
        isDragAccept,
        isDragReject,
        disabled,
        className,
      ],
    );

    // error validation messages
    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0];
        if (errors[0]?.code === "file-too-large") {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
        } else if (errors[0]?.code === "file-invalid-type") {
          return ERROR_MESSAGES.fileInvalidType();
        } else if (errors[0]?.code === "too-many-files") {
          return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
        } else {
          return ERROR_MESSAGES.fileNotSupported();
        }
      }
      return undefined;
    }, [fileRejections, dropzoneOptions]);

    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-xl bg-primary p-3 text-lg text-white">
          File {fileIndex}
        </p>
        <div className="flex h-64 w-full p-3">
          {fileType === "application/pdf" ? (
            <div className="relative flex h-16 w-16 flex-1 flex-col gap-1.5">
              <p>Current file</p>
              <Link
                target="_blank"
                href={fileUrl}
                className={buttonVariants({
                  variant: "ghost",
                  className: "group relative gap-1",
                })}
              >
                Preview file
              </Link>
            </div>
          ) : (
            <picture className="relative aspect-square h-full">
              <p>Current file</p>
              <img src={fileUrl.slice(21)} alt="Update document file" />
            </picture>
          )}
          <div className="5 flex flex-col gap-1">
            <p>Updated file</p>

            <div
              {...getRootProps({
                className: dropZoneClassName,
              })}
            >
              {/* Main File Input */}
              <input ref={ref} {...getInputProps()} />

              {imageUrl ? (
                // Image Preview
                <picture>
                  <img
                    className="h-full w-full rounded-md object-cover"
                    src={imageUrl}
                    alt={acceptedFiles[0]?.name}
                  />
                </picture>
              ) : (
                // Upload Icon
                <div className="flex flex-col items-center justify-center text-xs text-gray-400">
                  <UploadCloudIcon className="mb-2 h-7 w-7" />
                  <div className="text-gray-400">drag & drop to upload</div>
                </div>
              )}

              {/* Remove Image Icon */}
              {imageUrl && !disabled && (
                <div
                  className="group absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onChange?.(undefined);
                  }}
                ></div>
              )}
            </div>
            <div>
              {/* Error Text */}
              <div className="mt-1 text-xs text-red-500">{errorMessage}</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
UpdateDocumentInput.displayName = "UpdateDocumentInput";

export { UpdateDocumentInput };
