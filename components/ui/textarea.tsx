"use client";

import * as React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, className = "", ...props }, ref) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label ? <label className="text-sm font-medium text-zinc-700">{label}</label> : null}
      <textarea
        ref={ref}
        {...props}
        className="rounded-md border px-3 py-2 bg-white text-sm text-zinc-900 placeholder:text-zinc-400"
      />
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
