import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

type NavItem = {
  href?: string;
  label: string;
  badge?: number;
  children?: NavItem[];
  defaultOpen?: boolean;
};

function NavLink({
  href,
  label,
  active,
  badge,
  className,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={
        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 " +
        (active ? "bg-[#111827] text-white" : "bg-transparent text-[#111827] hover:bg-gray-200") +
        (className ? ` ${className}` : "")
      }
    >
      <span className="truncate">{label}</span>
      {badge && badge > 0 ? (
        <span
          className={
            "ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs " +
            (active ? "bg-white text-[#111827]" : "bg-[#3B82F6] text-white")
          }
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function Breadcrumbs({ path }: { path: string }) {
  const parts = path.split("?")[0].split("#")[0].split("/").filter(Boolean);
  const crumbs = [
    { label: "Home", href: "/" },
    ...parts.map((p, idx) => ({
      label: p.replace(/[-_]/g, " "),
      href: "/" + parts.slice(0, idx + 1).join("/"),
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className="text-xs font-medium tracking-wide text-gray-600">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 ? <span className="opacity-50">/</span> : null}
            <Link href={c.href} className="hover:text-[#111827]">
              {c.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AdminLayout({
  title,
  nav,
  children,
}: {
  title: string;
  nav?: NavItem[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = router.asPath;

  const items: NavItem[] =
    nav ??
    [
      { href: "/inbox", label: "Inbox" },
      {
        label: "Contact-us",
        href: "/contact-us",
        defaultOpen: true,
        children: [
          { href: "/contact-us/a", label: "MikuDashboard" },
          { href: "/contact-us/b", label: "B" },
          { href: "/contact-us/c", label: "C" },
        ],
      },
    ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Left Navigation */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-lg bg-white p-4">
            <div className="mb-4">
              <div className="text-lg font-extrabold tracking-tight">02 Contact Us</div>
              <div className="text-xs font-medium text-gray-600">Admin Panel</div>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((it) => {
                const hasChildren = Array.isArray(it.children) && it.children.length > 0;

                if (!hasChildren) {
                  // leaf
                  if (!it.href) return null;
                  return (
                    <NavLink
                      key={it.href}
                      href={it.href}
                      label={it.label}
                      active={pathname === it.href || pathname.startsWith(it.href + "/")}
                      badge={it.badge}
                    />
                  );
                }

                const groupHref = it.href;
                const groupActive = groupHref ? pathname === groupHref || pathname.startsWith(groupHref + "/") : false;
                const childActive = it.children!.some((c) => (c.href ? pathname === c.href || pathname.startsWith(c.href + "/") : false));
                const open = it.defaultOpen ?? (groupActive || childActive);

                return (
                  <details key={it.label} open={open} className="rounded-md">
                    <summary className="list-none">
                      <div className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-extrabold tracking-tight text-[#111827] hover:bg-gray-200">
                        <span className="truncate">{it.label}</span>
                        <span className="text-xs text-gray-500">▾</span>
                      </div>
                    </summary>

                    <div className="mt-1 flex flex-col gap-1 pl-3">
                      {groupHref ? (
                        <NavLink
                          href={groupHref}
                          label="Overview"
                          active={groupActive}
                          className="text-xs font-bold"
                        />
                      ) : null}

                      {it.children!.map((c) => {
                        if (!c.href) return null;
                        return (
                          <NavLink
                            key={c.href}
                            href={c.href}
                            label={c.label}
                            active={pathname === c.href || pathname.startsWith(c.href + "/")}
                            badge={c.badge}
                            className="text-sm font-semibold"
                          />
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>

            <div className="mt-6 rounded-md bg-gray-100 p-3 text-xs text-gray-700">
              <div className="font-semibold">Tip</div>
              <div className="mt-1">No shadows. Hierarchy by typography + color blocks.</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <header className="mb-4 rounded-lg bg-white p-5">
            <Breadcrumbs path={pathname} />
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
              <div className="text-xs font-medium text-gray-600">contact.bini59.dev</div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
