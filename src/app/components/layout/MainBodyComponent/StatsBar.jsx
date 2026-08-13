import StatCard from "./StatsCard";

export default function StatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      <StatCard label="Personas atrapadas" value={stats.atrapadas} danger />
      <StatCard label="Sitios activos" value={stats.sitios} />
      <StatCard label="Refugios abiertos" value={stats.refugios} />
      <StatCard label="Voluntarios pedidos" value={stats.voluntarios} />
    </div>
  );
}