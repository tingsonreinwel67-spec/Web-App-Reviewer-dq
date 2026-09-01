// app/learningMethods/practiceExam/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PracticeExamPage } from "./PracticeExamPage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return <PracticeExamPage />;
}
