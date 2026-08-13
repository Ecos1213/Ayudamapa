import React from "react";

export default function NeedTag({ label, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
      <Icon size={14} />
      {label}
    </span>
  );
}
