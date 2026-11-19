import { Suspense } from "react";
import DocumentUpload from "../components/DocumentUpload";

export default function UploadDocumentsPage({
  searchParams,
}: PageProps<"/upload-documents">) {
  return (
    <Suspense>
      <UploadContent searchParams={searchParams} />
    </Suspense>
  );
}

async function UploadContent({
  searchParams,
}: Pick<PageProps<"/upload-documents">, "searchParams">) {
  const { email, country } = await searchParams;
  return (
    <DocumentUpload
      email={typeof email === "string" ? email.trim() : ""}
      country={typeof country === "string" ? country.trim() : ""}
    />
  );
}
