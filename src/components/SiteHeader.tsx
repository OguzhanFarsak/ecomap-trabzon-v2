import { Link } from "@tanstack/react-router";
import { Info, Leaf, MegaphoneIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportDialog from "@/components/ReportDialog";
import AboutDialog from "@/components/AboutDialog";
import type { Report } from "@/lib/reports";

export function SiteHeader({ reports }: { reports: Report[] }) {
  const total = reports.length;
  const cleaned = reports.filter((r) => r.status === "Temizlendi").length;

  return (
    <header className="no-print z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-eco flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
              EcoMap
              <img
                src="/ivme-logo.png"
                alt="KTÜ İnovasyon ve Verimlilik Kulübü"
                className="size-6 rounded-full object-cover ring-1 ring-border"
              />
            </span>
            <span className="text-[10px] font-medium text-primary/90 sm:text-[11px]">
              KTÜ İnovasyon ve Verimlilik Kulübü Tarafından Geliştirilmiştir
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden grid-cols-2 gap-2 sm:grid">
            <Stat label="Toplam İhbar" value={total} tone="secondary" />
            <Stat label="Temizlenen Alan" value={cleaned} tone="primary" />
          </div>
          <AboutDialog>
            <Button size="sm" variant="ghost">
              <Info className="size-4" />
              <span className="hidden sm:inline">Hakkımızda</span>
            </Button>
          </AboutDialog>
          <ReportDialog>
            <Button size="sm">
              <MegaphoneIcon className="size-4" />
              <span className="hidden sm:inline">Kirlilik Bildir</span>
            </Button>
          </ReportDialog>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin">
              <ShieldCheck className="size-4" />
              <span className="hidden sm:inline">Yetkili Paneli</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pb-3 sm:hidden">
        <Stat label="Toplam İhbar" value={total} tone="secondary" />
        <Stat label="Temizlenen Alan" value={cleaned} tone="primary" />
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "secondary";
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-1.5 ${
        tone === "primary" ? "bg-accent" : "bg-secondary-soft"
      }`}
    >
      <div className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">{label}</div>
      <div
        className={`text-base font-bold ${tone === "primary" ? "text-primary" : "text-secondary"}`}
      >
        {value}
      </div>
    </div>
  );
}

export default SiteHeader;
