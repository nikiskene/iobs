// src/pages/admin/AdminCategoryPage.tsx
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { adminNavGroups } from '../../components/admin/adminNav';

type AdminCategoryPageProps = {
  title: string;
};

export default function AdminCategoryPage({ title }: AdminCategoryPageProps) {
  const group = adminNavGroups.find((item) => item.title === title);

  if (!group) return <Navigate to="/admin" replace />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Admin
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-white">
          {group.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          {group.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {group.links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={`${group.title}-${link.label}`}
              to={link.to}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2 className="text-lg font-medium text-white">
                    {link.label}
                  </h2>

                  {link.description && (
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {link.description}
                    </p>
                  )}
                </div>

                <ArrowRight className="mt-1 h-4 w-4 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-zinc-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}