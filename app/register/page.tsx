import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <Suspense>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterContent({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const { email: urlEmail } = await searchParams;
  const session = await auth();
  const googleEmail = session?.user?.email;

  // Continue with Google: put the Google email in the URL,
  // same as the normal login -> /register?email=user@gmail.com
  if (googleEmail) {
    if (urlEmail !== googleEmail) {
      redirect(`/register?email=${encodeURIComponent(googleEmail)}`);
    }
    return <RegisterForm email={googleEmail} />;
  }

  // Normal email login: the email is already in the URL
  const email = typeof urlEmail === "string" ? urlEmail.trim() : "";
  if (!email) redirect("/");

  return <RegisterForm email={email} />;
}
