"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { FaPlayCircle, FaRegStopCircle } from "react-icons/fa";
import ContentDetail from "@/components/content-detail";
import SetupWeeklySchedule from "@/components/setup-weekly-schedule";
import HeroVideo from "@/components/hero-video";
import AboutTeam from "@/components/about-team";
import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = `${process.env.NEXT_PUBLIC_S3}Studio57.jpeg`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cadenceConfig = [
  { label: "Semanal", period: "semana", weeks: 1 },
  { label: "Quincenal", period: "quincena", weeks: 2 },
  { label: "Mensual", period: "mes", weeks: 4 },
] as const;

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

const studioPlans = [
  {
    name: "Plan Equilibrio",
    classesPerWeek: 3,
    prices: {
      Semanal: "$400",
      Quincenal: "$700",
      Mensual: "$1350",
    },
    image: `${process.env.NEXT_PUBLIC_S3}pilates_6.jpg`,
  },
  {
    name: "Plan Vitalidad",
    classesPerWeek: 5,
    prices: {
      Semanal: "$650",
      Quincenal: "$1150",
      Mensual: "$2200",
    },
    image: `${process.env.NEXT_PUBLIC_S3}pilates_1.jpg`,
  },
];

const stats = [
  { label: "Clientes activos", value: "128" },
  { label: "Ocupación semanal", value: "87%" },
  { label: "Cobros al día", value: "98%" },
];

