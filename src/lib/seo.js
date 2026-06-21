export function slugify(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function applySeo({ title, description, keywords, image } = {}) {
  if (title) {
    document.title = title;
  }

  const tags = [
    ["name", "description", description],
    ["name", "keywords", keywords],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:image", image],
    ["property", "twitter:card", image ? "summary_large_image" : "summary"]
  ];

  tags.forEach(([type, key, value]) => {
    if (!value) return;
    let meta = document.head.querySelector(`meta[${type}="${key}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(type, key);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", value);
  });
}
