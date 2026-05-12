import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CalendarCheck, Camera, Clock, DollarSign, Flame, MapPin, MessageCircle, Share2, Star, UtensilsCrossed, Users, Wine } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileEstablishments, mobileUsers, presentByEstab, typeLabel } from "@/data/establishments";
import { colors, radii, shadows } from "@/theme";

const ICONS = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#22c55e" },
  { key: "reservas", label: "Reservas", icon: CalendarCheck, color: colors.brand },
  { key: "cardapio", label: "Cardápio", icon: UtensilsCrossed, color: "#f59e0b" },
  { key: "drinks", label: "Drinks", icon: Wine, color: "#a855f7" },
  { key: "mapa", label: "Como chegar", icon: MapPin, color: "#3b82f6" },
  { key: "share", label: "Compartilhar", icon: Share2, color: "#06b6d4" },
];

export default function EstabelecimentoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = mobileEstablishments.find((e) => e.id === id);
  const [checkedIn, setCheckedIn] = useState(false);

  if (!place) return null;
  const presentIds = presentByEstab[place.id] ?? [];
  const present = mobileUsers.filter((u) => presentIds.includes(u.id));

  const total = place.presentNow;
  const mPct = (place.presentMale / total) * 100;
  const fPct = (place.presentFemale / total) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={place.cover} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(10,10,11,0.4)", "rgba(10,10,11,1)"]}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView edges={["top"]} style={styles.heroSafe}>
            <View style={styles.heroTopRow}>
              <Pressable onPress={() => router.back()} style={styles.heroBtn}>
                <ArrowLeft size={18} color="#fff" />
              </Pressable>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {place.openNow && (
                  <View style={styles.heroPill}>
                    <View style={[styles.dot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.heroPillText, { color: colors.success }]}>Aberto</Text>
                  </View>
                )}
                {place.presentNow > 300 && (
                  <View style={[styles.heroPill, { backgroundColor: colors.brand }]}>
                    <Flame size={11} color="#fff" />
                    <Text style={[styles.heroPillText, { color: "#fff" }]}>Lotado</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginTop: "auto", padding: 20 }}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{typeLabel[place.type]}</Text>
              </View>
              <Text style={styles.heroTitle}>{place.name}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaItem}>
                  <MapPin size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.metaText}>{place.city}/{place.state}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.metaText}>{place.distanceKm.toFixed(1)} km</Text>
                </View>
                <View style={styles.metaItem}>
                  <Star size={12} color={colors.warn} fill={colors.warn} />
                  <Text style={styles.metaText}>{place.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <DollarSign size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.metaText}>{"$".repeat(3)}</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ padding: 20, gap: 20 }}>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{place.address}</Text>
            <View style={styles.tags}>
              {place.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>TUDO SOBRE O LUGAR</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((i) => {
                const Icon = i.icon;
                return (
                  <Pressable key={i.key} style={styles.iconBtn}>
                    <View style={[styles.iconCircle, { backgroundColor: `${i.color}25` }]}>
                      <Icon size={18} color={i.color} />
                    </View>
                    <Text style={styles.iconLabel}>{i.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.presenceBox}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.usersIcon}>
                <Users size={20} color={colors.brand} />
              </View>
              <View>
                <Text style={styles.presenceCount}>{total}</Text>
                <Text style={styles.presenceCaption}>pessoas com check-in agora</Text>
              </View>
            </View>

            <View style={styles.genderBar}>
              <View style={{ flex: mPct, height: 8, backgroundColor: "#3b82f6" }} />
              <View style={{ flex: fPct, height: 8, backgroundColor: "#ec4899" }} />
            </View>

            <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={[styles.dot, { backgroundColor: "#3b82f6" }]} />
                <Text style={styles.genderText}>♂ {place.presentMale} · {mPct.toFixed(0)}%</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={[styles.dot, { backgroundColor: "#ec4899" }]} />
                <Text style={styles.genderText}>♀ {place.presentFemale} · {fPct.toFixed(0)}%</Text>
              </View>
            </View>
          </View>

          <Pressable onPress={() => setCheckedIn((v) => !v)} style={[styles.checkinBtn, checkedIn && styles.checkinBtnOut]}>
            {checkedIn ? (
              <>
                <View style={[styles.checkmark, { backgroundColor: "rgba(34,197,94,0.2)" }]} />
                <Text style={[styles.checkinText, { color: colors.text }]}>VOCÊ ESTÁ AQUI</Text>
                <Text style={styles.checkinSub}>Toque para sair</Text>
              </>
            ) : (
              <>
                <MapPin size={18} color="#fff" />
                <Text style={styles.checkinText}>FAZER CHECK-IN</Text>
              </>
            )}
          </Pressable>

          <View>
            <View style={styles.peopleHeader}>
              <View>
                <Text style={styles.peopleTitle}>Quem está aqui agora</Text>
                <Text style={styles.peopleSub}>{present.length} pessoas com check-in ativo</Text>
              </View>
              <View style={styles.live}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={styles.liveText}>Ao vivo</Text>
              </View>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
              data={present}
              keyExtractor={(u) => u.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/usuario/${item.id}`)}
                  style={styles.personCard}
                >
                  <View style={{ position: "relative" }}>
                    <Image source={item.photo} style={styles.personAvatar} />
                    <View
                      style={[
                        styles.statusBubble,
                        {
                          backgroundColor:
                            item.status === "open"
                              ? colors.success
                              : item.status === "watching"
                              ? colors.warn
                              : colors.muted,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.personName}>{item.name.split(" ")[0]}</Text>
                  <Text style={styles.personMeta}>{item.age} · {item.profession}</Text>
                  <View style={styles.personPill}>
                    <Text style={styles.personPillText}>chegou {item.checkedInAt}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>

          {place.hasMomento && (
            <Pressable style={styles.momentoCard}>
              <View style={styles.momentoIcon}>
                <Camera size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.momentoTitle}>NO MOMENTO disponível</Text>
                <Text style={styles.momentoSub}>Veja stories ao vivo de {place.name}</Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 320, justifyContent: "flex-end" },
  heroSafe: { flex: 1 },
  heroTopRow: { padding: 16, flexDirection: "row", justifyContent: "space-between" },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(34,197,94,0.18)",
  },
  heroPillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  heroBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { color: "#fff", fontSize: 32, fontWeight: "900", letterSpacing: -0.8, marginTop: 8 },
  heroMeta: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  addressBox: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  addressText: { color: colors.textSoft, fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: { backgroundColor: colors.surface2, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radii.pill },
  tagText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  sectionTitle: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 10 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconBtn: {
    width: "31%",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  iconLabel: { color: colors.text, fontSize: 11, fontWeight: "700" },
  presenceBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: 16, borderWidth: 1, borderColor: colors.border },
  usersIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(239,44,57,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  presenceCount: { color: colors.text, fontSize: 22, fontWeight: "900" },
  presenceCaption: { color: colors.muted, fontSize: 11 },
  genderBar: { flexDirection: "row", marginTop: 14, height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: colors.surface3 },
  genderText: { color: colors.textSoft, fontSize: 11 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  checkinBtn: {
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: radii.lg,
    ...shadows.glow,
  },
  checkinBtnOut: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "column",
  },
  checkmark: { width: 28, height: 28, borderRadius: 14, marginBottom: 2 },
  checkinText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  checkinSub: { color: colors.muted, fontSize: 10, marginTop: 2 },
  peopleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  peopleTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  peopleSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  live: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(34,197,94,0.15)", paddingHorizontal: 9, paddingVertical: 4, borderRadius: radii.pill },
  liveText: { color: colors.success, fontSize: 10, fontWeight: "800" },
  personCard: { width: 110, alignItems: "center", gap: 4, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 10, borderWidth: 1, borderColor: colors.border },
  personAvatar: { width: 60, height: 60, borderRadius: 30 },
  statusBubble: { position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.surface },
  personName: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 4 },
  personMeta: { color: colors.muted, fontSize: 9 },
  personPill: { backgroundColor: colors.surface2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill, marginTop: 4 },
  personPillText: { color: colors.textSoft, fontSize: 8, fontWeight: "700" },
  momentoCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(239,44,57,0.1)", borderRadius: radii.lg, padding: 14, borderWidth: 1, borderColor: "rgba(239,44,57,0.3)" },
  momentoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  momentoTitle: { color: colors.text, fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
  momentoSub: { color: colors.textSoft, fontSize: 11, marginTop: 2 },
});
