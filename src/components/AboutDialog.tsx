import { useState } from "react";
import { Building2, HandHeart, Leaf, Sparkles, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const COLLABORATORS = [
  { name: "TEMA Vakfı", desc: "Toprak ve ekosistem koruma gönüllüleri" },
  { name: "Orman Bölge Müdürlüğü", desc: "Ormanlık alan denetim ve müdahale" },
  { name: "Yerel Belediyeler", desc: "Temizlik, bakım ve saha koordinasyonu" },
];

export function AboutDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] supports-[height:100dvh]:max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Hakkımızda
          </DialogTitle>
          <DialogDescription>
            EcoMap Trabzon — Ekolojik Veri Haritası projesi hakkında.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border bg-gradient-to-br from-accent/60 to-card p-3">
            <img
              src="/ivme-logo.png"
              alt="KTÜ İnovasyon ve Verimlilik Kulübü logosu"
              className="size-14 shrink-0 rounded-full object-cover ring-2 ring-background"
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Doğa İçin Kodla, Geleceğe Dokun!</div>
              <div className="text-xs text-muted-foreground">
                EcoMap Lansmanı — KTÜ İnovasyon ve Verimlilik Kulübü
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Leaf className="size-4 text-primary" />
              Proje Adı
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              “Doğa İçin Kodla, Geleceğe Dokun! — EcoMap Lansmanı”
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4 text-primary" />
              Geliştirici Ekip
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              KTÜ İnovasyon ve Verimlilik Kulübü Proje Ekibi
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HandHeart className="size-4 text-primary" />
              İş Birlikleri
            </div>
            <ul className="space-y-2 pl-6">
              {COLLABORATORS.map((c) => (
                <li key={c.name} className="flex items-start gap-2">
                  <Building2 className="mt-0.5 size-3.5 shrink-0 text-secondary" />
                  <span>
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">{c.desc} </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-secondary-soft p-3 text-center text-xs text-muted-foreground">
          Trabzon için, doğa ile birlikte. 🌿
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AboutDialog;
