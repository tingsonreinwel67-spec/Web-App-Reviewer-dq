// app/learningMethods/memorization/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemorizationPage } from "./MemorizationPage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return <MemorizationPage />;
}
