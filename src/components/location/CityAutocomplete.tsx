// src/components/location/CityAutocomplete.tsx
import { useEffect, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';

import { searchCities, type CityResult } from '../../lib/mapbox';

type Props = {
  value: string;
  onSelect: (result: CityResult) => void;
  onClear: () => void;
};

export default function CityAutocomplete({ value, onSelect, onClear }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (query.trim().length < 2 || query === value) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      const cities = await searchCities(query);
      setResults(cities);
      setOpen(true);
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(result: CityResult) {
    setQuery(result.label);
    setOpen(false);
    onSelect(result);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setOpen(false);
    onClear();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        City
      </label>

      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Choose your city"
          className="w-full rounded-md border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-white placeholder-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            aria-label="Clear city"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mt-1.5 text-xs text-zinc-500">
        Choose your city. We use the city center for the member map, not your exact address.
      </p>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[#111] shadow-xl">
          {loading ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={`${result.label}-${result.lat}-${result.lng}`}
                type="button"
                onClick={() => handleSelect(result)}
                className="block w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {result.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-500">No cities found.</div>
          )}
        </div>
      )}
    </div>
  );
}