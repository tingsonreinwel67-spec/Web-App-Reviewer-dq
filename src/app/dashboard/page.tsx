import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardPage } from "./DashboardPage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardPage />;
}
