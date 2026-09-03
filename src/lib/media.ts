const SUPABASE_PUBLIC_OBJECT = '/storage/v1/object/public/';
const SUPABASE_PUBLIC_RENDER = '/storage/v1/render/image/public/';

export function optimizedImageUrl(source?: string | null, width = 1600, quality = 72) {
  if (!source || !source.includes(SUPABASE_PUBLIC_OBJECT)) return source || '';
  try {
    const url = new URL(source);
    url.pathname = url.pathname.replace(SUPABASE_PUBLIC_OBJECT, SUPABASE_PUBLIC_RENDER);
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', String(quality));
    url.searchParams.set('resize', 'cover');
    url.searchParams.set('format', 'webp');
    return url.toString();
  } catch {
    return source;
  }
}

export function viewportImageWidth(desktop = 1600, mobile = 900) {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches ? mobile : desktop;
}
