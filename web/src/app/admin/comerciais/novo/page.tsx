import { UserForm } from "@/components/admin/UserForm";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default function NovoComercialPage() {
  return (
    <PanelLayout
      scope="admin"
      title="Novo comercial"
      subtitle="Cadastre um executivo de contas — role 'sales' liberada de cara"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <UserForm
        mode="create"
        initial={{
          role: "sales",
          status: "watching",
        }}
      />
    </PanelLayout>
  );
}
