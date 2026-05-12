import { Tabs } from "expo-router";
import { Compass, MessageCircle, Sparkles, User } from "lucide-react-native";
import { Platform, StyleSheet } from "react-native";
import { colors, radii } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: "rgba(19,19,22,0.92)",
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color }) => <Compass color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={22} />,
          tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: colors.brand, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="planos"
        options={{
          title: "Planos",
          tabBarIcon: ({ color }) => <Sparkles color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
