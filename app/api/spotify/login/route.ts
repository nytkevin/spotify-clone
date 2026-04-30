import { getLoginUrl } from "../../../lib/spotify/spotify";
import { redirect } from "next/navigation";

export async function GET() {
  redirect(getLoginUrl());
}
