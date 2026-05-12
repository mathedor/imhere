import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Briefcase, Camera, ChevronRight, Eye, EyeOff, Instagram, LogOut, MessageCirclePlus, Save, Settings, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, shadows } from "@/theme";

type Status = "open" | "watching" | "invisible";

const STATUS_OPTIONS: { key: Status; label: string; icon: typeof MessageCirclePlus; color: string }[] = [
  { key: "open", label: "Aberto", icon: MessageCirclePlus, color: colors.success },
  { key: "watching", label: "Observando", icon: Eye, color: colors.warn },
  { key: "invisible", label: "Invisível", icon: EyeOff, color: colors.muted },
];

export default function PerfilScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("open");
  const [name, setName] = useState("Mateus Henrique");
  const [bio, setBio] = useState("Curto bons drinks, música ao vivo e conversas que rendem.");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu perfil</Text>
          <Pressable style={styles.iconBtn}>
            <Settings size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image source="https://i.pravatar.cc/600?img=14" style={styles.avatar} />
            <Pressable style={styles.cameraBtn}>
              <Camera size={11} color="#fff" />
              <Text style={styles.cameraText}>Trocar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status de visibilidade</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = status === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setStatus(opt.key)}
                  style={[styles.statusBtn, active && { borderColor: colors.brand, backgroundColor: "rgba(239,44,57,0.1)" }]}
                >
                  <View style={[styles.statusIcon, { backgroundColor: `${opt.color}25` }]}>
                    <Icon size={13} color={opt.color} />
                  </View>
                  <Text style={styles.statusLabel}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          <Text style={styles.fieldLabel}>NOME</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
          <Text style={styles.fieldLabel}>SOBRE VOCÊ</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            style={[styles.input, { minHeight: 80, textAlignVertical: "top", paddingTop: 12 }]}
          />
          <Text style={styles.fieldLabel}>PROFISSÃO</Text>
          <View style={styles.iconInput}>
            <Briefcase size={14} color={colors.muted} />
            <TextInput defaultValue="Designer UX" style={{ flex: 1, color: colors.text, fontSize: 13 }} />
          </View>
          <Text style={styles.fieldLabel}>INSTAGRAM</Text>
          <View style={styles.iconInput}>
            <Instagram size={14} color={colors.muted} />
            <TextInput defaultValue="@mateusxh" style={{ flex: 1, color: colors.text, fontSize: 13 }} />
          </View>
        </View>

        <Pressable onPress={() => router.push("/(tabs)/planos")} style={styles.upgradeCard}>
          <Sparkles size={18} color={colors.brand} />
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>Plano Free</Text>
            <Text style={styles.upgradeSub}>Faça upgrade pra liberar tudo</Text>
          </View>
          <ChevronRight size={16} color={colors.brand} />
        </Pressable>

        <Pressable style={styles.saveBtn}>
          <Save size={16} color="#fff" />
          <Text style={styles.saveText}>Salvar perfil</Text>
        </Pressable>

        <Pressable style={styles.logout}>
          <LogOut size={14} color={colors.muted} />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "900", color: colors.text, letterSpacing: -0.6 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: { alignItems: "center" },
  avatarWrap: { position: "relative" },
  avatar: { width: 110, height: 110, borderRadius: 28, borderWidth: 4, borderColor: colors.bg },
  cameraBtn: {
    position: "absolute",
    bottom: -8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    ...shadows.glow,
  },
  cameraText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 11, fontWeight: "800", color: colors.muted, letterSpacing: 1, textTransform: "uppercase" },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  statusIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statusLabel: { color: colors.text, fontSize: 11, fontWeight: "800" },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 14, marginBottom: 4 },
  input: {
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 13,
  },
  iconInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: 12,
  },
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(239,44,57,0.08)",
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(239,44,57,0.3)",
  },
  upgradeTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  upgradeSub: { color: colors.textSoft, fontSize: 11, marginTop: 2 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    paddingVertical: 14,
    ...shadows.glow,
  },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 },
  logoutText: { color: colors.muted, fontSize: 12 },
});
