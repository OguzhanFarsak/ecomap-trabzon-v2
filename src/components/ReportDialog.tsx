import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LocateFixed, MapPin, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/map/LocationPicker";
import {
  REPORT_CATEGORIES,
  TRABZON_CENTER,
  createReport,
  isInTrabzon,
  uploadPhoto,
  type ReportCategory,
} from "@/lib/reports";

export function ReportDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ lat: TRABZON_CENTER.lat, lng: TRABZON_CENTER.lng });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ReportCategory>(REPORT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !email.trim()) throw new Error("İsim ve e-posta zorunludur.");
      if (!isInTrabzon(pos.lat, pos.lng))
        throw new Error("Seçilen konum Trabzon sınırları dışında görünüyor.");
      await createReport({
        reporter_name: name.trim(),
        reporter_email: email.trim(),
        description: description.trim(),
        category,
        lat: pos.lat,
        lng: pos.lng,
        photo_url: photo,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Bildiriminiz alındı. Teşekkürler!");
      setOpen(false);
      setName("");
      setEmail("");
      setDescription("");
      setPhoto(null);
      setPos({ lat: TRABZON_CENTER.lat, lng: TRABZON_CENTER.lng });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Cihazınız konum servisini desteklemiyor.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        toast.success("Konumunuz haritaya işaretlendi.");
      },
      () => {
        setLocating(false);
        toast.error("Konum alınamadı. Haritadan işaretleyebilirsiniz.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] supports-[height:100dvh]:max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kirlilik Bildir</DialogTitle>
          <DialogDescription>
            Trabzon içinde tespit ettiğiniz kirliliği konumu ve fotoğrafıyla bildirin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Konum</Label>
              <Button type="button" variant="secondary" size="sm" onClick={useMyLocation}>
                {locating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LocateFixed className="size-4" />
                )}
                Konumumu kullan
              </Button>
            </div>
            <LocationPicker value={pos} onChange={setPos} />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} — pini
              sürükleyerek veya haritaya tıklayarak değiştirin
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Fotoğraf</Label>
            <div className="flex items-center gap-3">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    setPhoto(await uploadPhoto(file));
                    toast.success("Fotoğraf eklendi.");
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Fotoğraf yüklenemedi.",
                    );
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {photo ? (
                <img
                  src={photo}
                  alt="Yüklenen kirlilik fotoğrafı"
                  className="size-12 rounded-md object-cover"
                />
              ) : (
                <Upload className="size-5 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">İsim</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Açıklama</Label>
            <Textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kirliliğin durumu, büyüklüğü, ulaşım bilgisi..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || uploading}
            className="w-full sm:w-auto"
          >
            {(mutation.isPending || uploading) && <Loader2 className="size-4 animate-spin" />}
            Bildirimi Gönder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReportDialog;
