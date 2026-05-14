import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { District, OverlayData, Poi } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

const LITHUANIA_BOUNDS = [[53.8, 20.7], [56.6, 26.9]] satisfies L.LatLngBoundsLiteral;
const LITHUANIA_CENTER: [number, number] = [55.1694, 23.8813];
const MAX_RENDERED_OVERLAY_FEATURES = 450;
const MAX_RENDERED_POIS = 350;

// Keep Leaflet marker assets bundled with Vite instead of relying on unpkg at runtime.
const leafletDefaultIcon = L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: string };
delete leafletDefaultIcon._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const overlayColors: Record<string, { low: string; mid: string; high: string; inverse?: boolean }> = {
  air_quality: { low: "#ef4444", mid: "#f59e0b", high: "#22c55e" },
  crime: { low: "#22c55e", mid: "#f59e0b", high: "#ef4444", inverse: true },
  transport: { low: "#94a3b8", mid: "#38bdf8", high: "#2563eb" },
  schools: { low: "#94a3b8", mid: "#a78bfa", high: "#7c3aed" },
  healthcare: { low: "#94a3b8", mid: "#2dd4bf", high: "#0f766e" },
  green_spaces: { low: "#94a3b8", mid: "#84cc16", high: "#16a34a" },
  noise: { low: "#22c55e", mid: "#f59e0b", high: "#ef4444", inverse: true },
  light_pollution: { low: "#22c55e", mid: "#f59e0b", high: "#ef4444", inverse: true },
  walkability: { low: "#94a3b8", mid: "#fb7185", high: "#e11d48" },
  bike_paths: { low: "#94a3b8", mid: "#34d399", high: "#059669" },
  housing_prices: { low: "#22c55e", mid: "#f59e0b", high: "#ef4444", inverse: true },
  pharmacies: { low: "#94a3b8", mid: "#60a5fa", high: "#2563eb" },
};

const poiColors: Record<string, string> = {
  attraction: "#f97316",
  restaurant: "#ef4444",
  hotel: "#2563eb",
  nightlife: "#d946ef",
  transport: "#06b6d4",
  emergency: "#dc2626",
  pharmacy: "#16a34a",
  park: "#22c55e",
};

