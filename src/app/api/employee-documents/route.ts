import { generateId } from "lucia";
// UTILS
import { env } from "@/env";
import { pbClient } from "@/server/pb/config";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("file") as File[]

        const filesData: { id: string, fileUrl: string }[] = await Promise.all(files.map(async (file) => {
            const fileData = new FormData();
            fileData.append("file", file)
            fileData.append("file_type", file.type)
            fileData.append("file_size", file.size.toString())

            const fileUpload = await pbClient
                .collection("employee_document_file").create(fileData, {
                    requestKey: generateId(15)
                })

            return {
                id: fileUpload.id,
                fileUrl: `${env.NEXT_SITE_URL}/api/employee-documents/${fileUpload.id}`
            }
        }))

        return Response.json({
            status: "SUCCESS",
            message: "Image uploaded successfully",
            data: {
                filesData
            }
        });
    } catch (error) {
        return Response.json({
            status: "FAILED",
            message: "Unable to upload profile image",
        });
    }
}

export async function DELETE(request: Request) {
    try {
        const formData = await request.formData();
        const filesId = formData.getAll("filesId") as string[]

        await Promise.all(filesId.map(async (fileId) => {
            // eslint-disable-next-line
            await pbClient
                .collection("employee_document_file")
                .delete(fileId)
        }))

        return Response.json({
            status: "SUCCESS",
            message: "Employee document files deleted successfully",

        });
    } catch (error) {
        return Response.json({
            status: "FAILED",
            message: "Unable to delete employee document files, please try again.",
        });
    }
}
