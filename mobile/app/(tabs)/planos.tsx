import { Check, Crown, Sparkles, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, shadows } from "@/theme";

const PLANS = [
  { id: "free", name: "Free", tag: "Para experimentar", monthly: 0, annual: 0, color: "#374151", popular: false, features: [
    { label: "Buscar lugares e ver presença", in: true },
    { label: "Fazer check-in ilimitado", in: true },
    { label: "Ver perfil 360 completo", in: false },
    { label: "Iniciar conversa no chat", in: false },
  ] },
  { id: "basic", name: "Básico", tag: "Para conhecer pessoas", monthly: 1990, annual: 1490, color: "#3b82f6", popular: false, features: [
    { label: "Tudo do Free", in: true },
    { label: "Ver perfil 360 completo", in: true },
    { label: "3 conversas/dia", in: true },
    { label: "Foto/áudio no chat", in: false },
  ] },
  { id: "premium", name: "Premium", tag: "Mais escolhido", monthly: 3990, annual: 2990, color: "#ef2c39", popular: true, features: [
    { label: "Tudo do Básico", in: true },
    { label: "Conversas ilimitadas", in: true },
    { label: "Foto/áudio no chat", in: true },
    { label: "Ver quem visitou seu perfil", in: true },
  ] },
  { id: "vip", name: "VIP", tag: "Experiência completa", monthly: 8990, annual: 6990, color: "#a855f7", popular: false, features: [
    { label: "Tudo do Premium", in: true },
    { label: "Filtros avançados", in: true },
    { label: "Boost ilimitado", in: true },
    { label: "Selo elite verificado", in: true },
  ] },
];

export default function PlanosScreen() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [selected, setSelected] = useState("premium");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", gap: 8 }}>
          <View style={styles.beta}>
            <Sparkles size={11} color={colors.brand} />
            <Text style={styles.betaText}>Liberar tudo</Text>
          </View>
          <Text style={styles.title}>
            Escolha seu plano <Text style={{ color: colors.brand }}>I&apos;m Here</Text>
          </Text>
          <Text style={styles.subtitle}>
            Cancele quando quiser · PIX ou cartão recorrente
          </Text>

          <View style={styles.toggle}>
            <Pressable
              onPress={() => setBilling("monthly")}
              style={[styles.toggleBtn, billing === "monthly" && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, billing === "monthly" && styles.toggleTextActive]}>Mensal</Text>
            </Pressable>
            <Pressable
              onPress={() => setBilling("annual")}
              style={[styles.toggleBtn, billing === "annual" && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, billing === "annual" && styles.toggleTextActive]}>
                Anual <Text style={{ color: colors.success, fontSize: 9 }}>-25%</Text>
              </Text>
            </Pressable>
          </View>
        </View>

        {PLANS.map((p) => {
          const price = (billing === "monthly" ? p.monthly : p.annual) / 100;
          const isSel = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={[styles.card, isSel && { borderColor: colors.brand, ...shadows.glow }]}
            >
              {p.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MAIS POPULAR</Text>
                </View>
              )}
              <View style={[styles.cardIcon, { backgroundColor: p.color }]}>
                {p.id === "vip" ? <Crown size={20} color="#fff" /> : <Sparkles size={20} color="#fff" />}
              </View>
              <Text style={styles.planName}>{p.name}</Text>
              <Text style={styles.planTag}>{p.tag}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceCurrency}>R$</Text>
                <Text style={styles.price}>{price.toFixed(2).replace(".", ",")}</Text>
                <Text style={styles.priceSuffix}>/mês{billing === "annual" ? "*" : ""}</Text>
              </View>

              <View style={{ gap: 6, marginVertical: 10 }}>
                {p.features.map((f) => (
                  <View key={f.label} style={styles.featureRow}>
                    <View style={[styles.featureIcon, f.in ? { backgroundColor: "rgba(34,197,94,0.2)" } : { backgroundColor: colors.surface3 }]}>
                      {f.in ? <Check size={9} color={colors.success} /> : <X size={9} color={colors.muted} />}
                    </View>
                    <Text style={[styles.featureLabel, !f.in && { color: colors.muted, textDecorationLine: "line-through" }]}>
                      {f.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.cta, isSel && { backgroundColor: colors.brand }]}>
                <Text style={[styles.ctaText, isSel && { color: "#fff" }]}>
                  {p.monthly === 0 ? "Plano atual" : isSel ? "Assinar agora" : "Escolher"}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pagamento processado pela <Text style={{ fontWeight: "800", color: colors.text }}>Efí Bank</Text> · PIX, cartão · Cancele a qualquer momento
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  beta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(239,44,57,0.3)",
    backgroundColor: "rgba(239,44,57,0.1)",
  },
  betaText: { color: colors.brand, fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: 26, fontWeight: "900", color: colors.text, letterSpacing: -0.8, textAlign: "center" },
  subtitle: { color: colors.textSoft, fontSize: 12, textAlign: "center" },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.pill },
  toggleActive: { backgroundColor: colors.brand },
  toggleText: { color: colors.textSoft, fontSize: 12, fontWeight: "800" },
  toggleTextActive: { color: "#fff" },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(239,44,57,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  popularText: { color: colors.brand, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  cardIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  planName: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 10 },
  planTag: { color: colors.textSoft, fontSize: 11 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 12 },
  priceCurrency: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  price: { color: colors.text, fontSize: 30, fontWeight: "900", letterSpacing: -0.6 },
  priceSuffix: { color: colors.muted, fontSize: 11 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureIcon: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  featureLabel: { color: colors.text, fontSize: 12, flex: 1 },
  cta: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface2,
    alignItems: "center",
  },
  ctaText: { color: colors.text, fontWeight: "900", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  footer: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: 12, marginTop: 8 },
  footerText: { color: colors.textSoft, fontSize: 11, textAlign: "center", lineHeight: 16 },
});
