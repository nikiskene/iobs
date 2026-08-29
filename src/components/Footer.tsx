// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('logo_url')
        .eq('is_active', true)
        .maybeSingle();

      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <Link to="/" className="flex items-center">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-10 w-auto object-contain"
                />
              )}
            </Link>

            <p className="mt-3 max-w-xs text-sm text-zinc-500">
              A platform for rethinking the systems that shape our future.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm">
            <Link
              to="/about"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              About
            </Link>

            <Link
              to="/thesis"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Thesis
            </Link>

            <Link
              to="/our-team"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Team
            </Link>

            <Link
              to="/join"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Join
            </Link>

            <Link
              to="/legal"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Legal / Impressum
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} WorldOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