const flow = [
  {
    title: "Configura planes y cupos",
    description:
      "Define sesiones, límite de reservas y reglas de reprogramación por plan.",
  },
  {
    title: "Automatiza cobros",
    description:
      "Mensualidades recurrentes, facturas y recordatorios en un solo lugar.",
  },
  {
    title: "Agenda inteligente",
    description:
      "El cliente reserva en tiempo real y recibe confirmación inmediata.",
  },
  {
    title: "Seguimiento continuo",
    description:
      "Notas por clase, evolución y renovación automática de planes.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCadence, setSelectedCadence] = useState<
    Record<string, (typeof cadenceConfig)[number]["label"]>
  >(() =>
    Object.fromEntries(studioPlans.map((plan) => [plan.name, "Semanal"]))
  );
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(true);

  const toggleHeroVideo = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setHeroVideoPlaying(true))
        .catch(() => setHeroVideoPlaying(false));
    } else {
      video.pause();
      setHeroVideoPlaying(false);
    }
  };

  const navLinks = [
    { href: "#planes", label: "Planes" },
    { href: "#nosotros", label: "Nosotros" },
    { href: "#agenda", label: "Agenda" },
    { href: "#cobros", label: "Cobros" },
  ];

  const handleReserve = () => {
    if (!selectedSlot || !selectedDate) return;
    setSelectedSlot("");
    setSelectedDate("");
  };

  const scrollToAgenda = () => {
    document
      .getElementById("agenda")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-clip bg-[#f9f0e3] text-[#1b1a18]"
    >
      <div className="pointer-events-none absolute -left-20 top-40 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(47,107,95,0.25),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[-60px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(47,79,79,0.35),transparent_70%)] blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-[-120px] left-1/3 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,215,186,0.5),transparent_70%)] blur-3xl" />

      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed left-1/2 top-0 z-50 w-full -translate-x-1/2  border pl-3 pr-4 py-2  backdrop-blur transition border-black/10 bg-white/95 text-[#1b1a18] shadow-[0_12px_30px_rgba(27,26,24,0.12)]`}
      >
        <div className="flex items-center justify-between gap-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <a
              href="#top"
              className="relative h-14 w-14 overflow-hidden"
            >
              <Image
                src={LOGO_SRC}
                alt="Studio 57"
                fill
                sizes="63px"
                className="object-cover shadow-lg shadow-white/20"
              />
            </a>
            <div>
              <p className="text-sm font-semibold tracking-wide">
                Studio 57 · Pilates Reformer
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-green-mid"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="rounded-full bg-green-base px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-hover"
            >
              Iniciar sesión
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition lg:hidden border-black/20 bg-white/90 text-[#1b1a18]`}
          >
            <span className="relative block h-4 w-4">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full rounded-full transition bg-[#1b1a18] ${menuOpen ? "translate-y-1.5 rotate-45" : ""
                  }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-full rounded-full transition bg-[#1b1a18] ${menuOpen ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-full rounded-full transition bg-[#1b1a18] ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
              />
            </span>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute right-4 top-24 max-h-[calc(100vh-7rem)] w-[min(85vw,320px)] overflow-y-auto rounded-card border border-black/10 bg-white/95 p-6 shadow-[0_25px_60px_rgba(27,26,24,0.2)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="eyebrow eyebrow-muted">Menú</p>
                  <p className="text-lg font-semibold">Pilates Reformer</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/60"
                >
                  Cerrar
                </button>
              </div>
              <div className="flex flex-col gap-3 text-sm font-semibold text-[#1b1a18]">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-inner border border-black/5 bg-[#f6f1ea] px-4 py-3 transition hover:bg-[#eae1d6]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-5 block w-full rounded-full bg-green-base px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-hover"
              >
                Iniciar Sesión
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative isolate min-h-[70vh] overflow-hidden lg:min-h-[82vh]">
        <HeroVideo videoRef={heroVideoRef} onPlayingChange={setHeroVideoPlaying} />
        <div
          className="pointer-events-none absolute inset-0 z-1"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 22%, rgba(249,240,227,0.2) 48%, rgba(249,240,227,0.6) 70%, rgba(249,240,227,0.9) 85%, #f9f0e3 100%)",
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-10 px-6 pb-20 pt-32 text-white sm:pt-36 lg:min-h-[82vh] lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:pb-28 lg:pt-32">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col justify-center gap-8"
          >
            <motion.h1
            variants={fadeUp}
            className="text-center text-4xl text-[#f9ecda] font-semibold leading-tight font-display">
              Bienvenido
              <br />
              Tu cambio comienza en:
            </motion.h1>
            <motion.div
              variants={fadeUp}
              className="m-auto h-24 w-24 object-cover flex justify-center items-center p-2 rounded-full overflow-hidden bg-white"
              >
              <Image
                src={LOGO_SRC}
                alt="Studio 57 · Pilates Reformer"
                width={80}
                height={80}
                className="h-20 w-20 object-cover mx-auto m-1"
                priority
              />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-center text-4xl font-semibold leading-tight font-display"
            >
              Studio 57 · Pilates Reformer
            </motion.h1>
            <motion.h2 variants={fadeUp} className="text-center text-xl font-semibold text-white/80">
            Lázaro Cárdenas - Michoacán, México
            </motion.h2>
            <motion.button
              variants={fadeUp}
              type="button"
              onClick={toggleHeroVideo}
              aria-label={heroVideoPlaying ? "Detener video" : "Reproducir video"}
              className="mx-auto flex items-center justify-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/70"
            >
              {heroVideoPlaying ? (
                <>
                  <FaRegStopCircle size={26} />
                  <span>Detener</span>
                </>
              ) : (
                <>
                  <FaPlayCircle size={26} />
                  <span>Reproducir</span>
                </>
              )}
            </motion.button>
            <motion.div variants={fadeUp} className="flex lg:hidden flex-wrap gap-4 justify-center">
              <a
                href="#weekly"
                className="rounded-full bg-green-base px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-hover shadow-lg shadow-green-base/20"
              >
                Clase Muestra
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            key="weekly"
            id="weekly"
            className="relative flex min-h-105 scroll-mt-40 flex-col gap-4 rounded-card border border-white/15 bg-white/10 p-5 text-white shadow-[0_25px_60px_rgba(27,26,24,0.18)] backdrop-blur sm:p-6 lg:min-h-[480px]"
          >
            <SetupWeeklySchedule onSelectClass={scrollToAgenda} />
            <button
              type="button"
              onClick={scrollToAgenda}
              className="shrink-0 cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1b1a18] shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
            >
              Continuar
            </button>
          </motion.div>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24">
        <section id="planes" className="scroll-mt-40">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col gap-10"
          >
            <motion.div variants={fadeUp} className="max-w-2xl mt-10">
              <p className="eyebrow eyebrow-on-light">Nuestros planes</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl font-display">
                Elige tus clases
              </h2>
              <p className="mt-3 text-base text-black/70">
                Clases de pilates reformer diseñadas para fortalecer tus músculos, mejorar tu postura y desarrolla una conexión mas consciente con tu cuerpo.
                <br/>Elige el plan que más se adapte a tus objetivos y estilo de vida.
              </p>
            </motion.div>

            <div className="grid gap-8">
              {studioPlans.map((plan) => {
                const activeCadence =
                  cadenceConfig.find(
                    (cadence) => cadence.label === selectedCadence[plan.name]
                  ) ?? cadenceConfig[0];

                return (
                  <motion.article
                    key={plan.name}
                    variants={fadeUp}
                    className="grid grid-cols-1 gap-3 overflow-hidden lg:rounded-card border border-black/10 bg-white/90 shadow-[0_20px_40px_rgba(27,26,24,0.08)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:min-h-[32rem]"
                  >
                    <div className="relative aspect-5/4 w-full overflow-hidden lg:aspect-auto lg:h-full lg:self-stretch">
                      <div
                        className="absolute inset-0 bg-[#d8cfc2] bg-cover bg-center"
                        style={{ backgroundImage: `url('${plan.image}')` }}
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-6 p-4 sm:p-6">
                      <div className="flex flex-col gap-5">
                        <div>
                          <h3 className="text-xl font-semibold font-display sm:text-2xl">
                            {plan.name}
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-green-base">
                            {plan.classesPerWeek * activeCadence.weeks} clases por{" "}
                            {activeCadence.period}
                          </p>
                        </div>
                        <div className="grid gap-2 text-sm">
                        {cadenceConfig.map((cadence) => {
                          const isActive = cadence.label === activeCadence.label;
                          return (
                            <button
                              key={cadence.label}
                              type="button"
                              onClick={() =>
                                setSelectedCadence((prev) => ({
                                  ...prev,
                                  [plan.name]: cadence.label,
                                }))
                              }
                              aria-pressed={isActive}
                              className={`flex items-center justify-between gap-2 rounded-inner border px-3 py-2.5 text-left transition sm:px-4 sm:py-3 ${
                                isActive
                                  ? "border-green-base bg-green-base/10 ring-1 ring-green-base/30"
                                  : "border-black/5 bg-[#f6f1ea]/80 hover:border-green-base/40"
                              }`}
                            >
                              <span className="eyebrow text-black/50">
                                {cadence.label}
                              </span>
                              <span className="text-lg font-semibold text-green-base">
                                {plan.prices[cadence.label]}
                              </span>
                            </button>
                          );
                        })}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-1 w-full rounded-full bg-green-base px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-hover"
                      >
                        Adquirir Plan
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-between lg:rounded-card border border-black/10 bg-white/80 px-6 py-5"
            >
              <p className="eyebrow eyebrow-muted">Clase Individual</p>
              <p className="text-2xl font-semibold text-green-base">$140</p>
            </motion.div>
          </motion.div>
        </section>

        <AboutTeam />
        <ContentDetail />
        <section id="quienes-somos" className="scroll-mt-40">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <p className="eyebrow eyebrow-on-light">Quiénes somos</p>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl font-display">
                Studio 57 · Pilates Reformer
              </h2>
              <p className="text-base text-black/70">
                Studio 57 nació con el propósito de ofrecer un espacio seguro, armonioso y profesional donde el Pilates no solo fortalece tu cuerpo sino también tu salud mental y tu confianza.
              </p>
              <p className="text-base text-black/70">
                Inspiración: disfrutar del privilegio del movimiento y un cuerpo sano, curar el dolor, mejorar la calidad de vida de las personas.
              </p>
              <div className="rounded py-4">
                <p className="text-3xl font-semibold leading-tight md:text-4xl font-display">
                  Nuestra Visión:
                </p>
                <p className="text-base text-black/70">
                  Consolidarnos como un estudio de pilates líder en calidad y calidez humana, ofreciendo clases de pilates accesibles, profesiones y transformadoras, donde el movimiento se convierte en una herramienta para sanar, fortalecer y disfrutar la vida con plenitud.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="relative h-80 overflow-hidden rounded-card border border-black/10 bg-[#d8cfc2] shadow-[0_25px_50px_rgba(27,26,24,0.15)] md:h-112 lg:order-last"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_S3}material.jpg`}
                alt="Estudio Studio 57 · Pilates Reformer"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-green-base/40 via-transparent to-transparent" />
            </motion.div>
          </motion.div>
        </section>

        <section id="cobros" className="scroll-mt-40">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <p className="eyebrow eyebrow-on-light">Cobros y renovaciones</p>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl font-display">
                Datos para transferencia bancaria.
              </h2>
              <motion.div
                    key="bank-info"
                    variants={fadeUp}
                    className="flex items-start gap-5 rounded-inner border border-black/5 bg-white/80 px-6 py-5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-base text-sm font-semibold text-white">
                  <span>Az</span>
                </div>
                <div>
                    <p className="text-base text-black/70">
                      Banco: Banco Azteca
                    </p>
                    <p className="text-base text-black/70">
                      Cuenta: 5263-5401-5974-3604
                    </p>
                    <p className="text-base text-black/70">
                      Titular: ADALBERTO RESENDIZ RAGEL
                    </p>
                    <p className="text-base text-black/70">
                      Motivo: Nombre completo
                    </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-4 rounded-card border border-black/10 bg-white/90 p-6 shadow-[0_20px_40px_rgba(27,26,24,0.1)]"
            >
              <div>
                <p className="eyebrow eyebrow-muted">Se parte de Studio 57</p>
                <h3 className="mt-3 text-2xl font-semibold font-display">
                  Disfruta de todos los beneficios de nuestras clases.
                </h3>
              </div>
              <div className="grid gap-3">
                <div className="rounded-inner border border-black/5 bg-white px-5 py-4">
                  <p className="eyebrow text-black/50">Agenda tu clase</p>
                  <p className="text-lg font-semibold">
                    ¿Aún no tienes cuenta?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-black/60">
                    <span className="rounded-full bg-[#f6f1ea] px-3 py-1">
                      Reserva tu clase muestra gratuita
                    </span>
                    <span className="rounded-full bg-[#f6f1ea] px-3 py-1">
                      Realiza tu primer pago y únete a nuestra comunidad de bienestar.
                    </span>
                    <span className="rounded-full bg-[#f6f1ea] px-3 py-1">
                      Configura tus cobros para mantener tu progreso sin interrupciones.
                    </span>
                  </div>
                </div>
              </div>
              <button className="rounded-full bg-green-base px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-base/20 transition hover:-translate-y-0.5">
                Ver Cuenta
              </button>
            </motion.div>
          </motion.div>
        </section>

        <section id="agenda" className="scroll-mt-40">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="overflow-hidden rounded-card border border-green-base/15 shadow-[0_25px_60px_rgba(27,26,24,0.12)]"
          >
            <motion.div
              variants={fadeUp}
              className="bg-green-base px-6 py-12 text-center text-white sm:py-16"
            >
              <p className="eyebrow eyebrow-on-dark mx-auto">Agenda</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight font-display">
                Agendar clase
              </h2>
              <p className="mt-4 text-base text-white/80">
                Elige fecha y horario. Al confirmar iniciarás sesión para
                identificar tu reserva.
              </p>
              <p className="text-base text-white/80">
                Los planes son mensuales y las clases no son acumulables.
              </p>
            </motion.div>

            <div className="bg-[#f9f0e3] px-6 py-12 sm:py-16">
              <motion.div
                variants={fadeUp}
                className="mx-auto w-full max-w-md overflow-hidden rounded-card border border-green-base/30 bg-white shadow-[0_20px_40px_rgba(27,26,24,0.1)]"
              >
                <div className="border-b border-green-base/10 bg-green-base/10 px-6 py-5 text-center">
                  <h3 className="text-lg font-semibold text-green-base font-display">
                    Reserva tu clase
                  </h3>
                </div>

                <div className="flex flex-col gap-5 p-6">
                  <p className="text-sm text-black/60">
                    Al confirmar, iniciarás sesión con tu ID y contraseña para
                    identificar tu reserva.
                  </p>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="agenda-fecha"
                      className="text-sm font-semibold"
                    >
                      Fecha de la clase
                    </label>
                    <input
                      id="agenda-fecha"
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="w-full rounded-inner border border-black/10 bg-white px-4 py-3 text-sm focus:border-green-base focus:outline-none focus:ring-1 focus:ring-green-base/30"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="agenda-horario"
                      className="text-sm font-semibold"
                    >
                      Horario
                    </label>
                    <select
                      id="agenda-horario"
                      value={selectedSlot}
                      onChange={(event) => setSelectedSlot(event.target.value)}
                      className="w-full rounded-inner border border-black/10 bg-white px-4 py-3 text-sm focus:border-green-base focus:outline-none focus:ring-1 focus:ring-green-base/30"
                    >
                      <option value="">Elige clase y hora</option>
                      <optgroup label="Matutino">
                        {morningSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Vespertino">
                        {eveningSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <p className="text-sm text-black/50">
                    {selectedDate && selectedSlot
                      ? `Reservarás el ${selectedDate} · ${selectedSlot}.`
                      : "Completa la fecha y el horario."}
                  </p>

                  <button
                    onClick={handleReserve}
                    disabled={!selectedDate || !selectedSlot}
                    className="w-full rounded-full bg-green-base px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-base/20 transition hover:bg-green-hover disabled:cursor-not-allowed disabled:bg-green-base/40 disabled:shadow-none"
                  >
                    Confirmar reserva
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 overflow-hidden border border-white/15">
                <Image
                  src={LOGO_SRC}
                  alt="Studio 57 · Pilates Reformer"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover shadow-lg shadow-white/20"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">Studio 57 · Pilates Reformer</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <p className="text-amber-100">Contacto</p>
            <span>+52 55 1234 5678</span>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <p className="text-amber-100">Social</p>
            <span>hola@pilatesreformer.com</span>
          </div>
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 rounded-card border border-white/10 bg-white/10 p-4 text-sm text-white/70 shadow-[0_20px_40px_rgba(27,26,24,0.1)] backdrop-blur"
            >
              <p className="text-amber-100">Ubicación</p>
              <p>Av. Lázaro Cárdenas 123, Col. Centro, Lázaro Cárdenas, Michoacán</p>
              <div className="mt-3 overflow-hidden rounded-inner border border-white/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3795.3043480185247!2d-102.1976358!3d17.964571900000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x84315df7e23a5e4d%3A0x52378ed977416fe4!2sStudio%2057%20Pilates%20Reformer%20LZC!5e0!3m2!1ses!2smx!4v1781316731996!5m2!1ses!2smx"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Studio 57 Pilates Reformer"
                  className="block w-full grayscale"
                />
              </div>
            </motion.div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <p className="text-amber-100">Explorar</p>
            <a href="#planes" className="transition hover:text-white">
              Planes
            </a>
            <a href="#nosotros" className="transition hover:text-white">
              Nosotros
            </a>
            <a href="#agenda" className="transition hover:text-white">
              Agenda
            </a>
            <a href="#cobros" className="transition hover:text-white">
              Cobros
            </a>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <p className="text-amber-100">Agenda</p>
            <p>
              Ven y conócenos en nuestro estudio para una clase muestra gratuita.
              con pilates puedes transformar tu bienestar y alcanzar tus objetivos de salud.
              <br /><br />
              ¡Te esperamos con los brazos abiertos!
            </p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <a
              href="#weekly"
              className="rounded-full bg-green-base px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-hover shadow-lg shadow-green-base/20">
                Clase Muestra
              </a>
            </motion.div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
            <p>© 2026 | Studio 57 · Pilates Reformer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}