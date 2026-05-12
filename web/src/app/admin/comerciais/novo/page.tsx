import { UserForm } from "@/components/admin/UserForm";

export const dynamic = "force-dynamic";

export default function NovoComercialPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Novo comercial</h1>
        <p className="mt-1 text-sm text-text-soft">Cadastre um executivo de contas — role &apos;sales&apos; liberada de cara</p>
      </header>
      <UserForm
        mode="create"
        initial={{
          role: "sales",
          status: "watching",
        }}
      />
    </>
  );
}
