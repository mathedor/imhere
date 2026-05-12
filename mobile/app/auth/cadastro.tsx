import { useRouter } from "expo-router";
import { ArrowRight, CheckCircle2 } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { colors, radii, shadows } from "@/theme";

export default function CadastroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ alignItems: "center", marginBottom: 20, gap: 8 }}>
          <Logo size={40} />
          <Text style={styles.title}>
            Comece em <Text style={{ color: colors.brand }}>30 segundos</Text>
          </Text>
          <Text style={styles.sub}>Só nome, e-mail e celular. Complete o resto depois.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.field}>NOME</Text>
          <TextInput style={styles.input} placeholder="Seu nome" placeholderTextColor={colors.muted} />
          <Text style={styles.field}>E-MAIL</Text>
          <TextInput keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholder="seu@email.com" placeholderTextColor={colors.muted} />
          <Text style={styles.field}>WHATSAPP</Text>
          <TextInput keyboardType="phone-pad" style={styles.input} placeholder="(11) 99999-9999" placeholderTextColor={colors.muted} />
          <Text style={styles.field}>SENHA</Text>
          <TextInput secureTextEntry style={styles.input} placeholder="Mín. 8 caracteres" placeholderTextColor={colors.muted} />

          <Pressable onPress={() => router.replace("/(tabs)")} style={styles.submitBtn}>
            <Text style={styles.submitText}>CRIAR CONTA GRÁTIS</Text>
            <ArrowRight size={14} color="#fff" />
          </Pressable>

          <View style={{ gap: 8, marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }}>
            {["Acesso imediato à plataforma", "Cadastro completo depois", "Cancele quando quiser"].map((t) => (
              <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={13} color={colors.success} />
                <Text style={{ color: colors.textSoft, fontSize: 11 }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable onPress={() => router.push("/auth/login")}>
          <Text style={styles.footer}>
            Já tem conta? <Text style={{ color: colors.brand, fontWeight: "800" }}>Entrar</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  sub: { color: colors.textSoft, fontSize: 12, textAlign: "center" },
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: 18, borderWidth: 1, borderColor: colors.border },
  field: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 4, marginTop: 10 },
  input: { height: 44, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, paddingHorizontal: 12, color: colors.text, fontSize: 13 },
  submitBtn: { marginTop: 18, backgroundColor: colors.brand, borderRadius: radii.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, ...shadows.glow },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  footer: { color: colors.textSoft, fontSize: 13, textAlign: "center", marginTop: 16 },
});
