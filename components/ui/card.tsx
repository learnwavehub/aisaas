import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between", className)}>{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold">{children}</h3>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 text-sm text-zinc-600">{children}</div>;
}

export { Card, CardHeader, CardTitle, CardContent };
