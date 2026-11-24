import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { STATUS_COLORS, listReports, REPORT_STATUSES } from "@/lib/reports";

const EcoMap = lazy(() => import("@/components/map/EcoMap"));
import SiteHeader from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoMap Trabzon — Çevre Kirliliği Bildirim Haritası" },
      {
        name: "description",
        content:
          "Trabzon'daki çöp, moloz, sahil ve dere kirliliğini haritada bildir, temizlenme sürecini takip et.",
      },
      { property: "og:title", content: "EcoMap Trabzon — Ekolojik Veri Haritası" },
      {
        property: "og:description",
        content: "Trabzon'un çevre kirliliği haritası: bildir, izle, temizlensin.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: listReports });

  return (
    <div className="flex h-screen supports-[height:100dvh]:h-dvh flex-col overflow-hidden">
      <SiteHeader reports={reports} />
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <h1 className="sr-only">Trabzon çevre kirliliği haritası</h1>
        <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
          <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
            <EcoMap reports={reports} />
          </Suspense>
        </ClientOnly>

        <div className="no-print pointer-events-none absolute bottom-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] left-3 z-[500] rounded-xl border bg-card/95 px-2.5 py-2 text-xs shadow-float sm:bottom-6 sm:left-4 sm:p-3">
          <div className="mb-1.5 font-semibold sm:mb-2">Durum Göstergesi</div>
          <ul className="space-y-1 sm:space-y-1.5">
            {REPORT_STATUSES.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[s] }}
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
