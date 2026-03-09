import Head from "next/head";
import { useMemo, useState } from "react";

import type { GetServerSideProps } from "next";
import { prisma } from "@/server/prisma";

type MessageRow = {
  id: string;
  service: string;
  name: string;
  email: string;
  message: string;
  archived: boolean;
  createdAt: string;
};

export const getServerSideProps: GetServerSideProps<{
  messages: MessageRow[];
}> = async () => {
  const rows = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return {
    props: {
      messages: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    },
  };
};

export default function Inbox({ messages }: { messages: MessageRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const services = useMemo(() => {
    const set = new Set(messages.map((m) => m.service));
    return ["all", ...Array.from(set).sort()];
  }, [messages]);

  const filtered = useMemo(() => {
    return messages.filter((m) =>
      serviceFilter === "all" ? true : m.service === serviceFilter
    );
  }, [messages, serviceFilter]);

  async function archive(id: string, archived: boolean) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, archived }),
      });
      if (!res.ok) throw new Error("failed");
      location.reload();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Head>
        <title>Contact Inbox</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contact Inbox</h1>
              <p className="opacity-70">
                서비스별로 컨택 메시지를 모아서 관리합니다.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Service</span>
                </div>
                <select
                  className="select select-bordered"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="stats bg-base-100 shadow">
                <div className="stat">
                  <div className="stat-title">Showing</div>
                  <div className="stat-value text-2xl">{filtered.length}</div>
                  <div className="stat-desc">/ {messages.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className={`card border border-base-300 bg-base-100 shadow-sm ${
                  m.archived ? "opacity-70" : ""
                }`}
              >
                <div className="card-body gap-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="badge badge-neutral">{m.service}</div>
                      <div className="font-semibold">{m.name}</div>
                      <a className="link" href={`mailto:${m.email}`}>
                        {m.email}
                      </a>
                      {m.archived && <span className="badge">archived</span>}
                    </div>
                    <div className="text-sm opacity-60">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <pre className="whitespace-pre-wrap break-words rounded-box bg-base-200 p-3 text-sm">
                    {m.message}
                  </pre>

                  <div className="card-actions justify-end">
                    {m.archived ? (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => archive(m.id, false)}
                        disabled={busy === m.id}
                      >
                        Unarchive
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => archive(m.id, true)}
                        disabled={busy === m.id}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="alert">
                <span>No messages.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
