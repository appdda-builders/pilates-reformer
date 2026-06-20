"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shared/ui/accordion";
import { siteAddress, siteBrandName, siteInstagramHandle, sitePhoneDisplay } from "@/lib/site/routes";

const items = [
  {
    q: "¿Cómo puedo reservar una clase?",
    a:
      "Escríbenos por WhatsApp al " +
      sitePhoneDisplay +
      ` o por Instagram en @${siteInstagramHandle}. Te confirmamos horario y disponibilidad.`,
  },
  {
    q: `¿Qué servicios ofrecen en ${siteBrandName}?`,
    a: "Pilates Reformer en un ambiente exclusivo y profesional, con equipamiento moderno y grupos controlados.",
  },
  {
    q: `¿Dónde se encuentra ${siteBrandName}?`,
    a: siteAddress,
  },
  {
    q: "¿Qué tipo de ambiente tienen?",
    a: "Minimalista, cálido y ordenado: un espacio pensado para concentrarte en tu práctica sin distracciones.",
  },
  {
    q: "¿Qué debo llevar a clase?",
    a: "Ropa cómoda que te permita moverte con libertad, calcetas antiderrapantes y una botella de agua.",
  },
];

export function ReservacionesFaq() {
  return (
    <Accordion type="single" collapsible className="w-full font-sans">
      {items.map((item, i) => (
        <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
          <AccordionTrigger className="text-foreground text-left font-semibold hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
