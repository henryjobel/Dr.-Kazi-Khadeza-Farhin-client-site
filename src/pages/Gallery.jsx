import { useContext } from "react";
import { ArrowUpRight, Camera, HeartHandshake, Images, Sparkles } from "lucide-react";
import { Header } from "./App.jsx";
import { SiteContext } from "../siteContext.jsx";

const filters = ["All moments", "Newborn care", "Family visits", "Doctor profile"];

export default function GalleryPage() {
  const { content } = useContext(SiteContext);
  const featured = content.moments[0];

  return (
    <main className="min-h-screen bg-[#fff8fb] text-ink">
      <Header />
      <section className="relative overflow-hidden px-4 pb-16 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(241,141,177,0.18),transparent_30%),radial-gradient(circle_at_14%_48%,rgba(180,153,172,0.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-[1320px]">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-petal bg-white px-4 py-2 text-sm font-extrabold text-[#7b6074] shadow-sm">
                <Camera size={17} />
                Raw Gallery
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight md:text-7xl">
                Care moments from real patient journeys
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                A warm visual portfolio of consultation, pregnancy care, newborn visits and family follow-up moments.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {filters.map((item) => (
                  <span key={item} className="rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <article className="relative min-h-[430px] overflow-hidden rounded-[34px] bg-white shadow-soft">
              <img src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 max-w-xl p-7 text-white">
                <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-blush">
                  <Sparkles size={16} fill="currentColor" /> Featured moment
                </p>
                <h2 className="mt-2 text-3xl font-extrabold">{featured.title}</h2>
                <p className="mt-2 leading-7 text-white/80">{featured.caption}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-bold uppercase tracking-wide text-clinic">Moments</p>
              <h2 className="mt-2 text-4xl font-extrabold">Gallery collection</h2>
            </div>
            <a href="/#appointment" className="inline-flex items-center gap-2 rounded-full bg-clinic px-6 py-3 font-extrabold text-white">
              Book Appointment <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {content.moments.map((item, index) => (
              <article key={item.image} className="mb-5 break-inside-avoid overflow-hidden rounded-[30px] border border-petal/60 bg-white shadow-sm">
                <img src={item.image} alt={item.title} className={`w-full object-cover ${index % 3 === 0 ? "h-[430px]" : "h-[340px]"}`} />
                <div className="p-5">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fbf0f4] px-3 py-1.5 text-xs font-extrabold text-[#7b6074]">
                    <Images size={14} /> Care moment
                  </div>
                  <h3 className="text-xl font-extrabold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbf0f4] px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {["Pregnancy care", "Fertility guidance", "Family follow-up"].map((item) => (
            <div key={item} className="rounded-[28px] bg-white p-7 shadow-sm">
              <HeartHandshake className="text-clinic" />
              <h3 className="mt-5 text-2xl font-extrabold">{item}</h3>
              <p className="mt-3 leading-7 text-slate-600">Organized, compassionate support for women&apos;s health decisions and continuity of care.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
