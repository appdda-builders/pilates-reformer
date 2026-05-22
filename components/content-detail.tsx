"use client";

import { motion } from "framer-motion";
import { FaClock, FaHeart, FaMoon, FaSun } from "react-icons/fa6";

const morningSlots = [
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
];

const eveningSlots = [
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM",
  "8:00 PM - 9:00 PM",
];

const HORARIOS_BG = "/assets/gallery/pilates-reformer-gallery-003.jpeg";

export default function ContentDetail() {
  return (
    <section
      id="horarios"
      className="relative isolate scroll-mt-40 overflow-hidden rounded-card bg-slate-100/60 p-6 shadow-lg"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(47,107,95,0.12),transparent_55%)]" />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-card border border-black/10 bg-[#d8cfc2] shadow-[0_25px_50px_rgba(27,26,24,0.15)]"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${HORARIOS_BG}')` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-6 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FaHeart className="text-green-mid" />
              Horarios Pilates
            </div>
            <div>
              <p className="eyebrow eyebrow-on-dark">Sesiones de 60 minutos</p>
              <p className="mt-2 text-2xl font-semibold font-display">
                Agenda optimizada para reservar rapido.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="flex flex-col gap-6"
        >
          <div>
            <p className="eyebrow eyebrow-on-light">Horarios del calendario</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight font-display">
              Bloques claros, reservables y visuales.
            </h2>
            <p className="mt-2 text-sm text-black/60">
              Matutino y vespertino listos para que el cliente elija rapido.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card border border-black/10 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-base">
                <FaSun />
                Matutino
              </div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                {morningSlots.map((slot) => (
                  <li
                    key={slot}
                    className="rounded-inner border border-black/5 bg-[#f6f1ea]/70 px-3 py-2 text-center"
                  >
                    {slot}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card border border-black/10 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-base">
                <FaMoon />
                Vespertino
              </div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                {eveningSlots.map((slot) => (
                  <li
                    key={slot}
                    className="rounded-inner border border-black/5 bg-[#f6f1ea]/70 px-3 py-2 text-center"
                  >
                    {slot}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-card border border-black/10 bg-white/90 px-4 py-3 text-sm text-black/70">
            <FaClock className="text-green-mid" />
            <span>Clases de 60 minutos con disponibilidad en tiempo real.</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#agenda"
              className="rounded-full bg-green-base px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-green-base/20 transition hover:-translate-y-0.5"
            >
              Reservar en agenda
            </a>
            <a
              href="#planes"
              className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-black/70 transition hover:border-black/20"
            >
              Ver planes
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
