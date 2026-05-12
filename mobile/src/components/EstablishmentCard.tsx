import { Camera, Flame, MapPin, Star, Users } from "lucide-react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows } from "@/theme";
import { typeLabel, type MobileEstablishment } from "@/data/establishments";

interface Props {
  establishment: MobileEstablishment;
  index: number;
  onPress: () => void;
  onMomentoPress?: () => void;
}

export function EstablishmentCard({ establishment: e, index, onPress, onMomentoPress }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350, delay: index * 60 }}
    >
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        <View style={styles.imgWrap}>
          <Image source={e.cover} style={styles.img} contentFit="cover" transition={300} />
          <LinearGradient
            colors={["transparent", "rgba(10,10,11,0.95)"]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={[styles.row, styles.topRow]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{typeLabel[e.type]}</Text>
            </View>
            {e.openNow && (
              <View style={[styles.badge, { backgroundColor: "rgba(34,197,94,0.18)" }]}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={[styles.badgeText, { color: colors.success }]}>Aberto</Text>
              </View>
            )}
          </View>

          {e.presentNow > 300 && (
            <View style={styles.flame}>
              <Flame size={11} color="#fff" />
              <Text style={styles.flameText}>Lotado</Text>
            </View>
          )}

          <View style={styles.rating}>
            <Star size={13} color={colors.warn} fill={colors.warn} />
            <Text style={styles.ratingText}>{e.rating.toFixed(1)}</Text>
          </View>

          {e.hasMomento && (
            <Pressable
              onPress={(ev) => {
                ev.stopPropagation();
                onMomentoPress?.();
              }}
              style={styles.storyRingWrap}
            >
              <View style={styles.storyRing}>
                <View style={styles.storyInner}>
                  <Camera size={14} color="#fff" />
                </View>
              </View>
            </Pressable>
          )}

          <View style={styles.titleBlock}>
            <Text style={styles.name}>{e.name}</Text>
            <View style={[styles.row, { gap: 6 }]}>
              <MapPin size={11} color="rgba(255,255,255,0.8)" />
              <Text style={styles.subtitle}>
                {e.city}/{e.state} · {e.distanceKm.toFixed(1)} km
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.row}>
            <Users size={13} color={colors.brand} />
            <Text style={styles.foundText}>
              {" "}{e.presentNow}{" "}
              <Text style={{ color: colors.muted, fontWeight: "500" }}>presentes agora</Text>
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <View style={[styles.pill, { backgroundColor: "rgba(59,130,246,0.15)" }]}>
              <Text style={[styles.pillText, { color: "#3b82f6" }]}>♂ {e.presentMale}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: "rgba(236,72,153,0.15)" }]}>
              <Text style={[styles.pillText, { color: "#ec4899" }]}>♀ {e.presentFemale}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.soft,
  },
  imgWrap: { height: 180, position: "relative" },
  img: { width: "100%", height: "100%" },
  row: { flexDirection: "row", alignItems: "center" },
  topRow: { position: "absolute", top: 12, left: 12, gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.pill,
    gap: 5,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  flame: {
    position: "absolute",
    right: -2,
    top: 12,
    backgroundColor: colors.brand,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: radii.pill,
    borderBottomLeftRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    ...shadows.glow,
  },
  flameText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  rating: {
    position: "absolute",
    right: 12,
    top: 50,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  storyRingWrap: { position: "absolute", right: 12, bottom: 12 },
  storyRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    backgroundColor: colors.brand,
  },
  storyInner: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { position: "absolute", left: 12, bottom: 12, right: 12, gap: 4 },
  name: { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 11 },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foundText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radii.pill },
  pillText: { fontSize: 11, fontWeight: "700" },
});
