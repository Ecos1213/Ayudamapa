import SiteCard from "./SiteCard";

export default function SitesList({ sites }) {
  if (sites.length === 0) {
    return (
      <p className="text-sm text-neutral-500 text-center py-10">
        No hay sitios en esta categoría por ahora.
      </p>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto pr-1 mt-6">
      <div className="grid sm:grid-cols-2 gap-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}