// UTILS
import { env } from "@/env";
import { pbClient } from "@/server/pb/config";

export async function GET(
    _request: Request,
    { params }: { params: { id: string } },
) {
    const fileId = params.id;
    const fileData = await pbClient.collection("employee_document_file").getOne(fileId);
    const res = await fetch(
        `${env.POCKETBASE_URL}/api/files/employee_document_file/${fileId}/${fileData.file}`,
    );

    const documentFile = await res.blob();

    return new Response(documentFile, {
        headers: {
            "Content-Type": fileData.file_type
        }
    });
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } },
) {
    try {
        const fileId = params.id;
        const formData = await request.formData();

        await pbClient
            .collection("employee_document_file")
            .update(fileId, formData)

        return Response.json({
            status: "SUCCESS",
            message: "File updated successfully",
        });
    } catch (error) {
        return Response.json({
            status: "FAILED",
            message: "Unable to update file",
        });
    }
}