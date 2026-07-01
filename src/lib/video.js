const YOUTUBE_PATTERN = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;

export function parseVideoUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  const ytMatch = trimmed.match(YOUTUBE_PATTERN);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      platform: "youtube",
      previewEmbedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&modestbranding=1&rel=0`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  if (/facebook\.com|fb\.watch/.test(trimmed)) {
    return {
      platform: "facebook",
      previewEmbedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&autoplay=true&mute=true&show_text=false`,
      thumbnail: null
    };
  }

  return { platform: "unknown", previewEmbedUrl: null, thumbnail: null };
}
