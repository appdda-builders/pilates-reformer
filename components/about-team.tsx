"use client";

import { motion } from "framer-motion";

const TEAM_IMAGE = `${process.env.NEXT_PUBLIC_S3}team.jpg`;

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
          <p className="text-base text-black/70">
            Contamos con equipo profesional y un espacio diseñado para que te
            sientas cómodo desde tu primera clase, ya sea que estés comenzando
            o quieras llevar tu práctica más lejos.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="relative h-112 overflow-hidden rounded-card border border-black/10 bg-[#d8cfc2] shadow-[0_25px_50px_rgba(27,26,24,0.15)] md:h-136 lg:h-152 lg:order-last"
        >
          <div
            className="absolute inset-0 bg-cover bg-top"
            style={{ backgroundImage: `url('${TEAM_IMAGE}')` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-green-base/40 via-transparent to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
