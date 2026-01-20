"use client";

import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  name?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, className = "", ...props }, ref) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label ? <label className="text-sm font-medium text-zinc-700">{label}</label> : null}
      <input
        ref={ref}
        {...props}
        className="rounded-md border px-3 py-2 bg-white text-sm text-zinc-900 placeholder:text-zinc-400"
      />
    </div>
  );
});

Input.displayName = "Input";

export { Input };
