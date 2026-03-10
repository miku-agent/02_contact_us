import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { useRouter } from "next/router";

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

type LogType = "out" | "err";

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

async function fetchLogs(params: { service: string; type: LogType; lines: number }) {
  const sp = new URLSearchParams();
  sp.set("name", params.service);
  sp.set("type", params.type);
  sp.set("lines", String(params.lines));

  const res = await fetch(`/api/services/pm2/logs?${sp.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error ?? "FETCH_FAILED");
  return String(json.logs ?? "");
}

export default function ServicesInboxPage() {
  const router = useRouter();
  // 서비스 모드: "all" 혹은 특정 서비스명
  const service = (router.query.service as string) ?? "all";

  const [status, setStatus] = useState<ContactStatus>("NEW");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<ContactMessage[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [logType, setLogType] = useState<LogType>("out");
  const [logs, setLogs] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

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

  useEffect(() => {
    if (service === "all") {
      setLogs("");
      setLogError(null);
      return;
    }

    let cancelled = false;
    setLogLoading(true);
    setLogError(null);

    fetchLogs({ service, type: logType, lines: 100 })
      .then((text) => {
        if (cancelled) return;
        setLogs(text);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLogError(e instanceof Error ? e.message : "LOG_FETCH_FAILED");
        setLogs("");
      })
      .finally(() => {
        if (cancelled) return;
        setLogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [service, logType]);

  async function onSetStatus(id: string, next: ContactStatus) {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));

    setSummary((cur) => {
      if (!cur) return cur;
      const nextStatuses = { ...cur.statuses };
      nextStatuses[status] = Math.max(0, (nextStatuses[status] ?? 0) - 1);
      return { ...cur, statuses: nextStatuses };
    });

    try {
      await patchStatus(id, next);
      const fresh = await fetchSummary({ service });
      setSummary(fresh);
    } catch (e) {
      setItems(prev);
      setError(e instanceof Error ? e.message : "PATCH_FAILED");
    }
  }

  return (
    <AdminLayout
      title={service === "all" ? "All Messages" : `Messages for ${service.toUpperCase()}`}
      nav={[
        { href: "/services/all", label: "All Messages", badge: allNewCount },
        {
          label: "Services",
          defaultOpen: true,
          children: [{ href: "/services/pm2", label: "PM2 List" }],
        },
      ]}
    >
      <div className="grid gap-4">
        {/* Status Tabs */}
        <section className="rounded-lg bg-white p-5">
          <div className="flex gap-2">
            {TABS.map((t) => {
              const active = status === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setStatus(t.key)}
                  className={
                    "flex items-center justify-between rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 " +
                    (active ? "bg-[#3B82F6] text-white hover:bg-blue-600" : "bg-gray-100 text-[#111827] hover:bg-gray-200")
                  }
                >
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* List */}
        <section className="rounded-lg bg-white p-5">
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

        {service !== "all" ? (
          <section className="rounded-lg bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wider text-gray-600">PM2 LOGS</div>
                <h2 className="mt-1 text-lg font-extrabold tracking-tight">{service} logs</h2>
                <p className="mt-1 text-sm text-gray-600">최근 100줄을 표시합니다.</p>
              </div>
              <div className="flex gap-2">
                <button
                  className={
                    "h-9 rounded-md px-3 text-xs font-semibold transition-all duration-200 " +
                    (logType === "out" ? "bg-[#3B82F6] text-white" : "bg-gray-100 text-gray-700")
                  }
                  onClick={() => setLogType("out")}
                >
                  stdout
                </button>
                <button
                  className={
                    "h-9 rounded-md px-3 text-xs font-semibold transition-all duration-200 " +
                    (logType === "err" ? "bg-[#3B82F6] text-white" : "bg-gray-100 text-gray-700")
                  }
                  onClick={() => setLogType("err")}
                >
                  stderr
                </button>
                <button
                  className="h-9 rounded-md bg-gray-900 px-3 text-xs font-semibold text-white"
                  onClick={() =>
                    fetchLogs({ service, type: logType, lines: 100 })
                      .then(setLogs)
                      .catch((e: unknown) => setLogError(e instanceof Error ? e.message : "LOG_FETCH_FAILED"))
                  }
                >
                  Refresh
                </button>
              </div>
            </div>

            {logLoading ? <div className="mt-4 text-sm text-gray-600">Loading…</div> : null}
            {logError ? <div className="mt-4 text-sm text-red-600">{logError}</div> : null}
            <pre className="mt-4 max-h-[420px] overflow-auto rounded-lg bg-[#0B1120] p-4 text-xs leading-relaxed text-[#E2E8F0]">
              {logs || "(no logs)"}
            </pre>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  );
}
