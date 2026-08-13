const YOUTUBE_PATTERN = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;
const FACEBOOK_REEL_PATTERN = /facebook\.com\/reel\/(\d+)/;

function normalizeFacebookVideoUrl(url) {
  const reelMatch = url.match(FACEBOOK_REEL_PATTERN);
  if (reelMatch) {
    return `https://www.facebook.com/reel/${reelMatch[1]}/`;
  }

  return url;
}

export function parseVideoUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  const ytMatch = trimmed.match(YOUTUBE_PATTERN);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      platform: "youtube",
      previewEmbedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=1&playsinline=1&modestbranding=1&rel=0`,
      staticEmbedUrl: `https://www.youtube.com/embed/${id}?controls=1&playsinline=1&modestbranding=1&rel=0`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  if (/facebook\.com|fb\.watch/.test(trimmed)) {
    const encoded = encodeURIComponent(normalizeFacebookVideoUrl(trimmed));
    return {
      platform: "facebook",
      previewEmbedUrl: `https://www.facebook.com/plugins/video.php?height=640&href=${encoded}&autoplay=true&mute=false&show_text=false&width=360&t=0`,
      staticEmbedUrl: `https://www.facebook.com/plugins/video.php?height=640&href=${encoded}&autoplay=false&mute=false&show_text=false&width=360&t=0`,
      thumbnail: null
    };
  }

  return { platform: "unknown", previewEmbedUrl: null, thumbnail: null };
}
