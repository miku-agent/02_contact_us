import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/AdminLayout";

type Pm2ListItem = {
  id: number;
  name: string;
  status: string;
  instances: number;
  execMode?: string;
  version?: string;
  restartTime?: number;
  uptime?: number | null;
  cpu?: number | null;
  memory?: number | null;
};

export default function Pm2ServicesPage() {
  const [items, setItems] = useState<Pm2ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/services/pm2")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) throw new Error(json.error ?? "FETCH_FAILED");
        setItems(json.items as Pm2ListItem[]);
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
  }, []);

  return (
    <AdminLayout
      title="PM2 Services"
      nav={[
        { href: "/contact-us/all", label: "All Messages" },
        {
          label: "Services",
          defaultOpen: true,
          children: [
            { href: "/services/pm2", label: "PM2 List" },
            { href: "/contact-us/a", label: "MikuDashboard" },
            { href: "/contact-us/b", label: "B" },
            { href: "/contact-us/c", label: "C" },
          ],
        },
      ]}
    >
      <section className="rounded-lg bg-white p-5">
        <div className="text-xs font-semibold tracking-wider text-gray-600">RUNTIME</div>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">PM2 Service List</h2>
        <p className="mt-2 text-sm text-gray-600">이 서버에서 실행 중인 PM2 프로세스 목록이에요.</p>

        {loading ? <div className="mt-6 text-sm text-gray-600">Loading…</div> : null}
        {error ? <div className="mt-6 text-sm text-red-600">{error}</div> : null}
        {!loading && !error && items.length === 0 ? (
          <div className="mt-6 text-sm text-gray-600">No processes.</div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold tracking-wider text-gray-600">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Instances</th>
                <th className="px-3 py-3">CPU</th>
                <th className="px-3 py-3">Memory</th>
                <th className="px-3 py-3">Restarts</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={`${p.id}-${p.name}`} className="border-t-2 border-gray-100">
                  <td className="px-3 py-3 font-semibold">{p.name}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold " +
                        (p.status === "online"
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : p.status === "stopped"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : "bg-gray-100 text-gray-700")
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{p.instances}</td>
                  <td className="px-3 py-3 text-gray-600">{p.cpu ?? "-"}%</td>
                  <td className="px-3 py-3 text-gray-600">
                    {p.memory ? `${Math.round(p.memory / 1024 / 1024)} MB` : "-"}
                  </td>
                  <td className="px-3 py-3 text-gray-600">{p.restartTime ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
