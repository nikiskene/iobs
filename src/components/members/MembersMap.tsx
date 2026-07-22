// src/components/members/MembersMap.tsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { MemberLocation } from '../../hooks/useMemberLocations';

type Props = {
  members: MemberLocation[];
};

const VIENNA: [number, number] = [48.2082, 16.3738];

export default function MembersMap({ members }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      scrollWheelZoom: false,
    }).setView(VIENNA, 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (members.length === 0) {
      map.setView(VIENNA, 3);
      return;
    }

    const centerLat =
      members.reduce((sum, member) => sum + member.geo_lat, 0) / members.length;
    const centerLng =
      members.reduce((sum, member) => sum + member.geo_lng, 0) / members.length;

    map.setView([centerLat, centerLng], members.length === 1 ? 5 : 3);

    members.forEach((member) => {
      const name = member.full_name || 'Explorer';
      const location = member.location_label || member.city || 'Location on file';

      L.marker([member.geo_lat, member.geo_lng], {
        icon: createAvatarIcon(member.photo_url, name),
      })
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(name)}</strong><br/>${escapeHtml(location)}`);
    });
  }, [members]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="font-semibold text-white">WorldOS Explorer Map</h2>
        <p className="mt-1 text-sm text-zinc-400">
          City-level locations only. No private addresses. No exact GPS.
        </p>
      </div>

      <div
        ref={containerRef}
        className="h-[320px] w-full bg-zinc-950 sm:h-[420px]"
      />
    </div>
  );
}

function createAvatarIcon(photoUrl: string | null, name: string) {
  const initial = escapeHtml((name[0] || '?').toUpperCase());

  const inner = photoUrl
    ? `<img src="${escapeHtml(photoUrl)}" alt="" />`
    : `<span>${initial}</span>`;

  return L.divIcon({
    className: 'worldos-avatar-marker',
    html: `<div class="worldos-avatar-marker-inner">${inner}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return map[char];
  });
}