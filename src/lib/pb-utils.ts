import { generateId } from "lucia";

export async function uploadProfileImage(
  image: File,
): Promise<{ imageUrl: string | null }> {
  const formData = new FormData();
  formData.append("id", generateId(15));
  formData.append("image", image);
  formData.append("file_type", image.type);
  formData.append("file_size", image.size.toString());

  const res = await fetch("/api/profile-image", {
    method: "POST",
    body: formData,
  });
  const resp = (await res.json()) as UploadProfileImageStatusType;

  if (resp.status === "SUCCESS") {
    return {
      imageUrl: resp.imageUrl,
    };
  }

  return {
    imageUrl: null,
  };
}

export async function uploadEmployeeDocumentFiles(files: File[]): Promise<UploadEmployeeDocumentsStatusType> {

  const formData = new FormData()
  files.forEach((file) => formData.append("file", file))

  const res = await fetch("/api/employee-documents", {
    method: "POST",
    body: formData,
  })

  const data = (await res.json()) as UploadEmployeeDocumentsStatusType
  return data;
}

export async function updateEmployeeDocumentFile({ fileId, file }: { fileId: string; file: File | undefined }): Promise<UpdateDocumentFileStatusType> {

  const formData = new FormData()
  if (file === undefined) return { status: "FAILED", message: "Please provide a file to update" }

  formData.append("file", file)

  const res = await fetch(`/api/employee-documents/${fileId}`, {
    method: "PATCH",
    body: formData,
  })

  const data = (await res.json()) as UpdateDocumentFileStatusType
  return data;
}

export async function deleteEmployeeDocumentFiles(filesId: string[]): Promise<DeleteDocumentsFilesStatusType> {
  const formData = new FormData();
  filesId.forEach(fileId => formData.append("fileId", fileId))

  const res = await fetch("/api/employee-documents", {
    method: "DELETE",
    body: formData,
  })

  const data = (await res.json()) as DeleteDocumentsFilesStatusType
  return data;
}