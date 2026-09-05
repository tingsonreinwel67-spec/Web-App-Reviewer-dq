import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GlossaryPage } from "./GlossaryPage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return <GlossaryPage />;
}
