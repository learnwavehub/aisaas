"use client";

import * as React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, className = "", children, ...props }, ref) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label ? <label className="text-sm font-medium text-zinc-700">{label}</label> : null}
      <select
        ref={ref}
        {...props}
        className="rounded-md border px-3 py-2 bg-white text-sm text-zinc-900"
      >
        {children}
      </select>
    </div>
  );
});

Select.displayName = "Select";

export { Select };
