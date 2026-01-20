"use client";

import React, { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";

export function NavigationMenu({ children }: { children: React.ReactNode }) {
  return <nav className="relative">{children}</nav>;
}

export function NavigationMenuList({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

export function NavigationMenuItem({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children) as React.ReactElement[];
  const trigger = items.find(
    (c) => isValidElement(c) && (c.type as any)?.displayName === "NavigationMenuTrigger"
  ) as React.ReactElement | undefined;
  const content = items.find(
    (c) => isValidElement(c) && (c.type as any)?.displayName === "NavigationMenuContent"
  ) as React.ReactElement | undefined;

  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  function openWithClear() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  function closeWithDelay() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      className="relative"
      ref={containerRef}
      onMouseEnter={openWithClear}
      onMouseLeave={closeWithDelay}
    >
      {trigger &&
        cloneElement(trigger, {
          onClick: () => setOpen((s: boolean) => !s),
          'aria-expanded': open,
          open,
        } as React.HTMLAttributes<HTMLElement>)} {/* Add type assertion here */}

      {content && (
        <div className="absolute right-0 mt-2 z-40" style={{ display: open ? "block" : "none" }}>
          {cloneElement(content, { 
            open, 
            close: () => setOpen(false) 
          } as React.HTMLAttributes<HTMLElement>)} {/* Add type assertion here */}
        </div>
      )}
    </div>
  );
}

export function NavigationMenuTrigger({ children, className, open, ...props }: any) {
  return (
    <button
      {...props}
      className={"text-sm font-medium px-3 py-1 rounded " + (open ? "bg-zinc-100" : "") + (className ? ` ${className}` : "")}
      type="button"
    >
      <span className="flex items-center gap-2">{children}</span>
    </button>
  );
}
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export function NavigationMenuContent({ children, className, close }: { children: React.ReactNode; className?: string; close?: () => void }) {
  const mapped = Children.map(children, (child) => {
    // Only forward `close` to React component children (not DOM elements)
    if (isValidElement(child) && typeof (child as any).type !== "string") {
      return cloneElement(child as React.ReactElement, { ...(child as any).props, close });
    }
    return child;
  });

  return (
    <div className={"rounded-lg bg-white border shadow-lg p-8 flex flex-col items-start justify-start " + (className ?? "")}>
      {mapped}
    </div>
  );
}
NavigationMenuContent.displayName = "NavigationMenuContent";

export function NavigationMenuIndicator() {
  return <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded" />;
}

export function NavigationMenuViewport({ children }: { children?: React.ReactNode }) {
  return <div className="mt-2">{children}</div>;
}

export function NavigationMenuLink({ children, asChild, className, href }: any) {
  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement);
  }

  return (
    <a href={href} className={"block text-sm " + (className ?? " p-2 rounded hover:bg-zinc-50")}>
      {children}
    </a>
  );
}
NavigationMenuLink.displayName = "NavigationMenuLink";

export default NavigationMenu;
