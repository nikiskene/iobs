// src/pages/public/ThesisPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ThesisCategory, Thesis } from '../../lib/types';

export default function ThesisPage() {
  const { slug } = useParams<{ slug: string }>();
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ThesisCategory | null>(null);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('thesis_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      const cats = (data as ThesisCategory[]) || [];
      setCategories(cats);
      setSelectedCategory(slug ? cats.find((cat) => cat.slug === slug) || null : null);
      setLoading(false);
    };

    fetchCategories();
  }, [slug]);

  useEffect(() => {
    const fetchTheses = async () => {
      if (!selectedCategory) {
        setTheses([]);
        return;
      }

      const { data } = await supabase
        .from('theses')
        .select('*, thesis_categories(*), thesis_media(*)')
        .eq('category_id', selectedCategory.id)
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('display_order');

      setTheses((data as Thesis[]) || []);
    };

    fetchTheses();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] pt-16 text-white">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <CategoryDetail
        category={selectedCategory}
        theses={theses}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return <CategoryOverview categories={categories} />;
}

function CategoryOverview({ categories }: { categories: ThesisCategory[] }) {
  return (
    <div className="bg-[#0A0A0A] pt-16 text-white">
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">
            WorldOS
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
            Thesis
          </h1>

          <p className="mt-4 max-w-2xl text-xl text-zinc-400">
            How to apply the principles of WorldOS in real-world challenges.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/thesis/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              style={{ background: `linear-gradient(135deg, ${cat.color_hex}18, #111)` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: cat.color_hex }}
              />

              <div className="flex items-center justify-between gap-6">
                <h2 className="text-2xl font-bold">{cat.name}</h2>
                <ArrowRight className="h-5 w-5 text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-white" />
              </div>

              {cat.description && (
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-zinc-400">
                  {cat.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryDetail({
  category,
  theses,
  onBack,
}: {
  category: ThesisCategory;
  theses: Thesis[];
  onBack: () => void;
}) {
  return (
    <div className="bg-[#0A0A0A] pt-16 text-white">
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All Categories
          </button>

          <div className="flex items-center gap-4">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color_hex }}
            />

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {category.name}
            </h1>
          </div>

          {category.description && (
            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
              {category.description}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          {theses.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              No published theses in this category yet.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {theses.map((thesis) => (
                <ThesisCard
                  key={thesis.id}
                  thesis={thesis}
                  categoryColor={category.color_hex}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ThesisCard({
  thesis,
  categoryColor,
}: {
  thesis: Thesis;
  categoryColor: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const image = thesis.thesis_media?.sort(
    (a, b) => a.display_order - b.display_order
  )[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20">
      {image?.file_url ? (
        <img
          src={image.file_url}
          alt={image.alt_text || thesis.title}
          className="h-56 w-full object-cover"
        />
      ) : (
        <div
          className="h-56 w-full"
          style={{ background: `linear-gradient(135deg, ${categoryColor}35, #111)` }}
        />
      )}

      <div className="p-6">
        {thesis.is_featured && (
          <span
            className="mb-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            Featured
          </span>
        )}

        <h3 className="text-xl font-bold leading-tight">{thesis.title}</h3>

        {thesis.subheadline && (
          <p className="mt-1 text-sm text-zinc-400">{thesis.subheadline}</p>
        )}

        {thesis.short_explanation && (
          <p className="mt-4 leading-relaxed text-zinc-400">
            {thesis.short_explanation}
          </p>
        )}

        {thesis.body && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-sky-400 transition-colors hover:text-sky-300"
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>

            {expanded && (
              <div className="mt-3 whitespace-pre-line border-t border-white/5 pt-4 text-sm leading-relaxed text-zinc-400">
                {thesis.body}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}