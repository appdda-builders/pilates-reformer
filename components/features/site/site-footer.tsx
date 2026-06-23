import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";

import { Button } from "@/components/shared/ui/button";
import {
  siteAddress,
  siteBrandName,
  siteBrandShort,
  siteInstagramHandle,
  siteInstagramUrl,
  siteLogo,
  siteMapsEmbedUrl,
  sitePhoneDisplay,
  siteWhatsAppUrl,
} from "@/lib/site/routes";

export function SiteFooter() {
  return (
    <footer className="bg-footer text-primary-foreground mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <p className="font-display text-2xl">Bienvenido</p>
            <p className="font-sans text-sm opacity-90">
              Estudio de pilates Reformer en Lindavista, Ciudad de México.
            </p>
            <a
              href={siteInstagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-sans text-sm opacity-90 hover:opacity-100"
            >
              <FaInstagram className="size-5" aria-hidden />
              @{siteInstagramHandle}
            </a>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <p className="font-display text-2xl">Únete a {siteBrandShort}</p>
            <p className="font-sans text-sm opacity-90">
              Fortaleciendo tu poder consciente.
            </p>
            <div className="flex justify-center md:justify-start">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 font-sans"
              >
                <a href={siteWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                  Reserva ahora
                </a>
              </Button>
            </div>
          </div>
          <div className="space-y-3 text-center md:text-left">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase">
              Contacto
            </p>
            <a
              href={siteWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans inline-flex items-center justify-center gap-2 text-xl font-normal text-green-400 hover:text-green-300 md:justify-start sm:text-2xl"
            >
              <FaWhatsapp className="size-6" aria-hidden />
              {sitePhoneDisplay}
            </a>
            <p className="font-sans text-sm opacity-80">{siteAddress}</p>
          </div>
        </div>
        <div className="mt-14 grid gap-8 border-t border-white/10 pt-12 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-sans text-xl font-semibold">Ubicación</h2>
            <div className="space-y-1">
              <p className="font-sans text-sm font-semibold">Dirección</p>
              <p className="font-sans text-sm opacity-90">{siteAddress}</p>
            </div>
            <div className="space-y-1">
              <p className="font-sans text-sm font-semibold">Horario</p>
              <p className="font-sans text-sm opacity-90">
                Lunes a sábado con cita previa. Escríbenos por WhatsApp para
                disponibilidad.
              </p>
            </div>
          </div>
          <div>
            <p className="font-sans mb-2 text-sm text-white/60">Mapa</p>
            <div className="aspect-[4/3] w-full overflow-hidden md:min-h-[220px]">
              <iframe
                src={siteMapsEmbedUrl}
                width="600"
                height="450"
                className="h-full min-h-[220px] w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Ubicación de ${siteBrandName} en Google Maps`}
              />
            </div>
          </div>
        </div>
        <div className="font-sans mt-10 text-center text-xs opacity-60">
          <Link href="/" className="hover:opacity-100">
            © {siteBrandName}
          </Link>
        </div>
      </div>
    </footer>
  );
}
