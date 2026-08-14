import { useState } from "react";
import { MapPin } from "lucide-react";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "critico", label: "Crítico" },
  { key: "refugio", label: "Refugios" },
  { key: "escombros", label: "Escombros" },
];

export default function FilterBar({ filter, setFilter }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <MapPin size={20} className="text-blue-600" />
        <h1 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Mapa de ayuda — Valle y Eje Cafetero
        </h1>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((filtroUnitario) => (
          <button
            key={filtroUnitario.key}
            onClick={() => setFilter(filtroUnitario.key)}
            className={`text-sm px-3 h-8 rounded-md border transition-colors ${
              filter === filtroUnitario.key
                ? filtroUnitario.key === "critico"
                  ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300"
                  : "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
            }`}
          >
            {filtroUnitario.label}
          </button>
        ))}
      </div>
    </div>
  );
}