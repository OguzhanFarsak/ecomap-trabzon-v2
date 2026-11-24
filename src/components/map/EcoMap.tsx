import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import {
  STATUS_COLORS,
  TRABZON_CENTER,
  TRABZON_ZOOM,
  formatDate,
  type Report,
} from "@/lib/reports";

function pinHtml(color: string) {
  return `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.3)"></span>`;
}

function popupHtml(r: Report) {
  const photo = r.photo_url
    ? `<img src="${r.photo_url}" alt="Bildirim fotoğrafı" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px" />`
    : `<div style="width:100%;height:70px;display:flex;align-items:center;justify-content:center;background:#f1f5f9;border-radius:8px;margin-bottom:8px;font-size:12px;color:#64748b">Fotoğraf yok</div>`;
  const cleaned = r.cleaned_photo_url
    ? `<img src="${r.cleaned_photo_url}" alt="Temizlenmiş hali" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-top:6px" />`
    : "";
  return `
    <div style="font-size:13px;line-height:1.45">
      ${photo}
      <div style="font-weight:600;margin-bottom:2px">${r.category}</div>
      <div style="color:#64748b;font-size:12px">${formatDate(r.created_at)}</div>
      <div style="margin-top:6px;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:${STATUS_COLORS[r.status]}">
        <span style="width:8px;height:8px;border-radius:99px;background:${STATUS_COLORS[r.status]}"></span>
        ${r.status === "Temizlendi" ? "Temizlendi ✓" : r.status}
      </div>
      ${r.description ? `<p style="margin:8px 0 0;color:#475569;font-size:12px">${r.description}</p>` : ""}
      ${cleaned}
    </div>`;
}

export function EcoMap({ reports }: { reports: Report[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: [TRABZON_CENTER.lat, TRABZON_CENTER.lng],
        zoom: TRABZON_ZOOM,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap katkıcıları",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      setReady((v) => v + 1);

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          map.invalidateSize();
        });
        observer.observe(containerRef.current);
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = (await import("leaflet")).default;
      const m = mapRef.current;
      if (cancelled || !m) return;
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = reports.map((r) =>
        L.marker([r.lat, r.lng], {
          icon: L.divIcon({
            html: pinHtml(STATUS_COLORS[r.status]),
            className: "",
            iconSize: [22, 22],
            iconAnchor: [11, 22],
          }),
        })
          .addTo(m)
          .bindPopup(popupHtml(r)),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [reports, ready]);


  return <div ref={containerRef} className="relative z-0 isolate h-full w-full" />;
}

export default EcoMap;
