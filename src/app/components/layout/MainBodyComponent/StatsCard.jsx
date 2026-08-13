
export default function StatCard({ label, value, danger }) {
  return (
    <div
      className={`rounded-lg p-4 ${
        danger ? "bg-red-50 dark:bg-red-950" : ""
      }`}
    >
      <p
        className={`text-sm mb-1 ${
          danger ? "text-red-700 dark:text-red-300" : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-medium ${
          danger ? "text-red-700 dark:text-red-300" : "text-neutral-900 dark:text-neutral-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}