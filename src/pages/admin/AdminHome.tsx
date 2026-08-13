// src/pages/admin/AdminHome.tsx
import { Link } from 'react-router-dom';
import { adminNavGroups } from '../../components/admin/adminNav';

const LOGO = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V2a%20transparent.png';

export default function AdminHome() {
  const groups = adminNavGroups.filter((group) => group.title !== 'Home');

  return (
    <div className="space-y-8">
      <div>
        <img src={LOGO} alt="Institute of Beautiful Success" className="mb-8 h-24 w-auto object-contain object-left" />
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Private administration</p>

        <h1 className="mt-3 text-3xl font-semibold text-white">
          Institute of Beautiful Success
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Manage the Beautiful Success Awards, cases, experiences, messages and the existing community from one private administration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const Icon = group.links[0].icon;

          return (
            <Link
              key={group.title}
              to={group.to}
              className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <Icon className="h-5 w-5" />
              </div>

              <h2 className="text-lg font-medium text-white">
                {group.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {group.description}
              </p>

              <div className="mt-5 text-xs uppercase tracking-[0.22em] text-zinc-500">
                {group.links.length} sections
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
