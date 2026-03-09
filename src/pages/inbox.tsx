import { useEffect, useMemo, useState } from "react";

type ContactStatus = "NEW" | "DONE" | "ARCHIVED" | "SPAM";

type ContactMessage = {
  id: string;
  service: string;
  name: string;
  email: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
};

type Summary = {
  statuses: Record<ContactStatus, number>;
  services: Array<{ service: string; newCount: number }>;
};

const TABS: { key: ContactStatus; label: string }[] = [
  { key: "NEW", label: "New" },
  { key: "DONE", label: "Done" },
  { key: "ARCHIVED", label: "Archived" },
  { key: "SPAM", label: "Spam" },
];

async function fetchMessages(params: { status: ContactStatus; service?: string }) {
  const sp = new URLSearchParams();
  sp.set("status", params.status);
  if (params.service && params.service !== "all") sp.set("service", params.service);

  const res = await fetch(`/api/messages?${sp.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error ?? "FETCH_FAILED");
  return json.items as ContactMessage[];
}

async function fetchSummary(params: { service?: string }) {
  const sp = new URLSearchParams();
  if (params.service && params.service !== "all") sp.set("service", params.service);

  const res = await fetch(`/api/messages/summary?${sp.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error ?? "FETCH_FAILED");
  return { statuses: json.statuses, services: json.services } as Summary;
}

async function patchStatus(id: string, status: ContactStatus) {
  const res = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error ?? "PATCH_FAILED");
  return json.item as { id: string; status: ContactStatus };
}

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return <span className="badge badge-primary badge-sm ml-2 rounded-full">{count}</span>;
}

export default function InboxPage() {
  const [status, setStatus] = useState<ContactStatus>("NEW");
  const [service, setService] = useState<string>("all");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<ContactMessage[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const services = useMemo(() => {
    const list = summary?.services ?? [];
    const uniq = new Set(list.map((s) => s.service));
    return ["all", ...Array.from(uniq).sort()];
  }, [summary]);

  const selectedNewCount = summary?.statuses?.NEW ?? 0;
  const allNewCount = useMemo(() => {
    const list = summary?.services ?? [];
    return list.reduce((acc, cur) => acc + cur.newCount, 0);
  }, [summary]);

  useEffect(() => {
    let cancelled = false;
    setLoadingSummary(true);
    setError(null);

    fetchSummary({ service })
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "UNKNOWN_ERROR");
        setSummary(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingSummary(false);
      });

    return () => {
      cancelled = true;
    };
  }, [service]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMessages({ status, service })
      .then((data) => {
        if (cancelled) return;
        setItems(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "UNKNOWN_ERROR");
        setItems([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, service]);

  async function onSetStatus(id: string, next: ContactStatus) {
    // optimistic update: remove from current list (because it moved to another status)
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));

    // optimistic summary update (best-effort)
    setSummary((cur) => {
      if (!cur) return cur;
      const nextStatuses = { ...cur.statuses };
      nextStatuses[status] = Math.max(0, (nextStatuses[status] ?? 0) - 1);
      return { ...cur, statuses: nextStatuses };
    });

    try {
      await patchStatus(id, next);
      // refresh summary (service-scoped) so NEW badge stays accurate
      const fresh = await fetchSummary({ service });
      setSummary(fresh);
    } catch (e) {
      setItems(prev);
      setError(e instanceof Error ? e.message : "PATCH_FAILED");
    }
  }

  return (
    <main className="min-h-screen bg-base-200">
      <div className="mx-auto flex max-w-6xl gap-4 px-4 py-10">
        {/* Sidebar (Services) */}
        <aside className="hidden w-56 shrink-0 sm:block">
          <div className="rounded-xl bg-base-100 p-3 shadow">
            <div className="mb-2 text-xs font-semibold tracking-wider opacity-70">SERVICES</div>

            <ul className="menu menu-sm">
              <li>
                <a className={service === "all" ? "active" : ""} onClick={() => setService("all")}>
                  <span>all</span>
                  <CountBadge count={allNewCount} />
                </a>
              </li>

              {services
                .filter((s) => s !== "all")
                .map((s) => {
                  const newCount = (summary?.services ?? []).find((x) => x.service === s)?.newCount ?? 0;
                  return (
                    <li key={s}>
                      <a className={service === s ? "active" : ""} onClick={() => setService(s)}>
                        <span className="truncate">{s}</span>
                        <CountBadge count={newCount} />
                      </a>
                    </li>
                  );
                })}
            </ul>

            {loadingSummary ? <div className="mt-2 text-xs opacity-60">loading…</div> : null}
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Inbox</h1>
              <p className="text-sm opacity-70">
                {service === "all" ? "All services" : `Service: ${service}`} · Spam is isolated
              </p>
            </div>

            {/* Mobile service selector */}
            <label className="form-control w-full max-w-xs sm:hidden">
              <div className="label">
                <span className="label-text">Service</span>
              </div>
              <select className="select select-bordered" value={service} onChange={(e) => setService(e.target.value)}>
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </header>

          <div role="tablist" className="tabs tabs-lifted mb-4">
            {TABS.map((t) => (
              <a
                key={t.key}
                role="tab"
                className={`tab ${status === t.key ? "tab-active" : ""}`}
                onClick={() => setStatus(t.key)}
              >
                <span>{t.label}</span>
                {t.key === "NEW" ? <CountBadge count={selectedNewCount} /> : null}
              </a>
            ))}
          </div>

          {error ? (
            <div className="alert alert-error mb-4">
              <span>에러: {error}</span>
            </div>
          ) : null}

          {loading ? <div className="loading loading-spinner loading-lg" /> : null}

          {!loading && items.length === 0 ? (
            <div className="rounded-xl bg-base-100 p-6 shadow">
              <p className="opacity-70">No messages.</p>
            </div>
          ) : null}

          <ul className="flex flex-col gap-3">
            {items.map((m) => (
              <li key={m.id} className="rounded-xl bg-base-100 p-4 shadow">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="badge badge-outline">{m.service}</span>
                      <span className="text-sm opacity-70">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="text-sm">
                      <span className="font-semibold">{m.name}</span>
                      <span className="opacity-60"> · </span>
                      <a className="link" href={`mailto:${m.email}`}>
                        {m.email}
                      </a>
                    </div>

                    <details className="mt-2">
                      <summary className="cursor-pointer select-none text-sm opacity-70">message</summary>
                      <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-base-200 p-3 text-sm">{m.message}</pre>
                    </details>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button className="btn btn-sm" onClick={() => onSetStatus(m.id, "DONE")}>
                      Done
                    </button>
                    <button className="btn btn-sm" onClick={() => onSetStatus(m.id, "ARCHIVED")}>
                      Archive
                    </button>
                    <button className="btn btn-sm btn-error" onClick={() => onSetStatus(m.id, "SPAM")}>
                      Spam
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
