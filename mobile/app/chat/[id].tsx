import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ImagePlus, MapPin, Mic, MoreVertical, Phone, Send, Smile } from "lucide-react-native";
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileEstablishments, mobileUsers } from "@/data/establishments";
import { colors, radii, shadows } from "@/theme";

interface Msg {
  id: string;
  fromMe: boolean;
  body: string;
  time: string;
}

const SEED: Msg[] = [
  { id: "1", fromMe: true, body: "Oi! Vi que você também tá no Lume hoje 🍸", time: "21:50" },
  { id: "2", fromMe: false, body: "Oi! Sim, primeira vez aqui. Tá lotado hein", time: "21:53" },
  { id: "3", fromMe: true, body: "Bastante! Tô sentado perto da pista lateral, ambiente bom", time: "21:55" },
  { id: "4", fromMe: false, body: "Que cara legal! Esse drink que você pediu é o que?", time: "22:14" },
];

const BAD = /\b(p[uo0]rr[ao]|m[e3]rd[ao]|c[a@]r[a@]lh[o0]|f[uo]d[e3]r?)\b/i;

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = mobileUsers.find((u) => id?.includes(u.id.split("-")[1])) ?? mobileUsers[0];
  const place = mobileEstablishments[0];

  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");
  const [blocked, setBlocked] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  function send() {
    const t = text.trim();
    if (!t) return;
    const match = t.match(BAD);
    if (match) {
      setBlocked(`Termo "${match[0]}" foi bloqueado pela moderação.`);
      setTimeout(() => setBlocked(null), 3000);
      return;
    }
    const m: Msg = {
      id: String(Date.now()),
      fromMe: true,
      body: t,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((p) => [...p, m]);
    setText("");
    setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          id: String(Date.now() + 1),
          fromMe: false,
          body: "Boa! Tô indo aí, te encontro perto do bar 🍻",
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1800);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/usuario/${user.id}`)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <View>
              <Image source={user.photo} style={styles.avatar} />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userMeta}>online · {user.profession}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Phone size={16} color={colors.textSoft} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <MoreVertical size={16} color={colors.textSoft} />
          </Pressable>
        </View>

        <Pressable style={styles.estabPill}>
          <View style={styles.placeIcon}>
            <MapPin size={11} color={colors.brand} />
          </View>
          <Text style={styles.placePill}>Conheceram-se em {place.name}</Text>
        </Pressable>

        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          data={messages}
          keyExtractor={(m) => m.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, !item.fromMe && { color: colors.text }]}>{item.body}</Text>
              <Text style={[styles.bubbleTime, !item.fromMe && { color: colors.muted }]}>{item.time}</Text>
            </View>
          )}
        />

        {blocked && (
          <View style={styles.blocked}>
            <Text style={styles.blockedText}>🛡️ {blocked}</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <Pressable style={styles.inputIcon}>
            <ImagePlus size={18} color={colors.muted} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Mensagem..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <Pressable style={styles.inputIcon}>
            <Smile size={18} color={colors.muted} />
          </Pressable>
          <Pressable onPress={send} style={[styles.sendBtn, !text.trim() && { backgroundColor: colors.surface2 }]}>
            {text.trim() ? <Send size={16} color="#fff" /> : <Mic size={18} color={colors.muted} />}
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>🛡️ Mensagens são moderadas automaticamente.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  userName: { color: colors.text, fontSize: 13, fontWeight: "800" },
  userMeta: { color: colors.success, fontSize: 10 },
  estabPill: {
    marginHorizontal: 12,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(28,28,32,0.6)",
    borderRadius: radii.md,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: "rgba(239,44,57,0.15)", alignItems: "center", justifyContent: "center" },
  placePill: { color: colors.text, fontSize: 11, fontWeight: "800" },
  bubble: { maxWidth: "78%", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16 },
  bubbleMe: { alignSelf: "flex-end", backgroundColor: colors.brand, borderBottomRightRadius: 4 },
  bubbleOther: { alignSelf: "flex-start", backgroundColor: colors.surface2, borderBottomLeftRadius: 4 },
  bubbleText: { color: "#fff", fontSize: 14, lineHeight: 18 },
  bubbleTime: { color: "rgba(255,255,255,0.75)", fontSize: 10, marginTop: 3, alignSelf: "flex-end" },
  blocked: { margin: 12, padding: 8, backgroundColor: "rgba(239,44,57,0.1)", borderRadius: radii.md, borderWidth: 1, borderColor: "rgba(239,44,57,0.3)" },
  blockedText: { color: colors.brand, fontSize: 11 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    margin: 12,
    padding: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  inputIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 9, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", ...shadows.glow },
  disclaimer: { color: colors.muted, fontSize: 10, textAlign: "center", marginBottom: 8 },
});