function createCustomIcon(color: string, size = 18, active = false) {
  const border = active ? "3px solid white" : "2px solid white";
  const pulse = active ? "box-shadow: 0 0 0 7px rgba(34, 211, 238, .22), 0 12px 30px rgba(15, 23, 42, .35);" : "box-shadow: 0 8px 18px rgba(15, 23, 42, .28);";
  return new L.DivIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background:${color}; width:${size}px; height:${size}px; border-radius:50%; border:${border}; ${pulse}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface MapViewProps {
  districts?: District[];
  pois?: Poi[];
  overlayData?: OverlayData;
  activeDistrictId?: number;
  activePoiId?: number;
  onDistrictClick?: (id: number) => void;
  onPoiClick?: (poi: Poi) => void;
  center?: [number, number];
  zoom?: number;
}

function MapUpdater({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    const boundedCenter = center ? clampToLithuania(center) : undefined;
    const boundedZoom = typeof zoom === "number" ? Math.max(7, Math.min(18, zoom)) : undefined;
    if (boundedCenter && boundedZoom) map.setView(boundedCenter, boundedZoom, { animate: true });
    else if (boundedCenter) map.panTo(boundedCenter, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function colorForValue(type: string, value: number) {
  const colors = overlayColors[type] ?? overlayColors.transport;
  const highIsBad = colors.inverse;
  const threshold = type === "housing_prices" ? [2600, 3400] : type === "noise" ? [55, 63] : type === "crime" ? [32, 45] : [55, 75];
  const bucket = value >= threshold[1] ? "high" : value >= threshold[0] ? "mid" : "low";
  if (!highIsBad) return colors[bucket];
  return colors[bucket];
}

function radiusFor(type: string, value: number) {
  if (type === "housing_prices") return Math.max(450, Math.min(1500, value / 2.8));
  if (["transport", "schools", "healthcare", "green_spaces", "pharmacies"].includes(type)) {
    return Math.max(450, Math.min(1600, value * 95));
  }
  return Math.max(550, Math.min(1800, value * 18));
}

export function MapView({
  districts = [],
  pois = [],
  overlayData,
  activeDistrictId,
  activePoiId,
  onDistrictClick,
  onPoiClick,
  center = LITHUANIA_CENTER,
  zoom = 7,
}: MapViewProps) {
  const { language } = useI18n();
  const isLt = language === "lt";
  const safeCenter = clampToLithuania(center);
  const safeZoom = Math.max(7, Math.min(18, zoom));
  const districtIcons = useMemo(() => {
    const map = new Map<number, L.DivIcon>();
    for (const d of districts) {
      const active = d.id === activeDistrictId;
      const score = d.overallScore ?? 5;
      const color = score >= 8.5 ? "#22c55e" : score >= 7.5 ? "#38bdf8" : score >= 6.5 ? "#f59e0b" : "#ef4444";
      map.set(d.id, createCustomIcon(active ? "#22d3ee" : color, active ? 24 : 18, active));
    }
    return map;
  }, [districts, activeDistrictId]);

  const renderedOverlayFeatures = useMemo(() => overlayData?.features?.slice(0, MAX_RENDERED_OVERLAY_FEATURES) ?? [], [overlayData]);
  const renderedPois = useMemo(() => {
    const limited = pois.slice(0, MAX_RENDERED_POIS);
    if (!activePoiId || limited.some((poi) => poi.id === activePoiId)) return limited;
    const active = pois.find((poi) => poi.id === activePoiId);
    return active ? [active, ...limited.slice(0, MAX_RENDERED_POIS - 1)] : limited;
  }, [activePoiId, pois]);
  const poiIcons = useMemo(() => {
    const map = new Map<number, L.DivIcon>();
    for (const poi of renderedPois) {
      map.set(poi.id, createCustomIcon(poiColors[poi.category] ?? "#f97316", poi.id === activePoiId ? 22 : 15, poi.id === activePoiId));
    }
    return map;
  }, [activePoiId, renderedPois]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <MapContainer
        center={safeCenter}
        zoom={safeZoom}
        minZoom={7}
        maxZoom={18}
        maxBounds={LITHUANIA_BOUNDS}
        maxBoundsViscosity={1}
        style={{ width: "100%", height: "100%", zIndex: 10 }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={safeCenter} zoom={safeZoom} />

        {renderedOverlayFeatures.map((feature, index) => {
          const value = feature.value ?? 0;
          const color = colorForValue(overlayData?.type ?? "transport", value);
          return (
            <Circle
              key={`overlay-${feature.id || index}`}
              center={[feature.lat, feature.lng]}
              radius={radiusFor(overlayData?.type ?? "transport", value)}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.25,
                opacity: 0.72,
                weight: 2,
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{feature.label}</div>
                  <div className="text-xs text-slate-500">{overlayData?.metadata.source}</div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {districts.map((district) => (
          <Marker
            key={`district-${district.id}`}
            position={[district.lat, district.lng]}
            icon={districtIcons.get(district.id)}
            eventHandlers={{ click: () => onDistrictClick?.(district.id) }}
          >
            <Popup className="cadmea-popup">
              <div className="min-w-[150px]">
                <div className="font-bold">{isLt ? district.nameLt || district.name : district.name}</div>
                <div className="text-xs text-slate-500">{district.city}</div>
                <div className="mt-2 text-xs font-semibold">{isLt ? "Gyvenimo kokybė" : "Liveability"} {district.overallScore.toFixed(1)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {renderedPois.map((poi) => (
          <Marker
            key={`poi-${poi.id}`}
            position={[poi.lat, poi.lng]}
            icon={poiIcons.get(poi.id)}
            eventHandlers={{ click: () => onPoiClick?.(poi) }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-bold">{isLt ? poi.nameLt || poi.name : poi.name}</div>
                <div className="text-xs capitalize text-slate-500">{isLt ? poiCategoryLabel(poi.category) : poi.category}</div>
                {poi.rating && <div className="text-xs font-semibold">{isLt ? "Įvertinimas" : "Rating"} {poi.rating.toFixed(1)}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function clampToLithuania(center: [number, number]): [number, number] {
  const [[south, west], [north, east]] = LITHUANIA_BOUNDS;
  const lat = Math.min(north, Math.max(south, Number.isFinite(center[0]) ? center[0] : LITHUANIA_CENTER[0]));
  const lng = Math.min(east, Math.max(west, Number.isFinite(center[1]) ? center[1] : LITHUANIA_CENTER[1]));
  return [lat, lng];
}

function poiCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    attraction: "lankytina vieta",
    restaurant: "kavinė / restoranas",
    hotel: "viešbutis",
    nightlife: "naktinis gyvenimas",
    transport: "transportas",
    emergency: "sveikata",
    pharmacy: "vaistinė",
    park: "parkas",
  };
  return labels[category] ?? category;
}
