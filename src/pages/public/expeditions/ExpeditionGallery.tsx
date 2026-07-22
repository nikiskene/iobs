import type { ExpeditionPhoto } from '../../../lib/types';

export default function ExpeditionGallery({
  photos,
}: {
  photos: ExpeditionPhoto[];
}) {
  if (photos.length === 0) return null;

  return (
    <section className="border-t border-white/5 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Impressions
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.photo_url}
              alt={photo.alt_text || ''}
              className="aspect-[4/5] rounded-2xl object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  );
}