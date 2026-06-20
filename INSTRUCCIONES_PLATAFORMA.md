# Guía de acceso — Pilates Reformer (Appstract)

**Versión:** Demostración · datos fake de `scripts/postgres-manual/03-seed-fake.sql` (mayo 2026)

---

## Bienvenida

Esta guía explica cómo entrar y explorar el **sistema de gestión** con los datos de prueba actuales del proyecto **@appstract/pilates-reformer**.

Pueden hacer clic, crear cambios de prueba y salir cuando gusten. Es reversible: los datos viven en la base de datos de demo, no en producción real.

> El **landing** (`/`) muestra la marca **Studio 57 · Pilates reformer** (demo de producto Appstract).  
> Tras cargar el seed, el **dashboard** usa el nombre de estudio **Pilates Studio** (configuración en `studio_policy`).

---

## Cómo entrar al sistema

### Desarrollo local

1. Abran Chrome, Safari o Edge.
2. Vayan a **http://localhost:3000**
3. Entren al panel: **http://localhost:3000/login**
4. Escriban **correo** y **contraseña** de las tablas de abajo.
5. Pulsen **Entrar** → los lleva al **Dashboard**.

### Producción / staging (PostgreSQL)

Si el equipo desplegó la app en internet, usen la URL que les compartieron (misma ruta `/login`).

Servidor de base de datos de referencia (ver `docs/DATABASE.md`):

| Campo   | Valor           |
|---------|-----------------|
| Host    | `159.203.90.92` |
| Puerto  | `5432`          |
| Base    | `pilates`       |
| Usuario | `postgres`      |

**Cargar datos fake (una vez, con `.env.local` configurado):**

```bash
npm run db:pg:schema   # solo si la BD está vacía
npm run db:pg:seed
npm run db:pg:check
npm run dev
```

> Si ya estaban logueados con otra cuenta, usen **Cerrar sesión** en el menú superior antes de probar otro perfil.

---

## Cuentas de prueba

Todas las contraseñas son **solo para demostración**. No las usen en la vida real ni las compartan fuera del equipo.

### Operador (acceso total — root)

| Nombre en pantalla | Correo | Contraseña |
|-------------------|--------|------------|
| Operador Sistema | `operador@demo.pilates.mx` | `demo-root-99` |

### Administración (recomendado para explorar el estudio)

| Nombre | Correo | Contraseña | Teléfono demo |
|--------|--------|------------|---------------|
| Ricardo Méndez | `ricardo.mendez@demo.pilates.mx` | `demo-admin-99` | 5588001101 |
| Patricia Núñez | `patricia.nunez@demo.pilates.mx` | `demo-admin-99` | 5588001102 |

### Coaches (vista de instructora)

| Nombre | Correo | Contraseña | Teléfono demo |
|--------|--------|------------|---------------|
| Elena Morales | `elena.morales@demo.pilates.mx` | `demo-coach-99` | 5588002201 |
| Lucía Paredes | `lucia.paredes@demo.pilates.mx` | `demo-coach-99` | 5588002202 |

### Alumnas (clientas — todas usan la misma contraseña)

| Nombre | Correo | ID en sistema | Contraseña |
|--------|--------|---------------|------------|
| Irene Salazar | `irene.salazar@demo.pilates.mx` | **ST1001** | `demo-alumno-99` |
| Beatriz Montiel | `beatriz.montiel@demo.pilates.mx` | **ST1002** | `demo-alumno-99` |
| Luciana Fajardo | `luciana.fajardo@demo.pilates.mx` | **ST1003** | `demo-alumno-99` |
| Greta Ibáñez | `greta.ibanez@demo.pilates.mx` | **ST1004** | `demo-alumno-99` |
| Helena Duarte | `helena.duarte@demo.pilates.mx` | **ST1005** | `demo-alumno-99` |
| Rebeca Toscano | `rebeca.toscano@demo.pilates.mx` | **ST1006** | `demo-alumno-99` |
| Alma Delgado | `alma.delgado@demo.pilates.mx` | **ST1007** | `demo-alumno-99` |
| Jimena Solís | `jimena.solis@demo.pilates.mx` | **ST1008** | `demo-alumno-99` |

> Prefijo de folios: **ST** (ej. ST1001). **Greta (ST1004)** tiene plan **Total Pass** (membresía ilimitada de demo).

---

## Configuración del estudio (seed)

| Campo | Valor demo |
|-------|------------|
| Nombre | Pilates Studio |
| Color de marca | `#1b2d6e` |
| Aforo máximo por clase | 8 |
| Horas para cancelar | 12 |
| Alerta última clase | 2 clases restantes |
| Alerta vencimiento | 3 días antes |

---

## Planes cargados en la demo

| Plan | Tipo | Clases | Precio (MXN) |
|------|------|--------|--------------|
| Clase de Apertura | Paquete | 1 | $0 |
| Clase Descubre | Paquete | 1 | $270 |
| Inicia tu camino | Paquete | 4 | $950 |
| Conecta y Fortalece | Paquete | 8 | $1,600 |
| Activa tu grandeza interior | Paquete | 12 | $2,000 |
| Reinventa tu ser | Paquete | 20 | $2,700 |
| Total Pass | Ilimitado | — | $0 (demo) |
| Clase Privada | Add-on | 1 | $500 |

---

## Suscripciones de ejemplo (alumnas)

