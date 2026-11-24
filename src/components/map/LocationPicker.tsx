import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { TRABZON_CENTER, TRABZON_ZOOM } from "@/lib/reports";

type Props = {
  value: { lat: number; lng: number };
  onChange: (pos: { lat: number; lng: number }) => void;
};

export function LocationPicker({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: [value.lat || TRABZON_CENTER.lat, value.lng || TRABZON_CENTER.lng],
        zoom: TRABZON_ZOOM,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([value.lat, value.lng], {
        draggable: true,
        icon: L.divIcon({
          html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0284c7;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.3)"></span>`,
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 22],
        }),
      }).addTo(map);

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapRef.current = map;
      markerRef.current = marker;
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    const map = mapRef.current;
    if (!marker || !map) return;
    marker.setLatLng([value.lat, value.lng]);
    map.panTo([value.lat, value.lng]);
  }, [value.lat, value.lng]);

  return <div ref={containerRef} className="relative z-0 isolate h-56 w-full overflow-hidden rounded-xl border" />;
}

export default LocationPicker;
