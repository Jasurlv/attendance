"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";

/**
 * Page frame for the admin area.
 *
 * - The sidebar is position:fixed, so it never moves when the page scrolls.
 * - Phones (< 768px): the sidebar is a drawer that slides over the page, with a dimmed backdrop.
 * - Desktop (>= 768px): the sidebar is open by default; the hamburger slides it away
 *   and the page content widens to fill the space.
 */
export function AdminShell({
  adminName,
  logoutAction,
  children,
}: {
  adminName: string;
  logoutAction: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Track the breakpoint. Widening the window past it closes the phone drawer.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setMobileOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Going to another page closes the phone drawer.
  useEffect(() => setMobileOpen(false), [pathname]);

  // While the phone drawer is open: Escape closes it and the page behind cannot scroll.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Keyboard users: focus moves into the drawer when it opens and back to the button when it closes.
  useEffect(() => {
    if (mobileOpen) closeButton.current?.focus();
    else if (wasOpen.current) menuButton.current?.focus();
    wasOpen.current = mobileOpen;
  }, [mobileOpen]);

  const expanded = isDesktop ? !desktopCollapsed : mobileOpen;
  const toggle = () =>
    isDesktop ? setDesktopCollapsed((v) => !v) : setMobileOpen((v) => !v);

  return (
    <>
      {/* Dimmed backdrop, phones only */}
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={
          "fixed inset-0 z-30 bg-ink/50 transition-opacity duration-300 ease-out md:hidden " +
          (mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />

      <aside
        id="sidebar"
        className={
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto bg-ink text-white " +
          "transition-[transform,visibility] duration-300 ease-out " +
          // Hidden panels are also removed from tab order and screen readers via visibility.
          (mobileOpen
            ? "visible translate-x-0 "
            : "invisible -translate-x-full ") +
          (desktopCollapsed
            ? "md:invisible md:-translate-x-full"
            : "md:visible md:translate-x-0")
        }
      >
        <div className="hazard h-2 shrink-0" aria-hidden />
        <div className="flex items-start justify-between gap-2 px-5 pb-4 pt-5">
          <div>
            <p className="font-display text-2xl font-semibold leading-none">
              Site Attendance
            </p>
            <p className="mt-2 text-sm text-white/70">{adminName}</p>
          </div>
          <button
            ref={closeButton}
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded text-white/80 hover:bg-white/10 hover:text-white md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <Nav onNavigate={() => setMobileOpen(false)} />
        <form
          action={logoutAction}
          className="border-t border-white/10 px-5 py-4"
        >
          <button className="text-sm text-white/70 underline underline-offset-4 hover:text-white">
            Sign out
          </button>
        </form>
      </aside>

      <div
        className={
          "min-h-screen transition-[padding] duration-300 ease-out " +
          (desktopCollapsed ? "md:pl-0" : "md:pl-60")
        }
      >
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-concrete px-4 md:px-8">
          <button
            ref={menuButton}
            type="button"
            onClick={toggle}
            aria-label={expanded ? "Close menu" : "Open menu"}
            aria-expanded={expanded}
            aria-controls="sidebar"
            className="-ml-2 grid h-10 w-10 place-items-center rounded text-ink hover:bg-ink/5"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* The sidebar already shows the name, so only show it here when the sidebar is not visible. */}
          <span
            className={
              "font-display text-xl font-semibold " +
              (desktopCollapsed ? "" : "md:hidden")
            }
          >
            Site Attendance
          </span>
        </header>
        <main className="w-full p-4 md:p-8">{children}</main>
      </div>
    </>
  );
}
