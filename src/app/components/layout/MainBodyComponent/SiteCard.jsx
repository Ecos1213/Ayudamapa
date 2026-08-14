import React from "react";
import { MapPin, Navigation } from "lucide-react";

import NeedTag from "./NeedTag";

function timeAgo(mins) {
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  return `hace ${h} h`;
}

export default function SiteCard({ site }) {
    const isRefugio = site.type === "refugio";
    const mapsUrl = `https://www.google.com/maps?q=${site.lat},${site.lng}`;

  return (
    <div
      className={`rounded-xl p-4 bg-white dark:bg-neutral-900 ${
        site.urgent
          ? "border-2 border-red-500"
          : "border border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md ${
              site.urgent
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : isRefugio
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {site.urgent ? site.type.charAt(0).toUpperCase() + site.type.slice(1) + " — urgente" : site.type.charAt(0).toUpperCase() + site.type.slice(1)}
          </span>
          <p className="font-medium text-[15px] mt-2 text-neutral-900 dark:text-neutral-100">
            {site.name}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{site.city}</p>
        </div>
        <span className="text-xs text-neutral-400 whitespace-nowrap">
          {timeAgo(site.updatedMinutesAgo)}
        </span>
      </div>

        {/* Dirección + geolocalización */}
        <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-1.5 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
            <MapPin size={15} className="mt-0.5 shrink-0" />
            <span>{site.address}</span>
            <Navigation size={13} className="mt-0.5 shrink-0" />
        </a>

        {/* Estado corto */}
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mt-2">
            {site.status}
        </p>

        {/* Resumen / descripción más larga */}
        {site.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-3">
            {site.description}
            </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-3">
            {site.needs.map((need) => (
                <NeedTag key={need.label} {...need} />
            ))}
        </div>
    </div>
  );
}