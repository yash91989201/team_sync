// UTILS
import { env } from "@/env";
import { pbClient } from "@/server/pb/config";

export async function GET(
  _request: Request,
  { params }: { params: { payslipId: string } },
) {
  try {
    const payslipId = params.payslipId;
    const pdf = await pbClient.collection("payslip").getOne(payslipId);
    const res = await fetch(
      `${env.POCKETBASE_URL}/api/files/payslip/${payslipId}/${pdf.file}`,
    );

    const pdfFile = await res.blob();

    return new Response(pdfFile, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `filename=${pdf.name}`
      }
    });
  } catch (error) {
    return Response.json({ message: "Unable to find payslip pdf." }, { status: 404 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const imageId = params.id;
    const formData = await request.formData();

    await pbClient
      .collection("user_profile")
      .update(imageId, formData)

    return Response.json({
      status: "SUCCESS",
      message: "Image updated successfully",
    });
  } catch (error) {
    return Response.json({
      status: "FAILED",
      message: "Unable to update profile image",
    });
  }
}