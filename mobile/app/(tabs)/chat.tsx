import { useRouter } from "expo-router";
import { CheckCheck, Image as ImageIcon, MapPin, Mic } from "lucide-react-native";
import { Image } from "expo-image";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileEstablishments, mobileUsers } from "@/data/establishments";
import { colors, radii } from "@/theme";

const CONVERSATIONS = [
  { id: "conv-mari", userId: "u-mari", estabId: "lume-rooftop", last: "Que cara legal! Esse drink que pediu é o que?", time: "22:14", unread: 2, mediaType: null },
  { id: "conv-rafa", userId: "u-rafa", estabId: "noir-club", last: "Áudio · 0:14", time: "22:08", unread: 0, mediaType: "audio" as const },
  { id: "conv-julia", userId: "u-julia", estabId: "palco-arena", last: "Foto enviada", time: "23:12", unread: 1, mediaType: "image" as const },
  { id: "conv-carol", userId: "u-carol", estabId: "kazoku-omakase", last: "Pode ser semana que vem!", time: "21:15", unread: 0, mediaType: null },
];

export default function ChatListScreen() {
  const router = useRouter();
  const unread = CONVERSATIONS.reduce((acc, c) => acc + c.unread, 0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Conversas</Text>
          <Text style={styles.subtitle}>
            {unread > 0 ? `${unread} nova${unread > 1 ? "s" : ""} mensagem${unread > 1 ? "s" : ""}` : "Tudo em dia"}
          </Text>
        </View>
        <View style={styles.statusPill}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 6 }}
        data={CONVERSATIONS}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => {
          const user = mobileUsers.find((u) => u.id === item.userId);
          const place = mobileEstablishments.find((e) => e.id === item.estabId);
          if (!user) return null;
          return (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}`)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <View>
                <Image source={user.photo} style={styles.avatar} />
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <View style={[styles.rowSecondary, { gap: 5 }]}>
                  <CheckCheck size={13} color={colors.muted} />
                  {item.mediaType === "image" && <ImageIcon size={12} color={colors.muted} />}
                  {item.mediaType === "audio" && <Mic size={12} color={colors.muted} />}
                  <Text style={styles.last} numberOfLines={1}>
                    {item.last}
                  </Text>
                </View>
                {place && (
                  <View style={[styles.rowSecondary, { marginTop: 2, gap: 4 }]}>
                    <MapPin size={10} color={colors.muted} />
                    <Text style={styles.estabHint}>conheceram-se em {place.name}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "900", color: colors.text, letterSpacing: -0.6 },
  subtitle: { fontSize: 12, color: colors.textSoft, marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    gap: 5,
  },
  statusText: { fontSize: 11, color: colors.success, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    gap: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: 16 },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  unreadText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  rowTop: { flexDirection: "row", justifyContent: "space-between" },
  rowSecondary: { flexDirection: "row", alignItems: "center" },
  userName: { color: colors.text, fontWeight: "700", fontSize: 14 },
  time: { color: colors.muted, fontSize: 10 },
  last: { color: colors.textSoft, fontSize: 12, flex: 1 },
  estabHint: { color: colors.muted, fontSize: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
