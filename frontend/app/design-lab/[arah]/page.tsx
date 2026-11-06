import { notFound } from "next/navigation";
import ArahA from "../_components/ArahA";
import ArahB from "../_components/ArahB";
import ArahC from "../_components/ArahC";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ arah: "a" }, { arah: "b" }, { arah: "c" }];
}

export default async function DesignLabArahPage({ params }: { params: Promise<{ arah: string }> }) {
  const { arah } = await params;
  if (arah === "a") return <ArahA />;
  if (arah === "b") return <ArahB />;
  if (arah === "c") return <ArahC />;
  notFound();
}
