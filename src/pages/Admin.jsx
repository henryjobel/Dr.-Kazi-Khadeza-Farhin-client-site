import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  Clapperboard,
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
import { getAppointments, getContent, loginAdmin, saveContent, updateAppointment, uploadImage } from "../lib/api.js";
import { slugify } from "../lib/seo.js";
import { parseVideoUrl } from "../lib/video.js";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "home", label: "Home Page", icon: Home },
  { id: "profile", label: "Profile", icon: Settings },
  { id: "portfolio", label: "Portfolio", icon: Award },
  { id: "seo", label: "SEO", icon: FileText },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "reels", label: "Reels", icon: Clapperboard },
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

function isAuthError(error) {
  return error?.status === 401 || /invalid token|authentication required/i.test(error?.message || "");
}

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ email: "admin@drfarhin.local", password: "admin12345" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await loginAdmin(form);
      localStorage.setItem("doctorAdminToken", result.token);
      onLogin(result.token);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fff8fb] p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-[32px] border border-petal bg-white p-8 shadow-soft">
        <p className="font-bold uppercase tracking-wide text-clinic">Doctor CMS</p>
        <h1 className="mt-2 text-3xl font-extrabold">Admin login</h1>
        <div className="mt-6 space-y-4">
          <Field label="Email"><input className="admin-input h-14" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Password"><input className="admin-input h-14" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-ink px-5 py-4 font-extrabold text-white">{loading ? "Logging in..." : "Login"}</button>
      </form>
    </main>
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

const emptyHomeSection = () => ({
  type: "cards",
  eyebrow: "New Section",
  title: "Homepage section title",
  body: "",
  image: "",
  ctaLabel: "",
  ctaHref: "",
  items: ["First item"],
  enabled: true
});

