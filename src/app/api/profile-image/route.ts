// UTILS
import { env } from "@/env";
import { pbClient } from "@/server/pb/config";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const uploadImageQuery = await pbClient
      .collection("user_profile")
      .create(formData);

    const imageUrl = `${env.NEXT_SITE_URL}/api/profile-image/${uploadImageQuery.id}`;
    console.log(uploadImageQuery);

    return Response.json({
      status: "SUCCESS",
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      status: "FAILED",
      message: "Unable to upload profile image",
    });
  }
}
