import PocketBase from "pocketbase";
// UTILS
import { env } from "@/env";
// TYPES
import type { TypedPocketBase } from "@/lib/pocketbase-types";

export const pbClient = new PocketBase(env.POCKETBASE_URL) as TypedPocketBase;
