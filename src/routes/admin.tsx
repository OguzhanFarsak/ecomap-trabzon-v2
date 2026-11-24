import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, KeyRound, Lock, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import { hasCustomAdminPassword, verifyAdminPassword } from "@/lib/admin-auth";
import {
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  deleteReport,
  formatDate,
  listReports,
  updateReportStatus,
  uploadPhoto,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/reports";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Belediye Paneli — EcoMap Trabzon" },
      {
        name: "description",
        content: "Trabzon çevre kirliliği bildirimlerini yönet, durum güncelle ve rapor çıkart.",
      },
      { property: "og:title", content: "EcoMap Belediye Paneli" },
      {
        property: "og:description",
        content: "Bildirimleri filtrele, temizlendi olarak işaretle, PDF olarak dışa aktar.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [hasCustomPassword, setHasCustomPassword] = useState(false);

  useEffect(() => {
    setHasCustomPassword(hasCustomAdminPassword());
  }, []);

  if (!authed) {
    return (
      <div className="flex min-h-screen supports-[height:100dvh]:min-h-dvh items-center justify-center bg-muted/40 px-4 py-6">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-soft">
          <div className="gradient-eco mb-4 flex size-11 items-center justify-center rounded-xl text-primary-foreground">
            <Lock className="size-5" />
          </div>
          <h1 className="text-xl font-bold">Belediye / Yönetici Girişi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasCustomPassword
              ? "Yetkili paneli şifrenizi girin."
              : "Panel şifresini girin (varsayılan: admin123)."}
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await verifyAdminPassword(password)) {
                setPassword("");
                setAuthed(true);
              } else {
                toast.error("Şifre hatalı.");
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="pw">Şifre</Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Panele Gir
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/">Haritaya dön</Link>
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: listReports });
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (statusFilter === "all" || r.status === statusFilter) &&
          (categoryFilter === "all" || r.category === categoryFilter) &&
          (search.trim() === "" ||
            `${r.reporter_name} ${r.reporter_email} ${r.description}`
              .toLowerCase()
              .includes(search.toLowerCase())),
      ),
    [reports, statusFilter, categoryFilter, search],
  );

  const statusMutation = useMutation({
    mutationFn: async (vars: { id: string; status: ReportStatus; photo?: string | null }) =>
      updateReportStatus(vars.id, vars.status, vars.photo),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Bildirim güncellendi.");
    },
    onError: (e: Error) => toast.error(e.message || "Bildirim güncellenemedi."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReport(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("İhbar kaldırıldı.");
    },
    onError: (e: Error) => toast.error(e.message || "İhbar kaldırılamadı."),
  });

  return (
    <div className="min-h-screen supports-[height:100dvh]:min-h-dvh bg-muted/40">
      <header className="no-print border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">Belediye Yönetim Paneli</h1>
            <p className="text-sm text-muted-foreground">
              {reports.length} bildirim ·{" "}
              {reports.filter((r) => r.status === "Temizlendi").length} temizlendi
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <ChangePasswordDialog>
              <Button variant="outline" size="sm">
                <KeyRound className="size-4" />
                Şifre Değiştir
              </Button>
            </ChangePasswordDialog>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" />
              Yazdır / PDF
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="size-4" />
                Harita
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <div className="no-print grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Durum</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ReportStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {REPORT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as ReportCategory | "all")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {REPORT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q">Ara</Label>
            <Input
              id="q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim, e-posta, açıklama"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              Filtreye uygun bildirim yok.
            </p>
          )}
          {filtered.map((r) => (
            <article
              key={r.id}
              className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[9rem_1fr]"
            >
              {r.photo_url ? (
                <img
                  src={r.photo_url}
                  alt={`${r.category} bildirimi fotoğrafı`}
                  className="h-28 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                  Fotoğraf yok
                </div>
              )}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{r.category}</h2>
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{r.description || "Açıklama yok"}</p>
                <p className="text-xs text-muted-foreground">
                  {r.reporter_name} · {r.reporter_email} · {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                </p>

                {r.cleaned_photo_url && (
                  <div className="flex items-center gap-2">
                    <img
                      src={r.cleaned_photo_url}
                      alt="Temizlenmiş alanın fotoğrafı"
                      className="h-16 w-24 rounded-md object-cover"
                    />
                    <span className="text-xs text-primary">Temizlik sonrası fotoğraf</span>
                  </div>
                )}

                <div className="no-print flex flex-wrap items-center gap-2 pt-1">
                  <Select
                    value={r.status}
                    onValueChange={(v) =>
                      statusMutation.mutate({ id: r.id, status: v as ReportStatus })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Label
                    htmlFor={`clean-${r.id}`}
                    className="cursor-pointer rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-accent"
                  >
                    Temiz hali fotoğrafı yükle
                  </Label>
                  <input
                    id={`clean-${r.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadPhoto(file);
                        statusMutation.mutate({ id: r.id, status: "Temizlendi", photo: url });
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Fotoğraf yüklenemedi.",
                        );
                      }
                    }}
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                        İhbarı Kaldır
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>İhbarı kaldırmak istiyor musunuz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. {r.category} bildirimi listeden ve haritadan
                          kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMutation.mutate(r.id)}
                        >
                          Evet, Kaldır
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const cls =
    status === "Temizlendi"
      ? "bg-primary text-primary-foreground"
      : status === "İnceleniyor"
        ? "bg-warning text-warning-foreground"
        : "bg-destructive text-destructive-foreground";
  return <Badge className={cls}>{status}</Badge>;
}
