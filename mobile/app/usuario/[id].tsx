import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Briefcase, Instagram, MapPin, MessageCircle, Star, Users } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileEstablishments, mobileUsers, presentByEstab } from "@/data/establishments";
import { colors, radii, shadows } from "@/theme";

export default function UsuarioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = mobileUsers.find((u) => u.id === id);
  if (!user) return null;

  const currentPlace = Object.entries(presentByEstab).find(([, ids]) => ids.includes(user.id))?.[0];
  const place = currentPlace ? mobileEstablishments.find((e) => e.id === currentPlace) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlur}>
          <Image source={user.photo} style={StyleSheet.absoluteFillObject} blurRadius={40} />
          <LinearGradient
            colors={["rgba(10,10,11,0.5)", "rgba(10,10,11,0.7)", colors.bg]}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView edges={["top"]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={18} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.avatarWrap}>
            <Image source={user.photo} style={styles.avatar} />
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    user.status === "open" ? colors.success : user.status === "watching" ? colors.warn : colors.muted,
                },
              ]}
            >
              <Text style={styles.statusPillText}>
                {user.status === "open" ? "ABERTO A CONVERSA" : user.status === "watching" ? "SÓ OBSERVANDO" : "INVISÍVEL"}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>
            {user.name}, {user.age}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Briefcase size={11} color={colors.textSoft} />
              <Text style={styles.metaText}>{user.profession}</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={11} color={colors.textSoft} />
              <Text style={styles.metaText}>São Paulo/SP</Text>
            </View>
            {user.instagram && (
              <View style={styles.metaItem}>
                <Instagram size={11} color={colors.brand} />
                <Text style={[styles.metaText, { color: colors.brand }]}>{user.instagram}</Text>
              </View>
            )}
          </View>

          {place && (
            <View style={styles.placeCard}>
              <View style={styles.placeIcon}>
                <MapPin size={16} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.placeLabel}>ESTÁ AQUI AGORA</Text>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeMeta}>Check-in às {user.checkedInAt}</Text>
              </View>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
            </View>
          )}

          <Pressable style={styles.contactBtn}>
            <MessageCircle size={18} color="#fff" />
            <Text style={styles.contactText}>INICIAR CONTATO</Text>
          </Pressable>

          <View style={styles.aboutBox}>
            <Text style={styles.sectionTitle}>SOBRE</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Users size={14} color={colors.brand} />
              <Text style={styles.metricValue}>142</Text>
              <Text style={styles.metricLabel}>visitas</Text>
            </View>
            <View style={styles.metric}>
              <Star size={14} color={colors.warn} />
              <Text style={styles.metricValue}>38</Text>
              <Text style={styles.metricLabel}>conexões</Text>
            </View>
            <View style={styles.metric}>
              <Briefcase size={14} color="#3b82f6" />
              <Text style={styles.metricValue}>Sim</Text>
              <Text style={styles.metricLabel}>verificado</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBlur: { height: 220 },
  backBtn: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 20, marginTop: -100, gap: 14 },
  avatarWrap: { alignSelf: "center", position: "relative" },
  avatar: { width: 140, height: 140, borderRadius: 36, borderWidth: 4, borderColor: colors.bg, ...shadows.soft },
  statusPill: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    ...shadows.glow,
  },
  statusPillText: { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  name: { textAlign: "center", color: colors.text, fontSize: 28, fontWeight: "900", letterSpacing: -0.6, marginTop: 14 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: colors.textSoft, fontSize: 12 },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(34,197,94,0.08)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    borderRadius: radii.lg,
    padding: 12,
  },
  placeIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(34,197,94,0.2)", alignItems: "center", justifyContent: "center" },
  placeLabel: { color: colors.success, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  placeName: { color: colors.text, fontSize: 14, fontWeight: "800", marginTop: 2 },
  placeMeta: { color: colors.textSoft, fontSize: 11, marginTop: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  contactBtn: {
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: radii.lg,
    ...shadows.glow,
  },
  contactText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  aboutBox: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  bio: { color: colors.textSoft, fontSize: 13, lineHeight: 18 },
  metricsRow: { flexDirection: "row", gap: 8 },
  metric: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  metricValue: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 4 },
  metricLabel: { color: colors.muted, fontSize: 10 },
});
