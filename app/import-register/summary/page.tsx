import { Suspense } from "react";
import ProductSummary from "../../components/ProductSummary";

export default function SummaryPage({
  searchParams,
}: PageProps<"/import-register/summary">) {
  return (
    <Suspense>
      <SummaryContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SummaryContent({
  searchParams,
}: Pick<PageProps<"/import-register/summary">, "searchParams">) {
  const { country } = await searchParams;
  const value = typeof country === "string" ? country.trim() : "";
  return <ProductSummary country={value} />;
}
