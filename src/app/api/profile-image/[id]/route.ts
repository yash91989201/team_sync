// UTILS
import { env } from "@/env";
import { pbClient } from "@/server/pb/config";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const imageId = params.id;
  const image = await pbClient.collection("user_profile").getOne(imageId);
  const res = await fetch(
    `${env.POCKETBASE_URL}/api/files/user_profile/${imageId}/${image.image}`,
  );

  const profileImage = await res.blob();

  return new Response(profileImage);
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