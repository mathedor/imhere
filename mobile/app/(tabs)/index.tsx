import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Bell, Loader2, MapPin, Search, SlidersHorizontal, Users } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EstablishmentCard } from "@/components/EstablishmentCard";
import { Logo } from "@/components/Logo";
import { mobileEstablishments } from "@/data/establishments";
import { colors, radii, shadows } from "@/theme";

type Sort = "nearest" | "busiest" | "rated";

const SORT_LABELS: Record<Sort, string> = {
  nearest: "Mais próximos",
  busiest: "Mais movimentados",
  rated: "Melhor avaliados",
};

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("nearest");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Compartilhe sua localização");
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ok">("idle");

  useEffect(() => {
    (async () => {
      setLocationStatus("loading");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("idle");
        setLocationLabel("Toque para liberar localização");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const reverse = await Location.reverseGeocodeAsync(pos.coords);
      const city = reverse[0]?.subregion ?? reverse[0]?.city ?? "Sua região";
      setLocationLabel(`${reverse[0]?.district ?? city} · ${reverse[0]?.region ?? ""}`);
      setLocationStatus("ok");
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = mobileEstablishments.filter(
      (e) => !query || e.name.toLowerCase().includes(query.toLowerCase())
    );
    if (nearbyOnly) list = list.filter((e) => e.distanceKm <= 2);
    if (sort === "nearest") list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "busiest") list = [...list].sort((a, b) => b.presentNow - a.presentNow);
    if (sort === "rated") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, sort, nearbyOnly]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Logo size={28} />
        <Pressable style={styles.bellBtn}>
          <Bell size={18} color={colors.text} />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <Pressable style={styles.locationBar}>
              <View style={styles.locationIcon}>
                {locationStatus === "loading" ? (
                  <Loader2 size={13} color={colors.brand} />
                ) : (
                  <MapPin size={13} color={colors.brand} />
                )}
              </View>
              <Text style={styles.locationLabel}>VOCÊ ESTÁ EM</Text>
              <Text style={styles.locationValue} numberOfLines={1}>
                {locationLabel}
              </Text>
              {locationStatus === "ok" && <View style={styles.statusDot} />}
            </Pressable>

            <View>
              <Text style={styles.h1}>
                Quem está <Text style={{ color: colors.brand }}>aqui</Text> agora?
              </Text>
              <Text style={styles.h1Sub}>
                Encontre lugares com gente movimentando perto de você.
              </Text>
            </View>

            <View style={styles.searchBar}>
              <Search size={18} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar bar, restaurante, balada..."
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>

            <View style={styles.controls}>
              <Pressable
                onPress={() => setNearbyOnly((v) => !v)}
                style={[
                  styles.controlBtn,
                  nearbyOnly && { backgroundColor: colors.brand, borderColor: colors.brand },
                ]}
              >
                <Users size={14} color={nearbyOnly ? "#fff" : colors.text} />
                <Text style={[styles.controlBtnText, nearbyOnly && { color: "#fff" }]}>
                  Perto de mim
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setSort((s) =>
                    s === "nearest" ? "busiest" : s === "busiest" ? "rated" : "nearest"
                  )
                }
                style={styles.controlBtn}
              >
                <SlidersHorizontal size={14} color={colors.brand} />
                <Text style={styles.controlBtnText}>{SORT_LABELS[sort]}</Text>
              </Pressable>
            </View>

            <View style={styles.subhead}>
              <Text style={styles.subheadTitle}>{filtered.length} LUGARES</Text>
              <View style={styles.live}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={styles.liveText}>Ao vivo</Text>
              </View>
            </View>
          </View>
        }
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={{ marginTop: 12 }}>
            <EstablishmentCard
              establishment={item}
              index={index}
              onPress={() => router.push(`/estabelecimento/${item.id}`)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(28,28,32,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 8,
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239,44,57,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  locationValue: { color: colors.text, fontSize: 12, fontWeight: "700", flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  h1: { fontSize: 26, fontWeight: "900", color: colors.text, letterSpacing: -0.8, lineHeight: 30 },
  h1Sub: { color: colors.textSoft, fontSize: 13, marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    gap: 10,
  },
  input: { flex: 1, color: colors.text, fontSize: 14 },
  controls: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
  },
  controlBtnText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  subhead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subheadTitle: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  live: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveText: { color: colors.textSoft, fontSize: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
