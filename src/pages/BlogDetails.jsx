import { useContext, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, Stethoscope } from "lucide-react";
import { Header } from "./App.jsx";
import { SiteContext } from "../siteContext.jsx";
import { applySeo, slugify } from "../lib/seo.js";

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const { content } = useContext(SiteContext);
  const post = content.blogs.find((item) => item.published !== false && (item.slug || slugify(item.title)) === slug);
  const related = content.blogs.filter((item) => item.published !== false && (item.slug || slugify(item.title)) !== slug).slice(0, 3);

  useEffect(() => {
    if (!post) return;
    applySeo({
      title: post.seoTitle || `${post.title} | ${content.profile.name}`,
      description: post.seoDescription || post.excerpt,
      keywords: post.seoKeywords,
      image: post.image || content.seo?.ogImage || content.profile.portraitImage
    });
  }, [content, post]);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#fff8fb] text-ink">
        <Header />
        <section className="mx-auto max-w-3xl px-4 pb-20 pt-36 text-center">
          <h1 className="text-5xl font-extrabold">Blog not found</h1>
          <p className="mt-4 text-slate-600">The article may have been moved or unpublished.</p>
          <Link to="/blog" className="mt-8 inline-flex items-center gap-2 rounded-full bg-clinic px-6 py-3 font-extrabold text-white">
            <ArrowLeft size={18} /> Back to Blog
          </Link>
        </section>
      </main>
    );
  }

  const paragraphs = (post.body || post.excerpt || "").split(/\n+/).filter(Boolean);

  return (
    <main className="min-h-screen bg-white text-ink">
      <Header />
      <article className="relative overflow-hidden bg-[#fff8fb] px-4 pb-16 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(241,141,177,0.18),transparent_32%),radial-gradient(circle_at_12%_72%,rgba(180,153,172,0.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl">
          <Link to="/blog" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-extrabold text-[#7b6074] shadow-sm">
            <ArrowLeft size={18} /> Blog
          </Link>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-petal bg-white px-4 py-2 text-sm font-extrabold text-clinic">
            <CalendarDays size={16} /> {post.date}
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{post.excerpt}</p>
        </div>
      </article>

      <section className="px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <img src={post.image || content.profile.portraitImage} alt={post.title} className="mb-8 h-[460px] w-full rounded-[34px] object-cover shadow-soft" />
            <div className="prose prose-lg max-w-none">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-6 text-lg leading-9 text-slate-700">{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-[28px] bg-ink p-6 text-white shadow-soft">
              <Stethoscope className="text-clinic" />
              <h2 className="mt-4 text-2xl font-extrabold">{content.profile.name}</h2>
              <p className="mt-3 leading-7 text-white/70">{content.profile.title}</p>
              <Link to="/contact" className="mt-6 inline-flex items-center rounded-full bg-clinic px-5 py-3 font-extrabold text-white">
                Book Appointment
              </Link>
            </div>
            {related.length > 0 && (
              <div className="rounded-[28px] border border-slate-100 bg-[#fff8fb] p-6">
                <h3 className="text-xl font-extrabold">Related articles</h3>
                <div className="mt-4 space-y-3">
                  {related.map((item) => (
                    <Link key={item.title} to={`/blog/${item.slug || slugify(item.title)}`} className="block rounded-2xl bg-white p-4 font-bold text-slate-700 shadow-sm">
                      <CheckCircle2 size={17} className="mb-2 text-clinic" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
