import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpenText, CalendarDays, CheckCircle2, Stethoscope } from "lucide-react";
import { Header } from "./App.jsx";
import { SiteContext } from "../siteContext.jsx";
import { slugify } from "../lib/seo.js";

const topics = [
  "Infertility consultation",
  "PCOS & endometriosis",
  "Pregnancy planning",
  "IVF, ART and IUI guidance"
];

export default function BlogPage() {
  const { content } = useContext(SiteContext);
  const posts = content.blogs
    .filter((post) => post.published !== false)
    .map((post, index) => ({
      ...post,
      slug: post.slug || slugify(post.title),
      image: post.image || content.moments[index + 1]?.image || content.profile.portraitImage
    }));

  return (
    <main className="min-h-screen bg-white text-ink">
      <Header />
      <section className="relative overflow-hidden bg-[#fff8fb] px-4 pb-16 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_28%,rgba(241,141,177,0.18),transparent_32%),radial-gradient(circle_at_12%_76%,rgba(200,164,190,0.18),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-petal bg-white px-4 py-2 text-sm font-extrabold text-[#7b6074] shadow-sm">
              <BookOpenText size={17} />
              Doctor&apos;s Blog
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-tight md:text-7xl">
              Clear notes for fertility, pregnancy and women&apos;s health
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Helpful articles, treatment education and patient-friendly guidance from Dr. Kazi Khadeza Farhin&apos;s specialist practice.
            </p>
            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <div key={topic} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-bold text-slate-700 shadow-sm">
                  <CheckCircle2 size={19} className="text-clinic" />
                  {topic}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src={content.profile.portraitImage} alt={content.profile.name} className="h-[520px] w-full rounded-[36px] object-cover shadow-soft" />
            <div className="absolute -bottom-6 left-6 right-6 rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-clinic">
                <Stethoscope size={16} /> Specialist insights
              </p>
              <p className="mt-2 text-xl font-extrabold">{content.profile.title}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-bold uppercase tracking-wide text-clinic">Latest Articles</p>
              <h2 className="mt-2 text-4xl font-extrabold">Patient education library</h2>
            </div>
            <a href="/contact" className="inline-flex items-center gap-2 rounded-full border border-petal bg-white px-6 py-3 font-extrabold text-ink shadow-sm">
              Ask for guidance <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.title} className="overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                <img src={post.image} alt={post.title} className="h-72 w-full object-cover" />
                <div className="p-7">
                  <p className="flex items-center gap-2 text-sm font-extrabold text-clinic">
                    <CalendarDays size={16} /> {post.date}
                  </p>
                  <h3 className="mt-3 text-2xl font-extrabold">{post.title}</h3>
                  <p className="mt-4 leading-7 text-slate-600">{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fbf0f4] px-5 py-3 font-extrabold text-[#7b6074]">
                    Read article <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