| Alumna | ID | Plan activo | Notas demo |
|--------|-----|-------------|------------|
| Irene Salazar | ST1001 | Conecta y Fortalece | 6 clases restantes |
| Beatriz Montiel | ST1002 | Inicia tu camino | 3 clases restantes |
| Luciana Fajardo | ST1003 | Activa tu grandeza interior | 10% descuento demo |
| Greta Ibáñez | ST1004 | Total Pass | Ilimitado |
| Helena Duarte | ST1005 | Clase Descubre | 0 clases (paquete agotado) |
| Rebeca Toscano | ST1006 | Reinventa tu ser | 18 clases restantes |
| Alma Delgado | ST1007 | Conecta (cancelada) | Membresía cancelada + devolución demo |
| Jimena Solís | ST1008 | Clase Descubre | Plan vencido (alertas de vencimiento) |

---

## Horarios de clase (seed)

Coaches en turnos: **Elena Morales** y **Lucía Paredes**. Clase: **Pilates Reformer**, capacidad **8**.

| Día | Hora | Instructora |
|-----|------|-------------|
| Lunes | 07:00–08:00 | Elena Morales |
| Lunes | 19:00–20:00 | Lucía Paredes |
| Martes | 07:00–08:00 | Elena Morales |
| Martes | 13:00–14:00 | Lucía Paredes |
| Miércoles | 10:00–11:00 | Elena Morales |
| Jueves | 17:00–18:00 | Lucía Paredes |
| Viernes | 19:00–20:00 | Lucía Paredes |
| Sábado | 08:00–09:00 | Elena + Lucía (dual) |

**Reformers:** 8 máquinas activas (Reformer 1–8; la 3 tiene nota de mantenimiento reciente).

---

## Reservas, pagos y extras de demo

- **7 reservas** de ejemplo (asistidas, no asistidas, canceladas y una futura).
- **Pagos:** inscripciones por transferencia/efectivo; Total Pass pendiente; dos egresos (limpieza −$500, DHL −$370).
- **Ventas:** calcetas antiderrapantes, clase privada 1:1.
- **Devolución:** Alma Delgado — 2 clases reembolsadas ($400).
- **Nómina coaches:** Elena pagada; Lucía pendiente (mayo 2026).
- **KPIs:** snapshots Enero–Marzo 2026.
- **Eventos:** taller movilidad de cadera; cumpleaños Irene Salazar.
- **Notificaciones:** plan por vencer (Helena), cumpleaños (Luciana), última clase (Helena).

---

## Qué pueden probar por rol

### Con **admin** (`ricardo.mendez@demo.pilates.mx` o `patricia.nunez@demo.pilates.mx`)

| Sección del menú | Qué verán |
|------------------|-----------|
| **Dashboard** | Resumen, métricas y gráfica de reservas |
| **Usuarios** | Lista con IDs ST1001…ST1008 y detalle por alumna |
| **Clases** | Horarios y tipos (Reformer) |
| **Reservas** | Citas de la semana de demostración |
| **Pagos** | Cobros y egresos de ejemplo |
| **Suscripciones** | Membresías ligadas a las alumnas del seed |
| **Planes** | Tabla de planes de la sección anterior |
| **Coaches** | Elena y Lucía |
| **Calendario** | Vista de calendario (FullCalendar) |
| **Reportes** | Métricas y aforo |
| **Devoluciones** | Devolución de Alma Delgado |
| **Histórico** | Actividad pasada |
| **Configuración** | Nombre **Pilates Studio**, capacidad, políticas |

### Con **root** (`operador@demo.pilates.mx`)

Mismo menú que administración, con permisos de operador del sistema.

### Con **coach** (`elena.morales@demo.pilates.mx` o `lucia.paredes@demo.pilates.mx`)

- **Dashboard**
- **Mi Horario**
- **Reservas**
- **Calendario**
- **Asistencia**
- **Histórico**

### Con **alumna** (por ejemplo `irene.salazar@demo.pilates.mx`)

Experiencia de clienta: perfil, reservas y plan **Conecta y Fortalece** asignado en la demo.

---

## Landing Appstract (`/`)

Fuera del login, el landing de producto incluye:

- Hero con **Continuar configuración** y **horario semanal** (grilla Lun–Sáb, burbuja inscritos/aforo).
- Planes **Studio 57** (Equilibrio / Vitalidad) — solo presentación, no conectados al seed.
- Sección **Horarios** (bloques matutino / vespertino).
- Sección **Agenda** (reserva rápida por bloques).
- Cobros, membresías y contacto de demostración.

---

## Sobre los nombres y los datos

- **Ricardo, Patricia, Elena, Lucía, Irene, Beatriz…** son personas **inventadas** para la demo.
- **Planes y precios** del seed son datos de demo; el landing muestra la vitrina **Studio 57** como ejemplo de producto Appstract.
- Los códigos **ST1001–ST1008** muestran cómo se verán los folios cuando el estudio use datos reales.

---

## Si algo no funciona

- Verifiquen el correo **tal cual** (minúsculas, dominio `@demo.pilates.mx`).
- Sin seed no hay usuarios: ejecuten `npm run db:pg:seed` (PostgreSQL) o `npm run db:push:local` (SQLite local con `DB_DRIVER=sqlite`).
- Prueben otra pestaña o **Cerrar sesión** antes de cambiar de rol.
- Conexión PostgreSQL: `npm run db:pg:check` y revisar `.env.local` (ver `docs/DATABASE.md`).

---

*Documento generado para la demo @appstract/pilates-reformer. Datos alineados con `scripts/postgres-manual/03-seed-fake.sql`.*