function linesToArray(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function arrayToLines(value) {
  return (value || []).join("\n");
}

function HomeEditor({ content, setContent, token, onAuthError }) {
  const [stats, setStats] = useState(content.stats || []);
  const [home, setHome] = useState(content.home || {});
  const [specialistItems, setSpecialistItems] = useState((content.home?.specialistItems || []).join("\n"));
  const [aboutItems, setAboutItems] = useState((content.home?.aboutItems || []).join("\n"));
  const [journeyItems, setJourneyItems] = useState((content.home?.journeyItems || []).join("\n"));
  const [customSections, setCustomSections] = useState(content.home?.customSections || []);
  const [uploadingSection, setUploadingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    setStats(content.stats || []);
    setHome(content.home || {});
    setSpecialistItems((content.home?.specialistItems || []).join("\n"));
    setAboutItems((content.home?.aboutItems || []).join("\n"));
    setJourneyItems((content.home?.journeyItems || []).join("\n"));
    setCustomSections(content.home?.customSections || []);
  }, [content._id, content.updatedAt, dirty]);

  async function save() {
    const newContent = {
      ...content,
      stats,
      home: {
        ...home,
        specialistItems: specialistItems.split("\n").map((s) => s.trim()).filter(Boolean),
        aboutItems: aboutItems.split("\n").map((s) => s.trim()).filter(Boolean),
        journeyItems: journeyItems.split("\n").map((s) => s.trim()).filter(Boolean),
        customSections: customSections.map((section) => ({
          ...section,
          items: section.items || [],
          enabled: section.enabled !== false
        }))
      }
    };
    setContent(newContent);
    setSaving(true);
    setStatus("");
    try {
      const saved = await saveContent(newContent, token);
      setContent((prev) => ({ ...prev, ...saved }));
      setDirty(false);
      setStatus("Saved successfully.");
    } catch (err) {
      if (isAuthError(err)) {
        onAuthError?.();
        return;
      }
      setStatus(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function updateSection(index, key, value) {
    setDirty(true);
    setCustomSections((sections) => sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, [key]: value } : section));
  }

  function moveSection(index, direction) {
    setDirty(true);
    setCustomSections((sections) => {
      const next = [...sections];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= next.length) return sections;
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function uploadSectionImage(index, file) {
    if (!file) return;
    setUploadingSection(index);
    setStatus("");
    try {
      const result = await uploadImage(file, token);
      updateSection(index, "image", result.url);
    } catch (error) {
      setStatus(error.message || "Image upload failed.");
    } finally {
      setUploadingSection(null);
    }
  }

  function addStat() {
    setDirty(true);
    setStats((items) => [...items, { value: "", label: "" }]);
  }

  function removeStat(index) {
    setDirty(true);
    setStats((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold">Hero stats</h3>
            <p className="mt-1 text-sm text-slate-500">Add, remove, or edit stat cards shown below the hero buttons.</p>
          </div>
          <button onClick={addStat} className="inline-flex items-center gap-2 rounded-2xl bg-clinic px-4 py-3 text-sm font-bold text-white">
            <Plus size={16} /> Add Stat
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-[#fff8fb] p-4 space-y-3">
              <Field label="Value">
                <input className="admin-input" value={stat.value} onChange={(e) => { setDirty(true); setStats(stats.map((s, si) => si === i ? { ...s, value: e.target.value } : s)); }} />
              </Field>
              <Field label="Label">
                <input className="admin-input" value={stat.label} onChange={(e) => { setDirty(true); setStats(stats.map((s, si) => si === i ? { ...s, label: e.target.value } : s)); }} />
              </Field>
              <button onClick={() => removeStat(i)} className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-bold text-red-600">
                <Trash2 size={15} /> Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Hero section text</h3>
        <p className="mb-5 text-sm text-slate-500">The badge, heading and experience badge on the hero.</p>
        <div className="grid gap-4">
          <Field label="Qualification badge (top tag)">
            <input className="admin-input" value={home.heroBadge || ""} onChange={(e) => { setDirty(true); setHome({ ...home, heroBadge: e.target.value }); }} />
          </Field>
          <Field label="Main heading (doctor name is added automatically after this)">
            <input className="admin-input" value={home.heroHeading || ""} onChange={(e) => { setDirty(true); setHome({ ...home, heroHeading: e.target.value }); }} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Experience years (right badge)">
              <input className="admin-input" value={home.experienceYears || ""} onChange={(e) => { setDirty(true); setHome({ ...home, experienceYears: e.target.value }); }} />
            </Field>
            <Field label="Experience label">
              <input className="admin-input" value={home.experienceLabel || ""} onChange={(e) => { setDirty(true); setHome({ ...home, experienceLabel: e.target.value }); }} />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Specialist care slider</h3>
        <p className="mb-5 text-sm text-slate-500">One item per line — these slide automatically on the hero image card.</p>
        <Field label="Specialist items (one per line)">
          <textarea className="admin-input min-h-32" value={specialistItems} onChange={(e) => { setDirty(true); setSpecialistItems(e.target.value); }} />
        </Field>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Reels section</h3>
        <p className="mb-5 text-sm text-slate-500">Heading text above the short-video reel cards. The reel cards themselves are managed in the Reels tab.</p>
        <div className="grid gap-4">
          <Field label="Eyebrow tag"><input className="admin-input" value={home.reelsEyebrow || ""} onChange={(e) => { setDirty(true); setHome({ ...home, reelsEyebrow: e.target.value }); }} /></Field>
          <Field label="Title"><input className="admin-input" value={home.reelsTitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, reelsTitle: e.target.value }); }} /></Field>
          <Field label="Subtitle"><textarea className="admin-input min-h-24" value={home.reelsSubtitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, reelsSubtitle: e.target.value }); }} /></Field>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Care Moments section</h3>
        <p className="mb-5 text-sm text-slate-500">Heading text above the gallery preview on the homepage. Images are managed in the Images tab.</p>
        <div className="grid gap-4">
          <Field label="Eyebrow tag"><input className="admin-input" value={home.careMomentsEyebrow || ""} onChange={(e) => { setDirty(true); setHome({ ...home, careMomentsEyebrow: e.target.value }); }} /></Field>
          <Field label="Title"><input className="admin-input" value={home.careMomentsTitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, careMomentsTitle: e.target.value }); }} /></Field>
          <Field label="Subtitle"><textarea className="admin-input min-h-24" value={home.careMomentsSubtitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, careMomentsSubtitle: e.target.value }); }} /></Field>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Services section</h3>
        <p className="mb-5 text-sm text-slate-500">Heading text above the services grid. The service list itself is edited in the Profile tab.</p>
        <div className="grid gap-4">
          <Field label="Eyebrow tag"><input className="admin-input" value={home.servicesEyebrow || ""} onChange={(e) => { setDirty(true); setHome({ ...home, servicesEyebrow: e.target.value }); }} /></Field>
          <Field label="Title"><input className="admin-input" value={home.servicesTitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, servicesTitle: e.target.value }); }} /></Field>
          <Field label="Subtitle"><textarea className="admin-input min-h-24" value={home.servicesSubtitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, servicesSubtitle: e.target.value }); }} /></Field>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">About section checklist</h3>
        <p className="mb-5 text-sm text-slate-500">One item per line — the 4 boxes shown in the About section.</p>
        <Field label="Eyebrow tag"><input className="admin-input mb-4" value={home.aboutEyebrow || ""} onChange={(e) => { setDirty(true); setHome({ ...home, aboutEyebrow: e.target.value }); }} /></Field>
        <Field label="About checklist (one per line)">
          <textarea className="admin-input min-h-28" value={aboutItems} onChange={(e) => { setDirty(true); setAboutItems(e.target.value); }} />
        </Field>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Why patients trust her</h3>
        <p className="mb-5 text-sm text-slate-500">One item per line — shown in the journey highlights section.</p>
        <div className="grid gap-4 mb-4">
          <Field label="Eyebrow tag"><input className="admin-input" value={home.journeyEyebrow || ""} onChange={(e) => { setDirty(true); setHome({ ...home, journeyEyebrow: e.target.value }); }} /></Field>
          <Field label="Title"><input className="admin-input" value={home.journeyTitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, journeyTitle: e.target.value }); }} /></Field>
          <Field label="Body text"><textarea className="admin-input min-h-24" value={home.journeyBody || ""} onChange={(e) => { setDirty(true); setHome({ ...home, journeyBody: e.target.value }); }} /></Field>
        </div>
        <Field label="Journey items (one per line)">
          <textarea className="admin-input min-h-28" value={journeyItems} onChange={(e) => { setDirty(true); setJourneyItems(e.target.value); }} />
        </Field>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Portfolio section</h3>
        <p className="mb-5 text-sm text-slate-500">Heading text above the Education/Experience/Training cards. The lists themselves are edited in the Portfolio tab.</p>
        <div className="grid gap-4">
          <Field label="Eyebrow tag"><input className="admin-input" value={home.portfolioEyebrow || ""} onChange={(e) => { setDirty(true); setHome({ ...home, portfolioEyebrow: e.target.value }); }} /></Field>
          <Field label="Title"><input className="admin-input" value={home.portfolioTitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, portfolioTitle: e.target.value }); }} /></Field>
          <Field label="Subtitle"><textarea className="admin-input min-h-24" value={home.portfolioSubtitle || ""} onChange={(e) => { setDirty(true); setHome({ ...home, portfolioSubtitle: e.target.value }); }} /></Field>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold">Homepage custom sections</h3>
            <p className="mt-1 text-sm text-slate-500">Add new homepage sections with cards, image/text layouts, CTA buttons, and ordered content.</p>
          </div>
          <button onClick={() => { setDirty(true); setCustomSections((sections) => [...sections, emptyHomeSection()]); }} className="inline-flex items-center gap-2 rounded-2xl bg-clinic px-4 py-3 text-sm font-bold text-white">
            <Plus size={16} /> Add Section
          </button>
        </div>

        <div className="space-y-5">
          {customSections.map((section, index) => (
            <div key={index} className="rounded-3xl border border-slate-100 bg-[#fff8fb] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-clinic">Section {index + 1}</p>
                  <h4 className="text-lg font-extrabold">{section.title || "Untitled section"}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => moveSection(index, -1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">Up</button>
                  <button onClick={() => moveSection(index, 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">Down</button>
                  <button onClick={() => { setDirty(true); setCustomSections((sections) => sections.filter((_, sectionIndex) => sectionIndex !== index)); }} className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-600">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Section type">
                  <select className="admin-input" value={section.type || "cards"} onChange={(e) => updateSection(index, "type", e.target.value)}>
                    <option value="cards">Cards grid</option>
                    <option value="imageText">Image + text</option>
                    <option value="banner">Banner</option>
                    <option value="text">Text only</option>
                  </select>
                </Field>
                <label className="flex items-end gap-2 pb-3 text-sm font-bold text-slate-600">
                  <input type="checkbox" checked={section.enabled !== false} onChange={(e) => updateSection(index, "enabled", e.target.checked)} />
                  Show this section on homepage
                </label>
                <Field label="Eyebrow">
                  <input className="admin-input" value={section.eyebrow || ""} onChange={(e) => updateSection(index, "eyebrow", e.target.value)} />
                </Field>
                <Field label="Title">
                  <input className="admin-input" value={section.title || ""} onChange={(e) => updateSection(index, "title", e.target.value)} />
                </Field>
                <Field label="Body">
                  <textarea className="admin-input min-h-28 md:col-span-2" value={section.body || ""} onChange={(e) => updateSection(index, "body", e.target.value)} />
                </Field>
                <Field label="Image URL">
                  <input className="admin-input" value={section.image || ""} onChange={(e) => updateSection(index, "image", e.target.value)} />
                </Field>
                <Field label="Upload image">
                  <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-clinic bg-white px-4 text-sm font-extrabold text-[#7b6074]">
                    {uploadingSection === index ? "Uploading..." : "Choose Image"}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => uploadSectionImage(index, e.target.files?.[0])} />
                  </label>
                </Field>
                <Field label="CTA label">
                  <input className="admin-input" value={section.ctaLabel || ""} onChange={(e) => updateSection(index, "ctaLabel", e.target.value)} />
                </Field>
                <Field label="CTA link">
                  <input className="admin-input" placeholder="#appointment or /contact" value={section.ctaHref || ""} onChange={(e) => updateSection(index, "ctaHref", e.target.value)} />
                </Field>
                <Field label="Cards/list items, one per line">
                  <textarea className="admin-input min-h-32 md:col-span-2" value={arrayToLines(section.items)} onChange={(e) => updateSection(index, "items", linesToArray(e.target.value))} />
                </Field>
              </div>
              {section.image && <img src={section.image} alt={section.title || "Section preview"} className="mt-4 h-52 w-full rounded-2xl object-cover" />}
            </div>
          ))}
          {!customSections.length && <p className="rounded-2xl bg-[#fff8fb] px-4 py-4 text-sm font-bold text-[#7b6074]">No custom section yet. Add one to start building the homepage.</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 font-bold text-white disabled:opacity-70">
          <Save size={18} /> {saving ? "Saving..." : "Save Home Content"}
        </button>
        {status && <p className="rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{status}</p>}
      </div>
    </div>
  );
}

function ProfileEditor({ content, setContent, token, onAuthError }) {
  const [draft, setDraft] = useState(content.profile);
  const [services, setServices] = useState(content.services.join("\n"));
  const [uploading, setUploading] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(content.profile);
    setServices((content.services || []).join("\n"));
  }, [content._id, content.updatedAt]);

  async function save() {
    const newContent = { ...content, profile: draft, services: services.split("\n").map((service) => service.trim()).filter(Boolean) };
    setContent(newContent);
    setSaving(true);
    setStatus("");
    try {
      const saved = await saveContent(newContent, token);
      setContent((prev) => ({ ...prev, ...saved }));
      setStatus("Saved successfully.");
    } catch (err) {
      if (isAuthError(err)) {
        onAuthError?.();
        return;
      }
      setStatus(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileUpload(file, key) {
    if (!file) return;
    setUploading(key);
    setUploadError("");

    try {
      const result = await uploadImage(file, token);
      setDraft((current) => ({ ...current, [key]: result.url }));
    } catch (error) {
      setUploadError(error.message || "Image upload failed");
    } finally {
      setUploading("");
    }
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
          <Field label="Portrait image path"><input className="admin-input" value={draft.portraitImage} onChange={(e) => setDraft({ ...draft, portraitImage: e.target.value })} /></Field>
          <Field label="Intro"><textarea className="admin-input min-h-32 md:col-span-2" value={draft.intro} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} /></Field>
          <Field label="Services, one per line"><textarea className="admin-input min-h-44 md:col-span-2" value={services} onChange={(e) => setServices(e.target.value)} /></Field>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-clinic bg-[#fff8fb] px-5 py-4 text-sm font-extrabold text-[#7b6074]">
            {uploading === "heroImage" ? "Uploading hero..." : "Upload Hero Image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleProfileUpload(e.target.files?.[0], "heroImage")} />
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-clinic bg-[#fff8fb] px-5 py-4 text-sm font-extrabold text-[#7b6074]">
            {uploading === "portraitImage" ? "Uploading portrait..." : "Upload Portrait Image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleProfileUpload(e.target.files?.[0], "portraitImage")} />
          </label>
        </div>
        {uploadError && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{uploadError}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 font-bold text-white disabled:opacity-70"><Save size={18} /> {saving ? "Saving..." : "Save Profile"}</button>
          {status && <p className="rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{status}</p>}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-extrabold">Live preview</h3>
        <img src={draft.heroImage} alt={draft.name} className="mx-auto h-80 object-contain" />
        <img src={draft.portraitImage} alt={`${draft.name} portrait`} className="mt-4 h-44 w-full rounded-3xl object-cover" />
        <p className="mt-4 text-2xl font-extrabold">{draft.name}</p>
        <p className="mt-2 text-slate-500">{draft.title}</p>
      </div>
    </div>
  );
}

const emptyEducationRow = () => ({ degree: "", meta: "", institute: "", year: "" });
const emptyExperienceRow = () => ({ role: "", place: "", period: "" });

function PortfolioEditor({ content, setContent, token, onAuthError }) {
  const portfolio = content.portfolio || {};
  const [education, setEducation] = useState(portfolio.education || []);
  const [experience, setExperience] = useState(portfolio.experience || []);
  const [specialistTraining, setSpecialistTraining] = useState(arrayToLines(portfolio.specialistTraining));
  const [clinicalSkills, setClinicalSkills] = useState(arrayToLines(portfolio.clinicalSkills));
  const [research, setResearch] = useState(arrayToLines(portfolio.research));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const p = content.portfolio || {};
    setEducation(p.education || []);
    setExperience(p.experience || []);
    setSpecialistTraining(arrayToLines(p.specialistTraining));
    setClinicalSkills(arrayToLines(p.clinicalSkills));
    setResearch(arrayToLines(p.research));
  }, [content._id, content.updatedAt]);

  async function save() {
    const newContent = {
      ...content,
      portfolio: {
        education,
        experience,
        specialistTraining: linesToArray(specialistTraining),
        clinicalSkills: linesToArray(clinicalSkills),
        research: linesToArray(research)
      }
    };
    setContent(newContent);
    setSaving(true);
    setStatus("");
    try {
      const saved = await saveContent(newContent, token);
      setContent((prev) => ({ ...prev, ...saved }));
      setStatus("Saved successfully.");
    } catch (err) {
      if (isAuthError(err)) {
        onAuthError?.();
        return;
      }
      setStatus(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function updateEducation(index, key, value) {
    setEducation((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  function updateExperience(index, key, value) {
    setExperience((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold">Education</h3>
            <p className="mt-1 text-sm text-slate-500">Academic qualifications shown in the Portfolio section.</p>
          </div>
          <button onClick={() => setEducation((rows) => [...rows, emptyEducationRow()])} className="inline-flex items-center gap-2 rounded-2xl bg-clinic px-4 py-3 text-sm font-bold text-white">
            <Plus size={16} /> Add Degree
          </button>
        </div>
        <div className="space-y-4">
          {education.map((row, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-slate-100 bg-[#fff8fb] p-4 md:grid-cols-2">
              <Field label="Degree"><input className="admin-input" value={row.degree || ""} onChange={(e) => updateEducation(index, "degree", e.target.value)} /></Field>
              <Field label="Year"><input className="admin-input" value={row.year || ""} onChange={(e) => updateEducation(index, "year", e.target.value)} /></Field>
              <Field label="Description"><input className="admin-input" value={row.meta || ""} onChange={(e) => updateEducation(index, "meta", e.target.value)} /></Field>
              <Field label="Institute"><input className="admin-input" value={row.institute || ""} onChange={(e) => updateEducation(index, "institute", e.target.value)} /></Field>
              <button onClick={() => setEducation((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-bold text-red-600 md:col-span-2">
                <Trash2 size={15} /> Remove
              </button>
            </div>
          ))}
          {!education.length && <p className="text-sm font-bold text-slate-400">No education entries yet.</p>}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold">Professional Experience</h3>
            <p className="mt-1 text-sm text-slate-500">Clinical career timeline shown in the Portfolio section.</p>
          </div>
          <button onClick={() => setExperience((rows) => [...rows, emptyExperienceRow()])} className="inline-flex items-center gap-2 rounded-2xl bg-clinic px-4 py-3 text-sm font-bold text-white">
            <Plus size={16} /> Add Role
          </button>
        </div>
        <div className="space-y-4">
          {experience.map((row, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-slate-100 bg-[#fff8fb] p-4 md:grid-cols-2">
              <Field label="Role"><input className="admin-input" value={row.role || ""} onChange={(e) => updateExperience(index, "role", e.target.value)} /></Field>
              <Field label="Period"><input className="admin-input" value={row.period || ""} onChange={(e) => updateExperience(index, "period", e.target.value)} /></Field>
              <Field label="Place"><input className="admin-input md:col-span-2" value={row.place || ""} onChange={(e) => updateExperience(index, "place", e.target.value)} /></Field>
              <button onClick={() => setExperience((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-bold text-red-600 md:col-span-2">
                <Trash2 size={15} /> Remove
              </button>
            </div>
          ))}
          {!experience.length && <p className="text-sm font-bold text-slate-400">No experience entries yet.</p>}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Specialist Training</h3>
        <p className="mb-5 text-sm text-slate-500">One item per line.</p>
        <Field label="Specialist training (one per line)">
          <textarea className="admin-input min-h-32" value={specialistTraining} onChange={(e) => setSpecialistTraining(e.target.value)} />
        </Field>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Clinical Skills</h3>
        <p className="mb-5 text-sm text-slate-500">One item per line.</p>
        <Field label="Clinical skills (one per line)">
          <textarea className="admin-input min-h-32" value={clinicalSkills} onChange={(e) => setClinicalSkills(e.target.value)} />
        </Field>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-extrabold">Research & Achievements</h3>
        <p className="mb-5 text-sm text-slate-500">One item per line.</p>
        <Field label="Research highlights (one per line)">
          <textarea className="admin-input min-h-32" value={research} onChange={(e) => setResearch(e.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 font-bold text-white disabled:opacity-70">
          <Save size={18} /> {saving ? "Saving..." : "Save Portfolio"}
        </button>
        {status && <p className="rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{status}</p>}
      </div>
    </div>
  );
}

function SeoEditor({ content, setContent, token, onAuthError }) {
  const [draft, setDraft] = useState(content.seo || {});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(content.seo || {});
  }, [content._id, content.updatedAt]);

  async function save() {
    const newContent = { ...content, seo: draft };
    setContent(newContent);
    setSaving(true);
    setStatus("");
    try {
      const saved = await saveContent(newContent, token);
      setContent((prev) => ({ ...prev, ...saved }));
      setStatus("Saved successfully.");
    } catch (err) {
      if (isAuthError(err)) {
        onAuthError?.();
        return;
      }
      setStatus(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-extrabold">SEO settings</h3>
        <div className="grid gap-4">
          <Field label="Site title"><input className="admin-input" value={draft.siteTitle || ""} onChange={(e) => setDraft({ ...draft, siteTitle: e.target.value })} /></Field>
          <Field label="Meta title"><input className="admin-input" value={draft.metaTitle || ""} onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })} /></Field>
          <Field label="Meta description"><textarea className="admin-input min-h-28" value={draft.metaDescription || ""} onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })} /></Field>
          <Field label="SEO keywords"><textarea className="admin-input min-h-24" value={draft.keywords || ""} onChange={(e) => setDraft({ ...draft, keywords: e.target.value })} /></Field>
          <Field label="Open Graph image URL"><input className="admin-input" value={draft.ogImage || ""} onChange={(e) => setDraft({ ...draft, ogImage: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 font-bold text-white disabled:opacity-70"><Save size={18} /> {saving ? "Saving..." : "Save SEO"}</button>
          {status && <p className="rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{status}</p>}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-[#fff8fb] p-6 shadow-sm">
        <h3 className="text-xl font-extrabold">Search preview</h3>
        <p className="mt-5 text-sm text-green-700">drkfarhin.com</p>
        <p className="mt-1 text-xl font-bold text-blue-700">{draft.metaTitle || content.profile.name}</p>
        <p className="mt-2 leading-7 text-slate-600">{draft.metaDescription || content.profile.intro}</p>
        {draft.ogImage && <img src={draft.ogImage} alt="SEO preview" className="mt-5 h-52 w-full rounded-3xl object-cover" />}
      </div>
    </div>
  );
}

function AppointmentManager({ appointments, setAppointments, token }) {
  async function updateStatus(index, status) {
    const item = appointments[index];
    setAppointments((items) => items.map((row, itemIndex) => itemIndex === index ? { ...row, status } : row));
    if (item?._id) {
      try {
        const saved = await updateAppointment(item._id, { status }, token);
        setAppointments((items) => items.map((row, itemIndex) => itemIndex === index ? saved : row));
      } catch {
        setAppointments((items) => items.map((row, itemIndex) => itemIndex === index ? { ...row, status: item.status } : row));
      }
    }
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

function ListEditor({ type, items, onChange, token }) {
  const empty = type === "blog"
    ? { title: "", slug: "", excerpt: "", body: "", image: "", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), seoTitle: "", seoDescription: "", seoKeywords: "", published: true }
    : { title: "", url: "" };
  const labels = type === "blog" ? ["Title", "Excerpt", "Date"] : ["Title", "YouTube embed URL"];
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState("");

  function update(index, key, value) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  async function uploadBlogImage(index, file) {
    if (!file) return;
    setUploadingIndex(index);
    setUploadError("");
    try {
      const result = await uploadImage(file, token);
      update(index, "image", result.url);
    } catch (error) {
      setUploadError(error.message || "Image upload failed");
    } finally {
      setUploadingIndex(null);
    }
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
                <>
                  <Field label={labels[2]}><input className="admin-input" value={item.date} onChange={(e) => update(index, "date", e.target.value)} /></Field>
                  <Field label="Slug"><input className="admin-input" value={item.slug || slugify(item.title)} onChange={(e) => update(index, "slug", e.target.value)} /></Field>
                  <Field label="Blog image URL"><input className="admin-input" value={item.image || ""} onChange={(e) => update(index, "image", e.target.value)} /></Field>
                </>
              ) : (
                <Field label={labels[1]}><input className="admin-input" value={item.url} onChange={(e) => update(index, "url", e.target.value)} /></Field>
              )}
              {type === "blog" && <Field label={labels[1]}><textarea className="admin-input min-h-28 md:col-span-2" value={item.excerpt} onChange={(e) => update(index, "excerpt", e.target.value)} /></Field>}
              {type === "blog" && <Field label="Full blog body"><textarea className="admin-input min-h-44 md:col-span-2" value={item.body || ""} onChange={(e) => update(index, "body", e.target.value)} /></Field>}
              {type === "blog" && <Field label="SEO title"><input className="admin-input" value={item.seoTitle || ""} onChange={(e) => update(index, "seoTitle", e.target.value)} /></Field>}
              {type === "blog" && <Field label="SEO keywords"><input className="admin-input" value={item.seoKeywords || ""} onChange={(e) => update(index, "seoKeywords", e.target.value)} /></Field>}
              {type === "blog" && <Field label="SEO description"><textarea className="admin-input min-h-24 md:col-span-2" value={item.seoDescription || ""} onChange={(e) => update(index, "seoDescription", e.target.value)} /></Field>}
            </div>
            {type === "blog" && (
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px] md:items-center">
                <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-clinic bg-[#fff8fb] px-4 py-3 text-sm font-extrabold text-[#7b6074]">
                  {uploadingIndex === index ? "Uploading..." : "Upload Blog Image"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => uploadBlogImage(index, e.target.files?.[0])} />
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <input type="checkbox" checked={item.published !== false} onChange={(e) => update(index, "published", e.target.checked)} />
                  Published
                </label>
              </div>
            )}
            {uploadError && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{uploadError}</p>}
            {type === "blog" && item.image && <img src={item.image} alt={item.title} className="mt-3 h-48 w-full rounded-2xl object-cover" />}
            <button onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-bold text-red-600"><Trash2 size={15} /> Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyReel = () => ({ title: "", videoUrl: "", thumbnail: "" });

function ReelsEditor({ items, onChange, token }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState("");

  function update(index, key, value) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  async function uploadThumbnail(index, file) {
    if (!file) return;
    setUploadingIndex(index);
    setUploadError("");
    try {
      const result = await uploadImage(file, token);
      update(index, "thumbnail", result.url);
    } catch (error) {
      setUploadError(error.message || "Image upload failed");
    } finally {
      setUploadingIndex(null);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold">Reels</h3>
          <p className="mt-1 text-sm text-slate-500">Paste a YouTube or Facebook video link. Cards preview on hover (or tap on mobile). Six cards fit neatly in one row.</p>
        </div>
        <button onClick={() => onChange([...items, emptyReel()])} className="inline-flex items-center gap-2 rounded-2xl bg-clinic px-4 py-3 text-sm font-bold text-white"><Plus size={16} /> Add Reel</button>
      </div>
      {uploadError && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{uploadError}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const parsed = parseVideoUrl(item.videoUrl);
          const poster = item.thumbnail || parsed?.thumbnail;
          return (
            <div key={index} className="rounded-2xl border border-slate-100 p-4">
              <div className="grid gap-3">
                <Field label="Title"><input className="admin-input" value={item.title} onChange={(e) => update(index, "title", e.target.value)} /></Field>
                <Field label="Video link (YouTube or Facebook)"><input className="admin-input" placeholder="https://..." value={item.videoUrl} onChange={(e) => update(index, "videoUrl", e.target.value)} /></Field>
                {item.videoUrl && (
                  <p className="text-xs font-bold text-slate-500">
                    {parsed?.platform === "youtube" && "Detected: YouTube"}
                    {parsed?.platform === "facebook" && "Detected: Facebook"}
                    {parsed?.platform === "unknown" && "Link not recognized as YouTube or Facebook"}
                  </p>
                )}
                <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-clinic bg-[#fff8fb] px-4 text-sm font-extrabold text-[#7b6074]">
                  {uploadingIndex === index ? "Uploading..." : "Upload custom thumbnail (optional)"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => uploadThumbnail(index, e.target.files?.[0])} />
                </label>
              </div>
              {poster && <img src={poster} alt={item.title || "Reel thumbnail"} className="mt-3 aspect-[9/16] w-full rounded-2xl object-cover" />}
              <button onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-bold text-red-600"><Trash2 size={15} /> Remove</button>
            </div>
          );
        })}
        {!items.length && <p className="rounded-2xl bg-[#fff8fb] px-4 py-4 text-sm font-bold text-[#7b6074]">No reels yet. Add one to show it on the homepage.</p>}
      </div>
    </div>
  );
}

function Gallery({ token, onAuthError, content, setContent }) {
  const [draft, setDraft] = useState({ title: "", caption: "", image: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  async function handleMomentUpload(file) {
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      const result = await uploadImage(file, token);
      setDraft((current) => ({ ...current, image: result.url }));
    } catch (error) {
      setUploadError(error.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function addMoment() {
    if (!draft.image) return;
    const newMoment = {
      title: draft.title || "Care moment",
      caption: draft.caption || "Uploaded from admin gallery.",
      image: draft.image
    };
    const newContent = { ...content, moments: [newMoment, ...(content.moments || [])] };
    setContent(newContent);
    setDraft({ title: "", caption: "", image: "" });
    setSaving(true);
    setSaveStatus("");
    try {
      const saved = await saveContent(newContent, token);
      setContent((prev) => ({ ...prev, ...saved }));
      setSaveStatus("Gallery saved.");
    } catch (err) {
      if (isAuthError(err)) {
        onAuthError?.();
        return;
      }
      setSaveStatus(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMoment(index) {
    const newContent = { ...content, moments: content.moments.filter((_, i) => i !== index) };
    setContent(newContent);
    setSaving(true);
    setSaveStatus("");
    try {
      const saved = await saveContent(newContent, token);
      setContent((prev) => ({ ...prev, ...saved }));
      setSaveStatus("Gallery saved.");
    } catch (err) {
      if (isAuthError(err)) {
        onAuthError?.();
        return;
      }
      setSaveStatus(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-extrabold">Image CMS</h3>
      <p className="mt-2 text-slate-500">Images upload to Cloudinary and return a live hosted URL for website use.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-slate-100 bg-[#fff8fb] p-5">
          <h4 className="text-lg font-extrabold">Upload new gallery moment</h4>
          <div className="mt-4 grid gap-3">
            <input className="admin-input" placeholder="Moment title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <textarea className="admin-input min-h-24" placeholder="Short caption" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
            <input className="admin-input" placeholder="Cloudinary image URL" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
            <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-clinic bg-white px-5 py-4 text-sm font-extrabold text-[#7b6074]">
              {uploading ? "Uploading to Cloudinary..." : "Choose Image & Upload"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleMomentUpload(e.target.files?.[0])} />
            </label>
            {uploadError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{uploadError}</p>}
            {draft.image && <img src={draft.image} alt="Uploaded preview" className="h-56 w-full rounded-2xl object-cover" />}
            <button onClick={addMoment} disabled={saving} className="rounded-2xl bg-ink px-5 py-3 font-bold text-white disabled:opacity-70">{saving ? "Saving..." : "Add to Gallery"}</button>
            {saveStatus && <p className="rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{saveStatus}</p>}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
        <img className="h-80 w-full rounded-3xl object-contain bg-pearl p-4" src={content.profile.heroImage} alt="Doctor cutout" />
        <img className="h-80 w-full rounded-3xl object-cover" src={content.profile.portraitImage} alt="Doctor portrait" />
        </div>
      </div>
      <h4 className="mt-8 text-lg font-extrabold">Care moments gallery</h4>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.moments.map((item, index) => (
          <div key={item.image} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <img className="h-48 w-full object-cover" src={item.image} alt={item.title} />
            <div className="p-4">
              <p className="font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{item.caption}</p>
              <button
                onClick={() => deleteMoment(index)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500"
              >
                <Trash2 size={13} /> Delete
              </button>
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
  const [token, setToken] = useState(() => localStorage.getItem("doctorAdminToken") || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [draftContent, setDraftContent] = useState(content);
  const [contentDirty, setContentDirty] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const draftContentRef = useRef(content);
  const title = useMemo(() => tabs.find((tab) => tab.id === active)?.label, [active]);
  const hasSectionSave = ["home", "profile", "portfolio", "seo", "gallery"].includes(active);

  useEffect(() => {
    if (!token) {
      setContentLoading(false);
      return;
    }

    let activeLoad = true;
    setContentLoading(true);
    getContent()
      .then((remoteContent) => {
        if (!activeLoad || !remoteContent) return;
        setDraftContent(remoteContent);
        draftContentRef.current = remoteContent;
        setContent(remoteContent);
        setContentDirty(false);
        setStatus("");
      })
      .catch((error) => {
        if (activeLoad) {
          setStatus(error.message || "Content could not load from backend.");
        }
      })
      .finally(() => {
        if (activeLoad) {
          setContentLoading(false);
        }
      });

    return () => {
      activeLoad = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    getAppointments(token)
      .then((items) => setAppointments(items.length ? items : appointments))
      .catch(() => setStatus("Appointments could not load from backend yet."));
  }, [token]);

  function updateDraftContent(update) {
    setContentDirty(true);
    setDraftContent((current) => {
      const next = typeof update === "function" ? update(current) : update;
      draftContentRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    setContent(draftContent);
  }, [draftContent, setContent]);

  async function persistContent() {
    setSaving(true);
    setStatus("");
    try {
      const saved = await saveContent(draftContentRef.current, token);
      setContent((prev) => ({ ...prev, ...saved }));
      setDraftContent((prev) => ({ ...prev, ...saved }));
      draftContentRef.current = { ...draftContentRef.current, ...saved };
      setContentDirty(false);
      setStatus("Saved to backend successfully.");
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      setStatus(error.message || "Save failed. Check backend env and login.");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    localStorage.removeItem("doctorAdminToken");
    setToken("");
  }

  function handleAuthError() {
    localStorage.removeItem("doctorAdminToken");
    setToken("");
    setStatus("Session expired after API change. Please login again, then save.");
  }

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  const adminContent = draftContent || content;

  if (contentLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-pearl p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <p className="text-sm font-bold uppercase tracking-wide text-clinic">Doctor CMS</p>
          <h1 className="mt-2 text-2xl font-extrabold">Loading content...</h1>
        </div>
      </main>
    );
  }

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
              {!hasSectionSave && (
                <button onClick={persistContent} className="inline-flex items-center gap-2 rounded-2xl bg-clinic px-4 py-3 text-sm font-bold text-white"><Save size={17} /> {saving ? "Saving..." : "Save Backend"}</button>
              )}
              <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"><Home size={17} /> Website</Link>
              <button onClick={logout} className="hidden items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white sm:inline-flex"><LogOut size={17} /> Logout</button>
            </div>
          </div>
          {status && <p className="mt-3 rounded-2xl bg-[#fff8fb] px-4 py-3 text-sm font-bold text-[#7b6074]">{status}</p>}
          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActive(tab.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${active === tab.id ? "bg-ink text-white" : "bg-white text-slate-600"}`}>{tab.label}</button>
            ))}
          </div>
        </header>
        <div className="p-4 lg:p-8">
          {active === "dashboard" && <Dashboard content={adminContent} appointments={appointments} />}
          {active === "home" && <HomeEditor content={adminContent} setContent={updateDraftContent} token={token} onAuthError={handleAuthError} />}
          {active === "profile" && <ProfileEditor content={adminContent} setContent={updateDraftContent} token={token} onAuthError={handleAuthError} />}
          {active === "portfolio" && <PortfolioEditor content={adminContent} setContent={updateDraftContent} token={token} onAuthError={handleAuthError} />}
          {active === "seo" && <SeoEditor content={adminContent} setContent={updateDraftContent} token={token} onAuthError={handleAuthError} />}
          {active === "appointments" && <AppointmentManager appointments={appointments} setAppointments={setAppointments} token={token} />}
          {active === "reels" && <ReelsEditor items={adminContent.reels || []} token={token} onChange={(reels) => updateDraftContent((prev) => ({ ...prev, reels }))} />}
          {active === "media" && <ListEditor type="video" items={adminContent.videos} token={token} onChange={(videos) => updateDraftContent((prev) => ({ ...prev, videos }))} />}
          {active === "blog" && <ListEditor type="blog" items={adminContent.blogs} token={token} onChange={(blogs) => updateDraftContent((prev) => ({ ...prev, blogs }))} />}
          {active === "gallery" && <Gallery token={token} onAuthError={handleAuthError} content={adminContent} setContent={updateDraftContent} />}
        </div>
      </section>
    </main>
  );
}
