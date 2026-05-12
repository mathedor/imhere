import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { colors } from "@/theme";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.24} viewBox="0 0 100 124">
      <Defs>
        <RadialGradient id="pin" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#ff5a65" />
          <Stop offset="55%" stopColor="#ef2c39" />
          <Stop offset="100%" stopColor="#b41822" />
        </RadialGradient>
      </Defs>
      <Path
        d="M50 4C25.7 4 6 23.7 6 48c0 33 38.5 67.3 41.6 70.1 1.4 1.2 3.4 1.2 4.8 0C55.5 115.3 94 81 94 48 94 23.7 74.3 4 50 4Z"
        fill="url(#pin)"
      />
      <Circle cx="50" cy="46" r="22" fill="#f5f5f7" />
    </Svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <LogoMark size={size} />
      <View style={{ marginLeft: 8 }}>
        <Text style={styles.title}>
          I&apos;m <Text style={{ color: colors.brand }}>Here</Text>
        </Text>
        <Text style={styles.sub}>check-in social</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "900", color: colors.text, letterSpacing: -0.4 },
  sub: { fontSize: 9, color: colors.muted, letterSpacing: 1.8, textTransform: "uppercase", marginTop: 2 },
});
