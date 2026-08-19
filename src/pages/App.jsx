import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import {
  ArrowUpRight,
  Award,
  Baby,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Facebook,
  Instagram,
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
import {
  createAppointmentEventId,
  trackAppointmentFormView,
  trackChamberSelection,
  trackAppointmentSuccess
} from "../lib/facebookPixel.js";
import {
  getEarliestBookableDate,
  getNextAvailableDate,
  isDateAvailableForChamber,
  isSameDayBookingClosed
} from "../lib/booking.js";
import { parseVideoUrl } from "../lib/video.js";

const SPECIALIST_ICONS = [HeartPulse, Baby, Microscope, Leaf];
const APPOINTMENT_COPY = {
  en: {
    appointmentBooking: "Appointment Booking",
    chooseChamber: "Choose your chamber",
    chamberIntro: "Mam currently sees patients at two locations. The chamber selection is inside the form.",
    time: "Time",
    callAppointment: "Call/appointment",
    requestAppointment: "Request appointment",
    patientDetails: "Patient details",
    formIntro: "Choose a chamber, enter patient information, and submit the request.",
    selectChamber: "Select chamber",
    selectChamberHelp: "Tap one chamber for this appointment.",
    patientInformation: "Patient information",
    patientHelp: "Required fields are kept short for fast booking.",
    patientName: "Patient name",
    patientNamePlaceholder: "Enter patient name",
    phoneNumber: "Phone number",
    age: "Age",
    agePlaceholder: "Patient age",
    treatmentType: "Treatment type",
    selectTreatment: "Select treatment",
    appointmentDate: "Appointment date",
    pick: "Pick",
    availableSlot: "Available slot",
    noteLabel: "Patient's problem",
    notePlaceholder: "Write the patient's problem",
    serialHelp: "A serial number will appear after successful request.",
    sending: "Sending...",
    submit: "Request Appointment",
    successTitle: "Appointment request sent successfully.",
    successSerial: "Your serial number is",
    successHelp: "We will contact the patient number soon for confirmation.",
    close: "Close",
    selected: "Selected",
    invalidDate: "Please choose an available appointment date for the selected chamber.",
    sameDayClosed: "Same-day booking is closed for this chamber. Please choose the next available date.",
    requestFailed: "Request failed. Please check the live backend connection.",
    scheduleNote: "Calendar only shows available chamber days.",
    dayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dateLocale: "en-GB"
  }
};

function parseDateValue(value) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  return new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1);
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatReadableDate(value, locale = "en-GB") {
  if (!value) return "Select date";
  const date = parseDateValue(value);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

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

function SitePreloader() {
  const { content, loaded } = useContext(SiteContext);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-center bg-[#fff8fb]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="relative mx-auto max-w-3xl px-5 text-center">
            <motion.div
              className="absolute -left-2 top-10 hidden h-16 w-16 place-items-center rounded-full bg-white text-[#5B2B6D] shadow-soft md:grid"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Baby size={30} />
            </motion.div>
            <motion.div
              className="absolute -right-2 top-20 hidden h-16 w-16 place-items-center rounded-full bg-white text-clinic shadow-soft md:grid"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeartPulse size={30} />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 left-16 hidden h-14 w-14 place-items-center rounded-full bg-white text-[#7b6074] shadow-soft md:grid"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Microscope size={25} />
            </motion.div>
            <motion.div
              className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#5B2B6D] text-white shadow-soft"
              animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={34} fill="currentColor" />
            </motion.div>
            <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-clinic">Fertility . Gynecology . Baby Care</p>
            <h1 className="signature-script mt-4 text-[44px] font-normal leading-none tracking-normal text-[#5B2B6D] md:text-[76px]">
              {content.profile?.name || "Dr. Kazi Khadeza Farhin"}
            </h1>
            <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-2">
              {["Infertility Care", "IVF & IUI", "PCOS", "Pregnancy Care"].map((item) => (
                <span key={item} className="rounded-full bg-white/85 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#5B2B6D] shadow-sm">
                  {item}
                </span>
              ))}
            </div>
            <div className="mx-auto mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-white">
              <motion.div
                className="h-full rounded-full bg-[#5B2B6D]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (item) => {
    if (item.href === "/") return pathname === "/";
    return pathname === item.href;
  };

  return (
    <>
      <SitePreloader />
      <header className="fixed left-0 right-0 top-7 z-50 px-4">
        <nav className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between rounded-full border border-white/20 bg-[#5B2B6D] px-2.5 text-[12px] text-white shadow-soft">
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
          DR. KAZI KHADEZA FARHIN
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
          <a href="/appointment" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3.5 font-semibold text-[#5B2B6D] shadow-sm transition hover:-translate-y-0.5 hover:bg-white/95">
            Book Appointment
          </a>
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
          <a href="/appointment" onClick={() => setOpen(false)} className="mt-1 block rounded-2xl bg-[#5B2B6D] px-4 py-3 font-semibold text-white">
            Book Appointment
          </a>
          <Link to="/admin" className="mt-1 block rounded-2xl bg-ink px-4 py-3 font-semibold text-white">
            Admin Dashboard
          </Link>
          </div>
        )}
      </header>
    </>
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
              <a href="/appointment" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5B2B6D] px-7 py-4 font-extrabold text-white shadow-[0_18px_45px_rgba(91,43,109,0.32)] transition hover:-translate-y-0.5">
                Book Appointment <ArrowUpRight size={18} />
              </a>
              <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 font-extrabold text-[#5B2B6D] transition hover:bg-slate-50">
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

export function AppointmentForm() {
  const { content, setAppointments } = useContext(SiteContext);
  const location = useLocation();
  const defaultChamber = chambers[0];
  const defaultDate = getNextAvailableDate(defaultChamber);
  const submitInFlightRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [successAppointment, setSuccessAppointment] = useState(null);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [minDate, setMinDate] = useState(defaultDate);
  const serviceOptions = useMemo(
    () => [
      ...new Set([
        "Gynecological Treatment",
        "Infertility Treatment",
        ...(content.services || [])
      ].filter(Boolean))
    ],
    [content.services]
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    chamber: defaultChamber.shortName,
    service: serviceOptions[0] || "",
    date: defaultDate,
    message: "",
    language: "en"
  });
  const selectedChamber = useMemo(
    () => chambers.find((chamber) => chamber.shortName === form.chamber) || defaultChamber,
    [defaultChamber, form.chamber]
  );
  const copy = APPOINTMENT_COPY.en;
  const [calendarMonth, setCalendarMonth] = useState(() => parseDateValue(form.date));
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(copy.dateLocale, { month: "long", year: "numeric" }).format(calendarMonth),
    [calendarMonth, copy.dateLocale]
  );

  useEffect(() => {
    trackAppointmentFormView();
  }, []);

  useEffect(() => {
    if (!form.service && serviceOptions[0]) {
      setForm((current) => ({ ...current, service: serviceOptions[0] }));
    }
  }, [form.service, serviceOptions]);

  useEffect(() => {
    const earliest = getEarliestBookableDate(selectedChamber);
    const nextAvailableDate = getNextAvailableDate(selectedChamber, earliest);
    setMinDate(nextAvailableDate);

    if (!form.date || form.date < nextAvailableDate || !isDateAvailableForChamber(form.date, selectedChamber)) {
      setForm((current) => ({ ...current, date: nextAvailableDate }));
      setCalendarMonth(parseDateValue(nextAvailableDate));
    }
  }, [form.date, selectedChamber]);

  async function submit(e) {
    e.preventDefault();
    if (submitInFlightRef.current) return;

    const earliest = getEarliestBookableDate(selectedChamber);
    const nextAvailableDate = getNextAvailableDate(selectedChamber, earliest);
    setMinDate(nextAvailableDate);
    if (form.date < nextAvailableDate || !isDateAvailableForChamber(form.date, selectedChamber)) {
      setNotice(
        isSameDayBookingClosed(selectedChamber)
          ? copy.sameDayClosed
          : copy.invalidDate
      );
      setForm((current) => ({ ...current, date: nextAvailableDate }));
      setCalendarMonth(parseDateValue(nextAvailableDate));
      return;
    }

    const payload = { ...form, status: "Pending" };
    setSaving(true);
    setNotice("");
    submitInFlightRef.current = true;

    try {
      const saved = await createAppointment(payload);
      trackAppointmentSuccess({
        eventId: createAppointmentEventId(),
        formLocation: location.pathname,
        chamberName: selectedChamber.shortName,
        chamberId: selectedChamber.shortName,
        serviceName: payload.service,
        bookingDate: payload.date,
        language: payload.language
      });
      setAppointments((items) => [saved || payload, ...items]);
      setSuccessAppointment(saved || payload);
      setForm({
        name: "",
        phone: "",
        age: "",
        chamber: defaultChamber.shortName,
        service: serviceOptions[0] || "",
        date: getNextAvailableDate(defaultChamber),
        message: "",
        language: "en"
      });
    } catch (error) {
      setNotice(error.message || copy.requestFailed);
    } finally {
      setSaving(false);
      submitInFlightRef.current = false;
    }
  }

  return (
    <section id="appointment" className="bg-[#f8fbfb] py-20">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative order-2 overflow-hidden rounded-[32px] bg-ink p-8 text-white shadow-soft lg:order-1">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-clinic/25" />
          <div className="relative">
            <CalendarCheck className="mb-5 text-clinic" size={38} />
            <p className="text-sm font-bold uppercase tracking-wide text-clinic">{copy.appointmentBooking}</p>
            <h2 className="mt-2 text-4xl font-extrabold">{copy.chooseChamber}</h2>
            <p className="mt-4 leading-7 text-white/70">
              {copy.chamberIntro}
            </p>
            <div className="mt-8 grid gap-4">
              {chambers.map((chamber, index) => (
                <div
                  key={chamber.shortName}
                  className="group rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-left backdrop-blur transition hover:-translate-y-1 hover:border-clinic hover:bg-white/[0.14] hover:shadow-[0_20px_55px_rgba(0,0,0,0.18)]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
                      <img src={chamber.logo} alt={`${chamber.shortName} logo`} className="h-full w-full object-contain" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-clinic">Chamber {index + 1}</p>
                      <p className="font-extrabold leading-5">{chamber.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm leading-6 text-white/75">
                    <p className="flex gap-2"><MapPin size={17} className="mt-1 shrink-0 text-clinic" /> {chamber.address}</p>
                    <p className="flex gap-2"><Clock3 size={17} className="mt-1 shrink-0 text-clinic" /> {copy.time}: {chamber.scheduleEn}, {chamber.timeEn}</p>
                    <p className="flex gap-2"><Phone size={17} className="mt-1 shrink-0 text-clinic" /> {copy.callAppointment}: {chamber.appointment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="order-1 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft lg:order-2">
          <div className="border-b border-slate-100 bg-gradient-to-br from-[#fff8fb] to-white p-5 md:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-clinic">{copy.requestAppointment}</p>
            <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-extrabold leading-tight text-ink">{copy.patientDetails}</h2>
                <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">{copy.formIntro}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[#5B2B6D] shadow-sm">
                  <Clock3 size={18} className="shrink-0" />
                  <span className="leading-tight">
                    <span className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      {selectedChamber.scheduleEn}
                    </span>
                    <span className="block text-sm font-extrabold">
                      {selectedChamber.timeEn}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-5 md:p-7">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#5B2B6D] text-sm font-extrabold text-white">1</span>
                <div>
                  <p className="font-extrabold text-ink">{copy.selectChamber}</p>
                  <p className="text-xs font-semibold text-slate-500">{copy.selectChamberHelp}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {chambers.map((chamber, index) => (
                  <button
                    key={chamber.shortName}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, chamber: chamber.shortName }));
                      trackChamberSelection(chamber.shortName, `chamber_${index + 1}`);
                    }}
                    className={`group grid min-h-[172px] grid-cols-[96px_1fr] items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:border-[#5B2B6D] hover:shadow-soft ${
                      form.chamber === chamber.shortName ? "border-[#5B2B6D] bg-[#fff8fb] ring-4 ring-[#fbf0f4]" : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-sm transition group-hover:scale-[1.03]">
                      <img src={chamber.logo} alt={`${chamber.shortName} logo`} className="h-full w-full object-contain" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-extrabold uppercase text-clinic">Chamber {index + 1}</span>
                      <span className="mt-1 block text-base font-extrabold leading-6 text-ink">{chamber.name}</span>
                      <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">
                        {chamber.scheduleEn} · {chamber.timeEn}
                      </span>
                      {form.chamber === chamber.shortName && (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#5B2B6D] px-3 py-1 text-[11px] font-extrabold text-white">
                          <CheckCircle2 size={13} /> {copy.selected}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#5B2B6D] text-sm font-extrabold text-white">2</span>
                <div>
                  <p className="font-extrabold text-ink">{copy.patientInformation}</p>
                  <p className="text-xs font-semibold text-slate-500">{copy.patientHelp}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">{copy.patientName}</span>
                  <input className="admin-input h-14" placeholder={copy.patientNamePlaceholder} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">{copy.phoneNumber}</span>
                  <input className="admin-input h-14" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">{copy.age}</span>
                  <input className="admin-input h-14" type="number" min="0" placeholder={copy.agePlaceholder} value={form.age || ""} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
                </label>
                <div className="relative">
                  <span className="mb-2 block text-sm font-bold text-slate-600">{copy.treatmentType}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceOpen((open) => !open);
                      setCalendarOpen(false);
                    }}
                    className="flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left font-bold text-ink shadow-sm transition hover:border-[#5B2B6D] focus:border-[#5B2B6D] focus:outline-none focus:ring-4 focus:ring-[#fbf0f4]"
                  >
                    <span className="truncate">{form.service || copy.selectTreatment}</span>
                    <ArrowUpRight size={17} className={`shrink-0 text-clinic transition ${serviceOpen ? "-rotate-45" : "rotate-45"}`} />
                  </button>
                  {serviceOpen && (
                    <div className="absolute left-0 right-0 top-[76px] z-20 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
                      {serviceOptions.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            setForm((current) => ({ ...current, service }));
                            setServiceOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold transition hover:bg-[#fff8fb] ${
                            form.service === service ? "bg-[#fff8fb] text-[#5B2B6D]" : "text-slate-700"
                          }`}
                        >
                          <span>{service}</span>
                          {form.service === service && <CheckCircle2 size={16} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <span className="mb-2 block text-sm font-bold text-slate-600">{copy.appointmentDate}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarOpen((open) => !open);
                      setServiceOpen(false);
                      setCalendarMonth(parseDateValue(form.date || minDate));
                    }}
                    className="flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left font-bold text-ink shadow-sm transition hover:border-[#5B2B6D] focus:border-[#5B2B6D] focus:outline-none focus:ring-4 focus:ring-[#fbf0f4]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <CalendarCheck className="shrink-0 text-clinic" size={19} />
                      <span className="truncate">{formatReadableDate(form.date, copy.dateLocale)}</span>
                    </span>
                    <span className="rounded-full bg-[#fff8fb] px-3 py-1 text-xs font-extrabold text-[#5B2B6D]">{copy.pick}</span>
                  </button>
                  {calendarOpen && (
                    <div className="absolute left-0 right-0 top-[76px] z-30 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                      <div className="mb-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                          className="grid h-9 w-9 place-items-center rounded-full bg-[#fff8fb] text-[#5B2B6D] transition hover:bg-[#fbf0f4]"
                          aria-label="Previous month"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <p className="text-sm font-extrabold text-ink">{monthLabel}</p>
                        <button
                          type="button"
                          onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                          className="grid h-9 w-9 place-items-center rounded-full bg-[#fff8fb] text-[#5B2B6D] transition hover:bg-[#fbf0f4]"
                          aria-label="Next month"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold uppercase text-slate-400">
                        {copy.dayLabels.map((day) => <span key={day}>{day}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day) => {
                          const value = toDateValue(day);
                          const isSelected = value === form.date;
                          const isDisabled = value < minDate || !isDateAvailableForChamber(value, selectedChamber);
                          const isOutside = day.getMonth() !== calendarMonth.getMonth();

                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                setForm((current) => ({ ...current, date: value }));
                                setCalendarOpen(false);
                              }}
                              className={`grid h-10 place-items-center rounded-xl text-sm font-extrabold transition ${
                                isSelected
                                  ? "bg-[#5B2B6D] text-white shadow-sm"
                                  : isDisabled
                                    ? "cursor-not-allowed bg-slate-50 text-slate-300"
                                    : isOutside
                                      ? "text-slate-300 hover:bg-[#fff8fb]"
                                      : "text-slate-700 hover:bg-[#fff8fb] hover:text-[#5B2B6D]"
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs font-semibold text-slate-500">{copy.scheduleNote}</p>
                </div>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-600">{copy.noteLabel}</span>
                  <textarea className="admin-input min-h-28" placeholder={copy.notePlaceholder} value={form.message || ""} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </label>
              </div>
            </section>

            <div className="rounded-3xl border border-slate-100 bg-[#fff8fb] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="text-[#5B2B6D]" size={24} />
                  <div>
                    <p className="font-extrabold text-ink">{form.chamber}</p>
                    <p className="text-xs font-semibold text-slate-500">
                      {copy.availableSlot}: {selectedChamber.timeEn}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">{copy.serialHelp}</p>
                  </div>
                </div>
                <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5B2B6D] px-6 py-4 font-extrabold text-white shadow-[0_18px_45px_rgba(91,43,109,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                  {saving ? copy.sending : copy.submit} <ArrowUpRight size={18} />
                </button>
              </div>
            </div>

            {notice && <p className="rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{notice}</p>}
          </div>
        </form>
      </div>
      <AnimatePresence>
        {successAppointment && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-ink/45 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-soft"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-[#5B2B6D]">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="mt-5 text-2xl font-extrabold text-ink">{copy.successTitle}</h3>
              <p className="mt-3 text-lg font-bold text-[#7b6074]">
                {copy.successSerial} {successAppointment.serialNumber || "pending"}.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {copy.successHelp}
              </p>
              <button
                type="button"
                onClick={() => setSuccessAppointment(null)}
                className="mt-6 w-full rounded-2xl bg-[#5B2B6D] px-5 py-3 font-extrabold text-white"
              >
                {copy.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ReelCard({ reel }) {
  const [playing, setPlaying] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const parsed = parseVideoUrl(reel.videoUrl);
  const poster = reel.thumbnail || parsed?.thumbnail;
  const previewFrame = !poster && parsed?.staticEmbedUrl;
  const canPlay = playing && parsed?.previewEmbedUrl;

  useEffect(() => {
    setIframeReady(false);
  }, [playing, reel.videoUrl]);

  function handleCardClick() {
    if (parsed?.previewEmbedUrl) {
      setPlaying(true);
    }
  }

  return (
    <>
      <div className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[24px] bg-[#fff8fb] shadow-soft" onClick={handleCardClick}>
        <>
          {poster ? (
            <img src={poster} alt={reel.title || "Reel"} className="absolute inset-0 h-full w-full object-cover" />
          ) : previewFrame ? (
            <iframe
              src={previewFrame}
              title={reel.title || "Reel preview"}
              className="pointer-events-none absolute inset-0 h-full w-full bg-white"
              allow="encrypted-media; picture-in-picture; web-share"
              frameBorder="0"
              scrolling="no"
              tabIndex="-1"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,240,244,1),transparent_38%),linear-gradient(145deg,#5B2B6D,#B499AC)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/90 text-clinic shadow-soft transition group-hover:scale-110">
                <Play size={22} fill="currentColor" />
              </span>
              <span className="mt-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-[#5B2B6D]">
                Watch Here
              </span>
            </div>
          </div>
        </>
        {reel.title && (
          <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-extrabold leading-5 text-white drop-shadow">{reel.title}</p>
        )}
      </div>
      <AnimatePresence>
        {canPlay && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-ink/70 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              className="relative h-[min(82vh,720px)] w-full max-w-[430px] overflow-hidden rounded-[28px] bg-white shadow-soft"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPlaying(false)}
                className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-[#5B2B6D] shadow-soft"
                aria-label="Close video"
              >
                <X size={20} />
              </button>
              <iframe
                src={parsed.previewEmbedUrl}
                title={reel.title || "Short health tip"}
                className="h-full w-full bg-white"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                frameBorder="0"
                scrolling="no"
                onLoad={() => setIframeReady(true)}
              />
              {!iframeReady && (
                <div className="absolute inset-0 grid place-items-center bg-[#fff8fb] p-4 text-center">
                  <p className="text-sm font-extrabold text-[#5B2B6D]">Loading video...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ReelsSection() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  const reels = content.reels || [];
  const reelsSubtitle = "Guidance on fertility, pregnancy and women's health. Hover or tap a card to watch.";

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
            {reelsSubtitle}
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

function PatientExpressionsSection() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  const expressions = (content.home?.patientExpressions || []).filter((item) => item.name || item.quote || item.videoUrl);

  if (!expressions.length) return null;

  return (
    <section className="bg-[#fff8fb] py-20">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-14 xl:px-20">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-bold uppercase tracking-wide text-clinic">{home.expressionsEyebrow || "Patients' Expressions"}</p>
            <h2 className="mt-2 max-w-3xl text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              {home.expressionsTitle || "Stories from patients who trusted her care"}
            </h2>
          </div>
          <p className="max-w-md leading-7 text-slate-600">
            {home.expressionsSubtitle || "Short video expressions and heartfelt words from patients who felt supported, informed and cared for throughout their journey."}
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {expressions.map((item, index) => {
            const parsed = parseVideoUrl(item.videoUrl);
            const [playing, setPlaying] = useState(false);
            const poster = parsed?.thumbnail;

            return (
              <article key={`${item.name}-${index}`} className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-soft">
                <div className="aspect-video bg-slate-100" onClick={() => setPlaying(true)}>
                  {playing && parsed?.previewEmbedUrl ? (
                    <iframe className="h-full w-full" src={parsed.previewEmbedUrl} title={item.name || "Patient expression"} loading="lazy" allowFullScreen />
                  ) : (
                    <div className="relative h-full w-full cursor-pointer">
                      {poster ? <img src={poster} alt={item.name || "Patient expression"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[#fbf0f4] p-6 text-center text-sm font-semibold text-slate-600">Video preview</div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-clinic shadow-soft">
                          <Play size={22} fill="currentColor" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-lg font-extrabold text-ink">{item.name || "Patient story"}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">“{item.quote || "A heartfelt patient expression will appear here."}”</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CareMoments() {
  const { content } = useContext(SiteContext);
  const home = content.home || {};
  const careImages = content.careMomentImages?.length ? content.careMomentImages : content.moments || [];
  const featured = careImages.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featured.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) return null;

  const mainItem = featured[activeIndex];
  const otherItems = featured.filter((_, index) => index !== activeIndex);

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
            <AnimatePresence mode="wait">
              <motion.img
                key={mainItem.image}
                src={mainItem.image}
                alt={mainItem.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.55 }}
              />
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-wide text-blush">Mother & newborn care</p>
              <h3 className="mt-2 text-2xl font-extrabold">{mainItem.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/80">{mainItem.caption}</p>
            </div>
          </article>

          {otherItems.map((item) => (
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
  const trustImages = content.trustImages?.length ? content.trustImages : content.moments || [];
  const sliderItems = trustImages.length ? trustImages : [{ title: content.profile.name, caption: content.profile.title, image: content.profile.portraitImage }];
  const [activeIndex, setActiveIndex] = useState(0);
  const items = content.home?.journeyItems || [
    "Fertility evaluation and counseling",
    "Pregnancy and delivery planning",
    "PCOS, endometriosis and menstrual care",
    "Post-treatment and family follow-up"
  ];

  useEffect(() => {
    if (sliderItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % sliderItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [sliderItems.length]);

  const activeSlide = sliderItems[activeIndex % sliderItems.length];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:px-14 xl:px-20">
        <div className="relative min-h-[520px] overflow-hidden rounded-[34px] bg-[#fff8fb] shadow-soft">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeSlide.image}
              src={activeSlide.image}
              alt={activeSlide.title || "Patient care moment"}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.55 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
            <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-extrabold uppercase text-[#5B2B6D] shadow-sm">Patient trust</span>
            <span className="rounded-full bg-[#5B2B6D]/90 px-4 py-2 text-xs font-extrabold text-white shadow-sm">{String(activeIndex + 1).padStart(2, "0")} / {String(sliderItems.length).padStart(2, "0")}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-sm font-extrabold uppercase tracking-wide text-blush">{activeSlide.title || "Care moment"}</p>
            <p className="mt-2 max-w-xl text-lg font-bold leading-7 text-white/90">{activeSlide.caption || "A trusted care moment from Dr. Farhin's practice."}</p>
            <div className="mt-5 flex gap-2">
              {sliderItems.slice(0, 8).map((item, index) => (
                <button
                  key={`${item.image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/75"}`}
                  aria-label={`Show trust image ${index + 1}`}
                />
              ))}
            </div>
          </div>
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
        const ctaHref = section.ctaHref === "#appointment" || section.ctaHref === "/#appointment" ? "/appointment" : section.ctaHref;

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
                {section.ctaLabel && ctaHref && (
                  <a href={ctaHref} className="mt-8 inline-flex items-center gap-2 rounded-full bg-clinic px-7 py-4 font-extrabold text-white shadow-[0_18px_45px_rgba(180,153,172,0.24)]">
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
  const phone = content.profile.phone || "+8801850545737";
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const socialLinks = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/drkazikhadezafarhin/",
      icon: Facebook
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/",
      icon: Instagram
    }
  ];

  return (
    <footer id="contact" className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(241,141,177,0.18),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(180,153,172,0.16),transparent_28%)]" />
      <div className="relative mx-auto max-w-[1320px] px-4 py-16 lg:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <div>
            <p className="font-bold uppercase tracking-wide text-clinic">Contact</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
              {content.profile.name || "Dr. Kazi Khadeza Farhin"}
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-white/65">
              {content.profile.title || "Gynecology, fertility and pregnancy care specialist"}
            </p>
          </div>

          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-white/45">Reach Her</p>
            <div className="mt-5 space-y-4">
              <a href={phoneHref} className="flex items-center gap-3 text-white/75 transition hover:text-clinic">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-clinic">
                  <Phone size={18} />
                </span>
                <span className="font-bold">{phone}</span>
              </a>
              {content.profile.email && (
                <a href={`mailto:${content.profile.email}`} className="flex items-center gap-3 text-white/75 transition hover:text-clinic">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-clinic">
                    <Mail size={18} />
                  </span>
                  <span className="font-bold">{content.profile.email}</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-white/45">Follow</p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-clinic hover:bg-clinic hover:text-white"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
            <a
              href={phoneHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-clinic px-6 py-3 font-extrabold text-white shadow-soft transition hover:-translate-y-0.5"
            >
              Call Now <ArrowUpRight size={18} />
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 pt-6 text-sm font-semibold text-white/45 md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} {content.profile.name || "Dr. Kazi Khadeza Farhin"}. All rights reserved.</p>
          <p>Designed for patient care and appointment support.</p>
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
      <PatientExpressionsSection />
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
