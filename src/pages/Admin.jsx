import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  FileText,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Plus,
  Save,
  Settings,
  Trash2,
  Video
} from "lucide-react";
import { SiteContext } from "../siteContext.jsx";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: Settings },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "media", label: "Videos", icon: Video },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "gallery", label: "Images", icon: Image }
];

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Dashboard({ content, appointments }) {
  const pending = appointments.filter((item) => item.status === "Pending").length;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Appointments" value={appointments.length} />
        <Stat label="Pending" value={pending} />
        <Stat label="Blog Posts" value={content.blogs.length} />
        <Stat label="Videos" value={content.videos.length} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-extrabold">Recent appointment requests</h3>
          <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-[#7b6074]">Live preview data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-3">Patient</th>
                <th>Service</th>
                <th>Chamber</th>
                <th>Date</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((item, index) => (
                <tr key={`${item.phone}-${index}`} className="font-medium text-slate-700">
                  <td className="py-4">{item.name}</td>
                  <td>{item.service}</td>
                  <td>{item.chamber || "Uttara Crescent Clinic & Hospital"}</td>
                  <td>{item.date}</td>
                  <td>{item.phone}</td>
                  <td><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfileEditor({ content, setContent }) {
  const [draft, setDraft] = useState(content.profile);
  const [services, setServices] = useState(content.services.join("\n"));

  function save() {
    setContent((prev) => ({ ...prev, profile: draft, services: services.split("\n").filter(Boolean) }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-extrabold">Doctor profile content</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Doctor name"><input className="admin-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field label="Designation"><input className="admin-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          <Field label="Phone"><input className="admin-input" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
          <Field label="Email"><input className="admin-input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
          <Field label="Chamber"><input className="admin-input" value={draft.chamber} onChange={(e) => setDraft({ ...draft, chamber: e.target.value })} /></Field>
          <Field label="Hero image path"><input className="admin-input" value={draft.heroImage} onChange={(e) => setDraft({ ...draft, heroImage: e.target.value })} /></Field>
          <Field label="Intro"><textarea className="admin-input min-h-32 md:col-span-2" value={draft.intro} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} /></Field>
          <Field label="Services, one per line"><textarea className="admin-input min-h-44 md:col-span-2" value={services} onChange={(e) => setServices(e.target.value)} /></Field>
        </div>
        <button onClick={save} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 font-bold text-white"><Save size={18} /> Save Content</button>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-extrabold">Live preview</h3>
        <img src={draft.heroImage} alt={draft.name} className="mx-auto h-80 object-contain" />
        <p className="mt-4 text-2xl font-extrabold">{draft.name}</p>
        <p className="mt-2 text-slate-500">{draft.title}</p>
      </div>
    </div>
  );
}

function AppointmentManager({ appointments, setAppointments }) {
  function updateStatus(index, status) {
    setAppointments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, status } : item));
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-extrabold">Appointment requests</h3>
      <div className="space-y-3">
        {appointments.map((item, index) => (
          <div key={`${item.phone}-${index}`} className="grid gap-3 rounded-2xl border border-slate-100 p-4 md:grid-cols-[1fr_1fr_1fr_140px_160px] md:items-center">
            <div>
              <p className="font-extrabold">{item.name}</p>
              <p className="text-sm text-slate-500">{item.phone}</p>
            </div>
            <p className="font-semibold text-slate-700">{item.service}</p>
            <p className="text-sm font-bold text-slate-500">{item.chamber || "Uttara Crescent Clinic & Hospital"}</p>
            <p className="text-sm font-bold text-slate-500">{item.date}</p>
            <select className="admin-input" value={item.status} onChange={(e) => updateStatus(index, e.target.value)}>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListEditor({ type, items, onChange }) {
  const empty = type === "blog" ? { title: "", excerpt: "", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) } : { title: "", url: "" };
  const labels = type === "blog" ? ["Title", "Excerpt", "Date"] : ["Title", "YouTube embed URL"];

  function update(index, key, value) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-extrabold">{type === "blog" ? "Blog CMS" : "Video library"}</h3>
        <button onClick={() => onChange([empty, ...items])} className="inline-flex items-center gap-2 rounded-2xl bg-clinic px-4 py-3 text-sm font-bold text-white"><Plus size={16} /> Add</button>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-100 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={labels[0]}><input className="admin-input" value={item.title} onChange={(e) => update(index, "title", e.target.value)} /></Field>
              {type === "blog" ? (
                <Field label={labels[2]}><input className="admin-input" value={item.date} onChange={(e) => update(index, "date", e.target.value)} /></Field>
              ) : (
                <Field label={labels[1]}><input className="admin-input" value={item.url} onChange={(e) => update(index, "url", e.target.value)} /></Field>
              )}
              {type === "blog" && <Field label={labels[1]}><textarea className="admin-input min-h-28 md:col-span-2" value={item.excerpt} onChange={(e) => update(index, "excerpt", e.target.value)} /></Field>}
            </div>
            <button onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-bold text-red-600"><Trash2 size={15} /> Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Gallery() {
  const { content } = useContext(SiteContext);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-extrabold">Image CMS</h3>
      <p className="mt-2 text-slate-500">Backend e Multer image upload route ready ache. Prototype e image path diye preview update kora jacche.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <img className="h-80 w-full rounded-3xl object-contain bg-pearl p-4" src="/images/doctor-cutout.png" alt="Doctor cutout" />
        <img className="h-80 w-full rounded-3xl object-cover" src="/images/doctor-portrait.jpg" alt="Doctor portrait" />
      </div>
      <h4 className="mt-8 text-lg font-extrabold">Care moments gallery</h4>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.moments.map((item) => (
          <div key={item.image} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <img className="h-48 w-full object-cover" src={item.image} alt={item.title} />
            <div className="p-4">
              <p className="font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const { content, setContent, appointments, setAppointments } = useContext(SiteContext);
  const [active, setActive] = useState("dashboard");
  const title = useMemo(() => tabs.find((tab) => tab.id === active)?.label, [active]);

  return (
    <main className="min-h-screen bg-pearl">
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-clinic">Doctor CMS</p>
            <h1 className="text-xl font-extrabold">Admin Panel</h1>
          </div>
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-pearl"><Home size={18} /></Link>
        </div>
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActive(tab.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition ${active === tab.id ? "bg-ink text-white" : "text-slate-600 hover:bg-pearl"}`}>
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-clinic">Content management</p>
              <h2 className="text-2xl font-extrabold">{title}</h2>
            </div>
            <div className="flex gap-2">
              <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"><Home size={17} /> Website</Link>
              <button className="hidden items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white sm:inline-flex"><LogOut size={17} /> Logout</button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActive(tab.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${active === tab.id ? "bg-ink text-white" : "bg-white text-slate-600"}`}>{tab.label}</button>
            ))}
          </div>
        </header>
        <div className="p-4 lg:p-8">
          {active === "dashboard" && <Dashboard content={content} appointments={appointments} />}
          {active === "profile" && <ProfileEditor content={content} setContent={setContent} />}
          {active === "appointments" && <AppointmentManager appointments={appointments} setAppointments={setAppointments} />}
          {active === "media" && <ListEditor type="video" items={content.videos} onChange={(videos) => setContent((prev) => ({ ...prev, videos }))} />}
          {active === "blog" && <ListEditor type="blog" items={content.blogs} onChange={(blogs) => setContent((prev) => ({ ...prev, blogs }))} />}
          {active === "gallery" && <Gallery />}
        </div>
      </section>
    </main>
  );
}
