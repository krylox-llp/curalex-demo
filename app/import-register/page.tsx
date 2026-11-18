import { Suspense } from "react";
import { redirect } from "next/navigation";
import ProductForm from "../components/ProductForm";

export default function ImportRegisterPage({ searchParams }: PageProps<"/import-register">) {
  return (
    <Suspense>
      <CountryForm searchParams={searchParams} />
    </Suspense>
  );
}

async function CountryForm({ searchParams }: Pick<PageProps<"/import-register">, "searchParams">) {
  const { country } = await searchParams;
  const value = typeof country === "string" ? country.trim() : "";

  // A country must be chosen on the dashboard first
  if (!value) redirect("/register");

  return <ProductForm country={value} />;
}
