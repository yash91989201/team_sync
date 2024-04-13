// UTILS
import { env } from "@/env";
import { pbClient } from "@/server/pb/config";
// TYPES
import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const imageId = params.id;
  const image = await pbClient.collection("user_profile").getOne(imageId);
  const res = await fetch(
    `${env.POCKETBASE_URL}/api/files/user_profile/${imageId}/${image.image}`,
  );

  const profileImage = await res.blob();

  return new Response(profileImage, {
    headers: {
      "Content-Type": "image/png",
    },
    status: 200,
  });
}
