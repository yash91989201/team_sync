import PocketBase from "pocketbase";
// UTILS
import { env } from "@/env";

export const pbClient = new PocketBase(env.POCKETBASE_URL);
