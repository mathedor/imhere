"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { CityHeatPoint, MapMarker } from "@/lib/db/match-analysis";

interface Props {
  markers: MapMarker[];
  heat: CityHeatPoint[];
}

const DEFAULT_CENTER: [number, number] = [-27.0, -48.6];

export default function MapInner({ markers, heat }: Props) {
  const points: [number, number][] = [
    ...markers.map((m) => [m.lat, m.lng] as [number, number]),
    ...heat.map((h) => [h.lat, h.lng] as [number, number]),
  ];

  const center: [number, number] =
    points.length > 0
      ? [
          points.reduce((acc, p) => acc + p[0], 0) / points.length,
          points.reduce((acc, p) => acc + p[1], 0) / points.length,
        ]
      : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Heat circles per city */}
      {heat.map((h) => {
        const radius = Math.max(12, Math.min(60, (h.userCount + h.estabCount * 5) * 0.6));
        return (
          <CircleMarker
            key={`heat-${h.city}-${h.state}`}
            center={[h.lat, h.lng]}
            radius={radius}
            pathOptions={{
              color: "#ef2c39",
              fillColor: "#ef2c39",
              fillOpacity: 0.15,
              weight: 1,
            }}
          >
            <Popup>
              <div style={{ fontSize: 12 }}>
                <strong>
                  {h.city} · {h.state}
                </strong>
                <br />
                {h.userCount} usuários · {h.estabCount} estabs
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Estab pins */}
      {markers.map((m) => (
        <CircleMarker
          key={`pin-${m.id}`}
          center={[m.lat, m.lng]}
          radius={7}
          pathOptions={{
            color: m.hasMoment ? "#ef2c39" : "#6b6b75",
            fillColor: m.hasMoment ? "#ef2c39" : "#9ca3af",
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong>{m.name}</strong>
              <br />
              {m.city}
              <br />
              {m.presentNow} presentes agora
              {m.hasMoment && (
                <>
                  <br />
                  <span style={{ color: "#ef2c39", fontWeight: 700 }}>● Momento ativo</span>
                </>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
