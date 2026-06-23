"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const TEAM_IMAGE = `${process.env.NEXT_PUBLIC_S3}pilates_5.jpg`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function AboutTeam() {
  return (
    <section id="nosotros" className="scroll-mt-40">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <motion.div variants={fadeUp} className="flex flex-col gap-6">
          <p className="eyebrow eyebrow-on-light">Nuestro equipo</p>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl font-display">
            Quiénes somos
          </h2>
          <p className="text-base text-black/70">
            Somos un equipo de instructores certificados en Pilates Reformer,
            enfocados en acompañar a cada persona según su nivel y sus
            objetivos. Trabajamos con grupos reducidos para garantizar
            atención personalizada en cada clase.
          </p>
          <p className="text-base text-black/70">
            Nuestra metodología combina técnica, progresión gradual y
            seguimiento continuo, de modo que cada sesión sea segura y
            efectiva. Más que un estudio, buscamos crear una comunidad donde el
            movimiento consciente forme parte de tu día a día.
          </p>
          <div className="rounded py-4">
            <p className="text-3xl font-semibold leading-tight md:text-4xl font-display">
              Nuestra Misión:
            </p>
            <p className="text-base text-black/70">
              Brindar clases de pilates reformer accesibles y de alta calidad, promoviendo el bienestar integral, la confianza y el respeto por los procesos individuales de cada alumno.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="relative h-112 overflow-hidden rounded-card border border-black/10 bg-[#d8cfc2] shadow-[0_25px_50px_rgba(27,26,24,0.15)] md:h-136 lg:h-152 lg:order-last"
        >
          <Image
            src={TEAM_IMAGE}
            alt="Equipo de Studio 57 · Pilates Reformer"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-t from-green-base/40 via-transparent to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
