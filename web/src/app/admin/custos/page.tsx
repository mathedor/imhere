import type { Metadata } from "next";
import { CustosClient } from "@/components/admin/CustosClient";

export const metadata: Metadata = {
  title: "Custos & Desenvolvimento · Admin",
};

export default function CustosPage() {
  return <CustosClient />;
}
