"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Share2,
  UtensilsCrossed,
  Wine,
} from "lucide-react";

export interface InfoIcon {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

const ICONS: InfoIcon[] = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#22c55e", description: "Falar agora" },
  { key: "reservas", label: "Reservas", icon: CalendarCheck, color: "#ef2c39", description: "Reservar mesa" },
  { key: "cardapio", label: "Cardápio", icon: UtensilsCrossed, color: "#f59e0b", description: "Ver pratos" },
  { key: "drinks", label: "Drinks", icon: Wine, color: "#a855f7", description: "Lista do bar" },
  { key: "mapa", label: "Mapa", icon: MapPin, color: "#3b82f6", description: "Como chegar" },
  { key: "share", label: "Compartilhar", icon: Share2, color: "#06b6d4", description: "Enviar a alguém" },
];

export function InfoIconRow() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {ICONS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -3 }}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3 text-center transition-colors hover:border-brand/40"
          >
            <div
              className="grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${item.color}25, ${item.color}10)`,
                color: item.color,
              }}
            >
              <Icon className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[0.75rem] font-bold text-text">{item.label}</span>
              <span className="text-[0.65rem] text-muted">{item.description}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
