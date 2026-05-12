import { useRouter } from "expo-router";
import { ArrowRight, Briefcase, Building2, ShieldCheck, User as UserIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { colors, radii, shadows } from "@/theme";

type Role = "user" | "establishment" | "sales" | "admin";

const ROLES: { key: Role; label: string; icon: typeof UserIcon; desc: string }[] = [
  { key: "user", label: "Usuário", icon: UserIcon, desc: "Conhecer pessoas" },
  { key: "establishment", label: "Estabelecimento", icon: Building2, desc: "Bar/restaurante" },
  { key: "sales", label: "Comercial", icon: Briefcase, desc: "Vendas" },
  { key: "admin", label: "Admin", icon: ShieldCheck, desc: "Plataforma" },
];

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("user");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ alignItems: "center", marginBottom: 24, gap: 8 }}>
          <Logo size={40} />
          <Text style={styles.title}>Bem-vindo de volta</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>ENTRAR COMO</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.key;
              return (
                <Pressable key={r.key} onPress={() => setRole(r.key)} style={[styles.roleBtn, active && styles.roleActive]}>
                  <View style={[styles.roleIcon, active && { backgroundColor: colors.brand }]}>
                    <Icon size={14} color={active ? "#fff" : colors.brand} />
                  </View>
                  <Text style={styles.roleLabel}>{r.label}</Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>E-MAIL</Text>
          <TextInput keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholder="seu@email.com" placeholderTextColor={colors.muted} />
          <Text style={styles.fieldLabel}>SENHA</Text>
          <TextInput secureTextEntry style={styles.input} placeholder="••••••••" placeholderTextColor={colors.muted} />

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={styles.submitBtn}
          >
            <Text style={styles.submitText}>ENTRAR</Text>
            <ArrowRight size={14} color="#fff" />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/auth/cadastro")}>
          <Text style={styles.footer}>
            Novo por aqui? <Text style={{ color: colors.brand, fontWeight: "800" }}>Criar conta</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "900" },
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: 18, borderWidth: 1, borderColor: colors.border },
  section: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10, marginBottom: 14 },
  roleBtn: { width: "48.5%", padding: 10, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, gap: 4 },
  roleActive: { borderColor: colors.brand, backgroundColor: "rgba(239,44,57,0.1)" },
  roleIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.surface3, alignItems: "center", justifyContent: "center" },
  roleLabel: { color: colors.text, fontSize: 12, fontWeight: "800" },
  roleDesc: { color: colors.textSoft, fontSize: 9 },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  input: { height: 44, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, paddingHorizontal: 12, color: colors.text, fontSize: 13 },
  submitBtn: { marginTop: 16, backgroundColor: colors.brand, borderRadius: radii.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, ...shadows.glow },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  footer: { color: colors.textSoft, fontSize: 13, textAlign: "center", marginTop: 16 },
});
