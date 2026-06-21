import { useContext, useState } from "react";
import { ArrowUpRight, CalendarCheck, Clock3, Mail, MapPin, Phone, Send, Stethoscope } from "lucide-react";
import { Header } from "./App.jsx";
import { chambers } from "../data/chambers.js";
import { SiteContext } from "../siteContext.jsx";

export default function ContactPage() {
  const { content } = useContext(SiteContext);
  const [form, setForm] = useState({ name: "", phone: "", chamber: chambers[0].shortName, message: "" });

  function submit(e) {
    e.preventDefault();
    setForm({ name: "", phone: "", chamber: chambers[0].shortName, message: "" });
  }

  return (
    <main className="min-h-screen bg-[#fff8fb] text-ink">
      <Header />
      <section className="relative overflow-hidden px-4 pb-16 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(241,141,177,0.18),transparent_34%),radial-gradient(circle_at_15%_70%,rgba(180,153,172,0.16),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-petal bg-white px-4 py-2 text-sm font-extrabold text-[#7b6074] shadow-sm">
              <CalendarCheck size={17} />
              Contact & Appointment
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight md:text-7xl">
              Book care at the right chamber
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Select Uttara Crescent Clinic or Nova IVF Fertility Banani, then call the appointment number for final confirmation.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a href={`tel:${content.profile.phone}`} className="rounded-[24px] bg-white p-5 shadow-sm">
                <Phone className="text-clinic" />
                <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Phone</p>
                <p className="mt-1 text-xl font-extrabold">{content.profile.phone}</p>
              </a>
              <a href={`mailto:${content.profile.email}`} className="rounded-[24px] bg-white p-5 shadow-sm">
                <Mail className="text-clinic" />
                <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-1 text-xl font-extrabold">{content.profile.email}</p>
              </a>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-[34px] border border-petal/70 bg-white p-6 shadow-soft md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-clinic text-white">
                <Send size={20} />
              </span>
              <div>
                <p className="font-bold uppercase tracking-wide text-clinic">Quick Message</p>
                <h2 className="text-2xl font-extrabold">Request appointment help</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="admin-input h-16" placeholder="Patient name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="admin-input h-16" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <select className="admin-input h-16 md:col-span-2" value={form.chamber} onChange={(e) => setForm({ ...form, chamber: e.target.value })}>
                {chambers.map((chamber) => (
                  <option key={chamber.shortName}>{chamber.shortName}</option>
                ))}
              </select>
              <textarea
                className="admin-input min-h-36 md:col-span-2"
                placeholder="Write your concern or preferred time"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-clinic px-6 py-4 font-extrabold text-white">
              Send Request <ArrowUpRight size={18} />
            </button>
          </form>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-9">
            <p className="font-bold uppercase tracking-wide text-clinic">Chambers</p>
            <h2 className="mt-2 text-4xl font-extrabold">Where mam sees patients</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {chambers.map((chamber, index) => (
              <article key={chamber.shortName} className="rounded-[32px] border border-petal/70 bg-[#fff8fb] p-7 shadow-sm">
                <div className="mb-6 flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-clinic text-lg font-extrabold text-white">{index + 1}</span>
                  <div>
                    <h3 className="text-2xl font-extrabold">{chamber.name}</h3>
                    <p className="mt-1 font-bold text-[#7b6074]">{chamber.shortName}</p>
                  </div>
                </div>
                <div className="space-y-4 leading-7 text-slate-700">
                  <p className="flex gap-3"><MapPin className="mt-1 shrink-0 text-clinic" size={20} /> {chamber.address}</p>
                  <p className="flex gap-3"><Clock3 className="mt-1 shrink-0 text-clinic" size={20} /> সময়: {chamber.schedule}</p>
                  <p className="flex gap-3"><Phone className="mt-1 shrink-0 text-clinic" size={20} /> এপয়েনমেন্ট: {chamber.appointment}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 rounded-[34px] bg-ink p-8 text-white shadow-soft md:flex-row md:items-center">
          <div>
            <p className="flex items-center gap-2 font-bold uppercase tracking-wide text-blush">
              <Stethoscope size={18} /> Specialist care
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">Fertility, pregnancy and gynecology consultation</h2>
          </div>
          <a href="/#appointment" className="inline-flex items-center gap-2 rounded-full bg-clinic px-7 py-4 font-extrabold text-white">
            Book Appointment <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
