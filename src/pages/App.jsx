import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  Baby,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Facebook,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Microscope,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteContext } from "../siteContext.jsx";
import { chambers } from "../data/chambers.js";
import { createAppointment } from "../lib/api.js";
import { getEarliestBookableDate, isSameDayBookingClosed } from "../lib/booking.js";
import { parseVideoUrl } from "../lib/video.js";

const SPECIALIST_ICONS = [HeartPulse, Baby, Microscope, Leaf];

function SpecialistSlider({ items = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [items.length]);

  const Icon = SPECIALIST_ICONS[current % SPECIALIST_ICONS.length];
  const label = items[current] || "";

  if (!items.length) return null;

  return (
    <div className="absolute bottom-24 left-[2%] z-20 w-[220px] rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur xl:left-[5%]">
      <p className="text-xs font-extrabold uppercase tracking-wide text-clinic">Specialist Care</p>
      <div className="mt-3 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-2.5"
          >
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fbf0f4] text-clinic">
              <Icon size={14} />
            </span>
            <p className="text-sm font-semibold leading-5 text-slate-700">{label}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-clinic" : "w-1.5 bg-slate-300"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const leftNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Service", href: "/#services" },
  { label: "Gallery", href: "/gallery" }
];
const rightNavItems = [
  { label: "Experience", href: "/#experience" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
];
const mobileNavItems = [...leftNavItems, ...rightNavItems];

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (item) => {
    if (item.href === "/") return pathname === "/";
    return pathname === item.href;
  };

  return (
    <header className="fixed left-0 right-0 top-7 z-50 px-4">
      <nav className="glass-nav mx-auto flex h-[70px] max-w-[1320px] items-center justify-between rounded-full px-2.5 text-[12px] text-white shadow-soft">
        <div className="hidden flex-1 items-center gap-2 md:flex">
          {leftNavItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`rounded-full px-7 py-3.5 font-semibold transition ${
                isActive(item) ? "bg-clinic text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.24)]" : "text-white/90 hover:bg-white/10"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
        <a href="/" className="flex items-center gap-2 rounded-full px-3 py-2 text-[18px] font-extrabold tracking-normal">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-clinic text-white">
            <Sparkles size={17} fill="currentColor" />
          </span>
          DRFARHIN
        </a>
        <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
          {rightNavItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`rounded-full px-6 py-3.5 font-semibold transition ${
                isActive(item) ? "bg-clinic text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.24)]" : "text-white/90 hover:bg-white/10"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-full bg-white/10 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-slate-200 bg-white p-3 shadow-soft md:hidden">
          {mobileNavItems.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-semibold text-slate-700">
              {item.label}
            </a>
          ))}
          <Link to="/admin" className="block rounded-2xl bg-ink px-4 py-3 font-semibold text-white">
            Admin Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};

  return (
    <section id="home" className="relative overflow-hidden bg-[#fbf0f4] pb-0 pt-0">
      <div className="relative min-h-[780px] w-full overflow-hidden bg-white shadow-[0_30px_120px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(241,141,177,0.22),transparent_34%),radial-gradient(circle_at_12%_72%,rgba(180,153,172,0.18),transparent_30%)]" />
        <div className="relative z-20 mx-auto grid max-w-[1440px] gap-12 px-6 pb-12 pt-32 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-14 lg:pt-34 xl:px-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="pb-4">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DDB3C9]/60 bg-white px-4 py-2 text-sm font-bold text-[#7b6074] shadow-sm">
              <HeartPulse size={17} />
              {home.heroBadge || "FCPS Obs & Gyn | FCPS Reproductive Endocrinology & Infertility"}
            </div>
            <h1 className="max-w-3xl text-[36px] font-extrabold leading-[1.08] tracking-normal text-ink sm:text-[48px] lg:text-[56px] xl:text-[62px]">
              {home.heroHeading || "Fertility, pregnancy & women's health care by"}{" "}
              <span className="text-clinic">{content.profile.name}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">{content.profile.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#appointment" className="inline-flex items-center justify-center gap-2 rounded-full bg-clinic px-7 py-4 font-extrabold text-white shadow-[0_18px_45px_rgba(180,153,172,0.32)] transition hover:-translate-y-0.5">
                Book Appointment <ArrowUpRight size={18} />
              </a>
              <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 font-extrabold text-ink transition hover:bg-slate-50">
                View Services
              </a>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
              {content.stats.map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-extrabold text-ink">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative min-h-[560px] lg:min-h-[620px]">
            <div className="absolute left-1/2 top-14 h-[500px] w-[500px] -translate-x-1/2 rounded-[44%_56%_46%_54%/50%_44%_56%_50%] bg-clinic shadow-[0_30px_90px_rgba(180,153,172,0.22)] xl:h-[560px] xl:w-[560px]" />
            <div className="absolute left-1/2 top-8 h-[500px] w-[365px] -translate-x-1/2 rounded-[46%_54%_42%_58%/38%_38%_62%_62%] bg-blush xl:h-[560px] xl:w-[405px]" />
            <div className="absolute bottom-8 left-1/2 z-10 h-[555px] w-[430px] -translate-x-1/2 overflow-visible xl:h-[620px] xl:w-[470px]">
              <div className="absolute bottom-0 left-1/2 h-16 w-72 -translate-x-1/2 rounded-full bg-[#7b6074]/18 blur-xl" />
              <img
                src={content.profile.heroImage}
                alt={content.profile.name}
                className="absolute bottom-0 left-1/2 max-h-[555px] w-auto max-w-none -translate-x-1/2 object-contain drop-shadow-[0_24px_34px_rgba(17,24,39,0.18)] xl:max-h-[620px]"
              />
            </div>
            <div className="absolute right-[2%] top-28 z-20 rounded-[24px] border border-white/70 bg-white/90 p-5 text-center shadow-soft backdrop-blur xl:right-[5%]">
              <div className="mb-2 flex justify-center gap-1 text-accent">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-3xl font-extrabold text-ink">{home.experienceYears || "19+"} Years</p>
              <p className="text-sm font-bold text-slate-500">{home.experienceLabel || "Clinical Experience"}</p>
            </div>
            <SpecialistSlider items={home.specialistItems || []} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AppointmentForm() {
  const { content, setAppointments } = useContext(SiteContext);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [minDate, setMinDate] = useState(getEarliestBookableDate());
  const [form, setForm] = useState({
    name: "",
    phone: "",
    chamber: chambers[0].shortName,
    service: content.services[0] || "",
    date: getEarliestBookableDate(),
    message: ""
  });

  useEffect(() => {
    if (!form.service && content.services[0]) {
      setForm((current) => ({ ...current, service: content.services[0] }));
    }
  }, [content.services]);

  async function submit(e) {
    e.preventDefault();
    const earliest = getEarliestBookableDate();
    setMinDate(earliest);
    if (form.date < earliest) {
      setNotice(
        isSameDayBookingClosed()
          ? "Same-day booking closes at 5:00 PM. Please choose tomorrow's date or later."
          : "Please choose a valid appointment date."
      );
      setForm((current) => ({ ...current, date: earliest }));
      return;
    }

    const payload = { ...form, status: "Pending" };
    setSaving(true);
    setNotice("");

    try {
      const saved = await createAppointment(payload);
      setAppointments((items) => [saved || payload, ...items]);
      setNotice("Appointment request sent successfully.");
      setForm({ name: "", phone: "", chamber: chambers[0].shortName, service: content.services[0] || "", date: getEarliestBookableDate(), message: "" });
    } catch (error) {
      setNotice(error.message || "Request failed. Please check the live backend connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="appointment" className="bg-[#f8fbfb] py-20">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative overflow-hidden rounded-[32px] bg-ink p-8 text-white shadow-soft">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-clinic/25" />
          <div className="relative">
            <CalendarCheck className="mb-5 text-clinic" size={38} />
            <p className="text-sm font-bold uppercase tracking-wide text-clinic">Appointment Booking</p>
            <h2 className="mt-2 text-4xl font-extrabold">Choose your chamber</h2>
            <p className="mt-4 leading-7 text-white/70">
              Mam currently sees patients at two locations. Choose the preferred chamber and call the listed appointment number for confirmation.
            </p>
            <div className="mt-8 space-y-4">
              {chambers.map((chamber, index) => (
                <div key={chamber.shortName} className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white p-1.5">
                      <img src={chamber.logo} alt={`${chamber.shortName} logo`} className="h-full w-full object-contain" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-clinic">Chamber {index + 1}</p>
                      <p className="font-extrabold leading-5">{chamber.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm leading-6 text-white/75">
                    <p className="flex gap-2"><MapPin size={17} className="mt-1 shrink-0 text-clinic" /> {chamber.address}</p>
                    <p className="flex gap-2"><Clock3 size={17} className="mt-1 shrink-0 text-clinic" /> সময়: {chamber.schedule}</p>
                    <p className="flex gap-2"><Phone size={17} className="mt-1 shrink-0 text-clinic" /> কল/এপয়েনমেন্ট: {chamber.appointment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-soft md:p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            {["Fertility", "Pregnancy", "Gynecology"].map((item) => (
              <span key={item} className="rounded-full bg-mint px-4 py-2 text-sm font-extrabold text-[#7b6074]">{item}</span>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="admin-input h-16" placeholder="Patient name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="admin-input h-16" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <select className="admin-input h-16 md:col-span-2" value={form.chamber} onChange={(e) => setForm({ ...form, chamber: e.target.value })}>
              {chambers.map((chamber) => <option key={chamber.shortName}>{chamber.shortName}</option>)}
            </select>
            <select className="admin-input h-16" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              {content.services.map((service) => <option key={service}>{service}</option>)}
            </select>
            <div>
              <input className="admin-input h-16 w-full" type="date" min={minDate} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <p className="mt-2 text-xs font-semibold text-slate-500">Same-day booking closes at 5:00 PM. After that, the earliest date is tomorrow.</p>
            </div>
            <textarea className="admin-input min-h-28 md:col-span-2" placeholder="Short note, concern, or preferred time" value={form.message || ""} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-clinic px-6 py-4 font-extrabold text-white shadow-[0_18px_45px_rgba(180,153,172,0.26)] disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? "Sending..." : "Request Appointment"} <ArrowUpRight size={18} />
          </button>
          {notice && <p className="mt-3 rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{notice}</p>}
        </form>
      </div>
    </section>
  );
}

function ReelCard({ reel }) {
  const [playing, setPlaying] = useState(false);
  const parsed = parseVideoUrl(reel.videoUrl);
  const poster = reel.thumbnail || parsed?.thumbnail;
  const canPreview = playing && parsed?.previewEmbedUrl;
  const staticPreview = !poster && !canPreview && parsed?.staticEmbedUrl;

  return (
    <div
      className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[24px] bg-ink shadow-soft"
      onMouseEnter={() => setPlaying(true)}
      onMouseLeave={() => setPlaying(false)}
      onClick={() => setPlaying((current) => !current)}
    >
      {canPreview ? (
        <iframe
          src={parsed.previewEmbedUrl}
          title={reel.title || "Reel"}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media"
          frameBorder="0"
        />
      ) : (
        <>
          {poster && <img src={poster} alt={reel.title || "Reel"} className="absolute inset-0 h-full w-full object-cover" />}
          {staticPreview && (
            <iframe
              src={parsed.staticEmbedUrl}
              title={reel.title || "Reel"}
              className="pointer-events-none absolute inset-0 h-full w-full"
              allow="encrypted-media"
              frameBorder="0"
              tabIndex={-1}
            />
          )}
          {!poster && !staticPreview && <div className="absolute inset-0 bg-gradient-to-br from-ink to-clinic/50" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-clinic shadow-soft transition group-hover:scale-110">
              <Play size={22} fill="currentColor" />
            </span>
          </div>
        </>
      )}
      {!canPreview && reel.title && (
        <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-extrabold leading-5 text-white drop-shadow">{reel.title}</p>
      )}
    </div>
  );
}

function ReelsSection() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  const reels = content.reels || [];

  if (!reels.length) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-14 xl:px-20">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-bold uppercase tracking-wide text-clinic">{home.reelsEyebrow || "Short Health Tips"}</p>
            <h2 className="mt-2 max-w-3xl text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              {home.reelsTitle || "Quick advice from Mam, one reel at a time"}
            </h2>
          </div>
          <p className="max-w-md leading-7 text-slate-600">
            {home.reelsSubtitle || "Bite-sized guidance on fertility, pregnancy and women's health. Hover or tap a card to watch."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {reels.map((reel) => (
            <ReelCard key={reel._id || reel.videoUrl} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CareMoments() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  const featured = content.moments.slice(0, 5);

  if (!featured.length) return null;

  return (
    <section className="bg-[#fbf0f4] py-20">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-14 xl:px-20">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-bold uppercase tracking-wide text-clinic">{home.careMomentsEyebrow || "Care Moments"}</p>
            <h2 className="mt-2 max-w-3xl text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              {home.careMomentsTitle || "Real warmth from pregnancy, delivery and family care journeys"}
            </h2>
          </div>
          <p className="max-w-md leading-7 text-slate-600">
            {home.careMomentsSubtitle || "A visual glimpse of the trust, comfort and continuity patients experience throughout consultation, treatment and follow-up."}
          </p>
        </div>

        <div className="grid auto-rows-[230px] gap-4 md:grid-cols-4 md:auto-rows-[260px]">
          <article className="group relative overflow-hidden rounded-[30px] bg-white shadow-soft md:col-span-2 md:row-span-2">
            <img src={featured[0].image} alt={featured[0].title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-wide text-blush">Mother & newborn care</p>
              <h3 className="mt-2 text-2xl font-extrabold">{featured[0].title}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/80">{featured[0].caption}</p>
            </div>
          </article>

          {featured.slice(1).map((item) => (
            <article key={item.image} className="group relative overflow-hidden rounded-[28px] bg-white shadow-sm">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <h3 className="text-lg font-extrabold">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/80">{item.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyHighlights() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  const items = content.home?.journeyItems || [
    "Fertility evaluation and counseling",
    "Pregnancy and delivery planning",
    "PCOS, endometriosis and menstrual care",
    "Post-treatment and family follow-up"
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:px-14 xl:px-20">
        <div className="grid grid-cols-2 gap-4">
          {content.moments.slice(5, 9).map((item, index) => (
            <img
              key={item.image}
              src={item.image}
              alt={item.title}
              className={`h-72 w-full rounded-[28px] object-cover shadow-sm ${index % 2 ? "mt-8" : ""}`}
            />
          ))}
        </div>
        <div className="flex flex-col justify-center">
          <p className="font-bold uppercase tracking-wide text-clinic">{home.journeyEyebrow || "Why Patients Trust Her"}</p>
          <h2 className="mt-2 text-4xl font-extrabold leading-tight text-ink md:text-5xl">
            {home.journeyTitle || "A calm, experienced doctor for sensitive women's health decisions"}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {home.journeyBody || "From infertility diagnosis to pregnancy care, every patient needs clarity, privacy and steady guidance. The experience is organized around careful listening, evidence-based decisions and ongoing communication."}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#fbf0f4] p-4 font-bold text-slate-700">
                <HeartHandshake size={20} className="text-clinic" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomHomeSections() {
  const { content } = useContext(SiteContext);
  const sections = (content.home?.customSections || []).filter((section) => section.enabled !== false);

  if (!sections.length) return null;

  return (
    <>
      {sections.map((section, index) => {
        const items = section.items || [];
        const hasImage = Boolean(section.image);
        const isImageText = section.type === "imageText" || (section.type === "banner" && hasImage);

        return (
          <section key={`${section.title}-${index}`} className={index % 2 ? "bg-white py-20" : "bg-[#fff8fb] py-20"}>
            <div className={`mx-auto grid max-w-[1320px] gap-8 px-4 lg:px-14 xl:px-20 ${isImageText ? "lg:grid-cols-[0.92fr_1.08fr] lg:items-center" : ""}`}>
              {isImageText && (
                <img
                  src={section.image}
                  alt={section.title || "Homepage section"}
                  className="h-[420px] w-full rounded-[32px] object-cover shadow-soft"
                />
              )}
              <div>
                {section.eyebrow && <p className="font-bold uppercase tracking-wide text-clinic">{section.eyebrow}</p>}
                {section.title && <h2 className="mt-2 max-w-4xl text-4xl font-extrabold leading-tight text-ink md:text-5xl">{section.title}</h2>}
                {section.body && <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{section.body}</p>}
                {items.length > 0 && (
                  <div className={`mt-8 grid gap-4 ${section.type === "cards" ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
                    {items.map((item) => (
                      <div key={item} className="rounded-[24px] border border-slate-100 bg-white p-5 font-bold leading-7 text-slate-700 shadow-sm">
                        <CheckCircle2 className="mb-4 text-clinic" size={22} />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {section.ctaLabel && section.ctaHref && (
                  <a href={section.ctaHref} className="mt-8 inline-flex items-center gap-2 rounded-full bg-clinic px-7 py-4 font-extrabold text-white shadow-[0_18px_45px_rgba(180,153,172,0.24)]">
                    {section.ctaLabel} <ArrowUpRight size={18} />
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

function Services() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  return (
    <section id="services" className="section-pad">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold uppercase tracking-wide text-clinic">{home.servicesEyebrow || "Services"}</p>
            <h2 className="mt-2 text-4xl font-extrabold text-ink">{home.servicesTitle || "Specialized care for fertility, pregnancy and women's health"}</h2>
          </div>
          <p className="max-w-md text-slate-600">{home.servicesSubtitle || "Every care plan is explained clearly, with diagnostic guidance, treatment options and follow-up built into the patient journey."}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {content.services.map((service) => (
            <div key={service} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <CheckCircle2 className="text-clinic" />
              <h3 className="mt-5 text-xl font-extrabold">{service}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">Specialist consultation, diagnosis, treatment planning and follow-up for reproductive and gynecological care.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const { content } = useContext(SiteContext);
  const aboutItems = content.home?.aboutItems || ["Infertility & ART care", "Obs & Gyn procedures", "Laparoscopy & hysteroscopy", "PCOS and endometriosis care"];
  return (
    <section id="about" className="bg-pearl section-pad">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
        <img src={content.profile.portraitImage} alt={content.profile.name} className="h-full min-h-[420px] w-full rounded-[32px] object-cover shadow-soft" />
        <div className="flex flex-col justify-center">
          <p className="font-bold uppercase tracking-wide text-clinic">{content.home?.aboutEyebrow || "About Doctor"}</p>
          <h2 className="mt-2 text-4xl font-extrabold text-ink">{content.profile.title}</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">{content.profile.intro}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {aboutItems.map((item) => (
              <p key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold text-slate-700">
                <ShieldCheck size={20} className="text-clinic" /> {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Credentials() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  const portfolio = content.portfolio || {};
  const education = portfolio.education || [];
  const professionalExperience = portfolio.experience || [];
  const specialistTraining = portfolio.specialistTraining || [];
  const clinicalSkills = portfolio.clinicalSkills || [];
  const researchHighlights = portfolio.research || [];

  if (!education.length && !professionalExperience.length && !specialistTraining.length && !clinicalSkills.length && !researchHighlights.length) {
    return null;
  }

  return (
    <section id="experience" className="bg-white py-20">
      <div className="mx-auto max-w-[1320px] px-4 lg:px-14 xl:px-20">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-bold uppercase tracking-wide text-clinic">{home.portfolioEyebrow || "Portfolio"}</p>
            <h2 className="mt-2 text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              {home.portfolioTitle || "Education, experience and specialist training"}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            {home.portfolioSubtitle || "A CV-based overview of Dr. Farhin's academic background, government service, private consultancy and fertility-focused clinical work."}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] bg-[#fff8fb] p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-clinic text-white">
                <GraduationCap size={23} />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-clinic">Education</p>
                <h3 className="text-2xl font-extrabold">Academic qualifications</h3>
              </div>
            </div>
            <div className="space-y-4">
              {education.map((item) => (
                <article key={`${item.degree}-${item.meta}`} className="rounded-[24px] border border-petal/70 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-extrabold text-ink">{item.degree}</h4>
                      <p className="mt-1 font-bold text-[#7b6074]">{item.meta}</p>
                    </div>
                    <span className="rounded-full bg-[#fbf0f4] px-3 py-1 text-xs font-extrabold text-clinic">{item.year}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.institute}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-ink p-6 text-white shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-clinic text-white">
                <BriefcaseBusiness size={22} />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-clinic">Professional Experience</p>
                <h3 className="text-2xl font-extrabold">Clinical career timeline</h3>
              </div>
            </div>
            <div className="space-y-3">
              {professionalExperience.map((item) => (
                <article key={`${item.role}-${item.period}`} className="rounded-[22px] border border-white/10 bg-white/[0.07] p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-lg font-extrabold">{item.role}</h4>
                      <p className="mt-1 text-sm leading-6 text-white/70">{item.place}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-blush">{item.period}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <Award className="text-clinic" />
            <h3 className="mt-4 text-2xl font-extrabold">Specialist Training</h3>
            <div className="mt-5 space-y-3">
              {specialistTraining.map((item) => (
                <p key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-clinic" /> {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-slate-100 bg-[#fff8fb] p-6 shadow-sm">
            <HeartPulse className="text-clinic" />
            <h3 className="mt-4 text-2xl font-extrabold">Clinical Skills</h3>
            <div className="mt-5 space-y-3">
              {clinicalSkills.map((item) => (
                <p key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-clinic" /> {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <Sparkles className="text-clinic" />
            <h3 className="mt-4 text-2xl font-extrabold">Research & Achievements</h3>
            <div className="mt-5 space-y-3">
              {researchHighlights.map((item) => (
                <p key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-clinic" /> {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VideosAndBlog() {
  const { content } = useContext(SiteContext);
  return (
    <>
      <section id="videos" className="section-pad">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-bold uppercase tracking-wide text-clinic">Videos</p>
          <h2 className="mt-2 text-4xl font-extrabold text-ink">Patient education & reviews</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {content.videos.map((video) => (
              <div key={video.title} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="aspect-video bg-slate-100">
                  <iframe className="h-full w-full" src={video.url} title={video.title} loading="lazy" allowFullScreen />
                </div>
                <h3 className="p-5 text-lg font-extrabold">{video.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="blog" className="bg-pearl section-pad">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-bold uppercase tracking-wide text-clinic">Blog</p>
          <h2 className="mt-2 text-4xl font-extrabold text-ink">Doctor&apos;s notes</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {content.blogs.map((post) => (
              <article key={post.title} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-bold text-clinic">{post.date}</p>
                <h3 className="mt-3 text-2xl font-extrabold">{post.title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Contact() {
  const { content } = useContext(SiteContext);
  return (
    <footer id="contact" className="bg-ink py-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-3xl font-extrabold">{content.profile.name}</h2>
          <p className="mt-3 max-w-xl text-white/65">{content.profile.title}</p>
        </div>
        <div className="space-y-3 text-sm text-white/75">
          <p className="flex items-center gap-3"><Phone size={18} className="text-clinic" /> {content.profile.phone}</p>
          <p className="flex items-center gap-3"><Mail size={18} className="text-clinic" /> {content.profile.email}</p>
          <p className="flex items-center gap-3"><Facebook size={18} className="text-clinic" /> Facebook / Dr. Farhin</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Hero />
      <CustomHomeSections />
      <AppointmentForm />
      <ReelsSection />
      <CareMoments />
      <Services />
      <JourneyHighlights />
      <About />
      <Credentials />
      <VideosAndBlog />
      <Contact />
    </>
  );
}
