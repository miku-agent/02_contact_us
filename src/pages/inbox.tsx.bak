import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSummary(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <AdminLayout
      title="Inbox"
      nav={[
        { href: "/inbox", label: "Inbox", badge: allNewCount },
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
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <section className="rounded-lg bg-white p-5">
          <div className="text-xs font-semibold tracking-wider text-gray-600">FILTERS</div>

          <div className="mt-3">
            <div className="text-xs font-semibold text-gray-600">Service</div>
            <select
              className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-2 focus:border-[#3B82F6]"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {loadingSummary ? <div className="mt-2 text-xs text-gray-600">loading…</div> : null}
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold text-gray-600">Status</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TABS.map((t) => {
                const active = status === t.key;
                const badge = t.key === "NEW" ? selectedNewCount : undefined;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setStatus(t.key)}
                    className={
                      "flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 " +
                      (active ? "bg-[#3B82F6] text-white hover:bg-blue-600" : "bg-gray-100 text-[#111827] hover:bg-gray-200")
                    }
                  >
                    <span>{t.label}</span>
                    {badge ? <span className={"ml-2 rounded-full px-2 py-0.5 text-xs " + (active ? "bg-white text-[#111827]" : "bg-[#3B82F6] text-white")}>{badge}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-lg bg-[#FEE2E2] p-4 text-sm text-[#991B1B]">
              <div className="font-semibold">에러</div>
              <div className="mt-1 break-words">{error}</div>
            </div>
          ) : null}
        </section>

        {/* List */}
        <section className="rounded-lg bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Messages</h2>
              <p className="text-sm text-gray-600">
                {service === "all" ? "All services" : `Service: ${service}`} · Status: {status}
              </p>
            </div>
          </div>

          {loading ? <div className="mt-6 text-sm text-gray-600">Loading…</div> : null}

          {!loading && items.length === 0 ? <div className="mt-6 text-sm text-gray-600">No messages.</div> : null}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-gray-600">
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">From</th>
                  <th className="px-3 py-3">Message</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className="border-t-2 border-gray-100">
                    <td className="px-3 py-3 font-semibold">{m.service}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold">{m.name}</div>
                      <a className="text-[#3B82F6] hover:underline" href={`mailto:${m.email}`}>
                        {m.email}
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <details>
                        <summary className="cursor-pointer select-none text-gray-600">open</summary>
                        <pre className="mt-2 whitespace-pre-wrap break-words rounded-md bg-gray-100 p-3 text-xs leading-relaxed text-[#111827]">
                          {m.message}
                        </pre>
                      </details>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="h-10 rounded-md bg-gray-100 px-3 text-xs font-semibold transition-all duration-200 hover:scale-105 hover:bg-gray-200"
                          onClick={() => onSetStatus(m.id, "DONE")}
                        >
                          Done
                        </button>
                        <button
                          className="h-10 rounded-md bg-gray-100 px-3 text-xs font-semibold transition-all duration-200 hover:scale-105 hover:bg-gray-200"
                          onClick={() => onSetStatus(m.id, "ARCHIVED")}
                        >
                          Archive
                        </button>
                        <button
                          className="h-10 rounded-md bg-[#FEE2E2] px-3 text-xs font-semibold text-[#991B1B] transition-all duration-200 hover:scale-105"
                          onClick={() => onSetStatus(m.id, "SPAM")}
                        >
                          Spam
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
