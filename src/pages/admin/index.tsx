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

export default function Admin({ messages }: { messages: MessageRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);

  const services = useMemo(() => {
    const set = new Set(messages.map((m) => m.service));
    return ["all", ...Array.from(set).sort()];
  }, [messages]);

  const [serviceFilter, setServiceFilter] = useState<string>("all");
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
        <title>Admin | contact</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div style={{ padding: 20, fontFamily: "ui-monospace, SFMono-Regular" }}>
        <h1 style={{ marginBottom: 12 }}>Contact Inbox</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label>
            Service:{" "}
            <select
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

          <span style={{ opacity: 0.7 }}>
            showing {filtered.length} / {messages.length}
          </span>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {filtered.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                background: m.archived ? "#fafafa" : "white",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <strong>{m.service}</strong>
                  <span>{m.name}</span>
                  <a href={`mailto:${m.email}`}>{m.email}</a>
                </div>
                <time style={{ opacity: 0.7 }}>
                  {new Date(m.createdAt).toLocaleString()}
                </time>
              </div>

              <pre
                style={{
                  marginTop: 10,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.message}
              </pre>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                {m.archived ? (
                  <button
                    onClick={() => archive(m.id, false)}
                    disabled={busy === m.id}
                  >
                    Unarchive
                  </button>
                ) : (
                  <button
                    onClick={() => archive(m.id, true)}
                    disabled={busy === m.id}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p style={{ marginTop: 20, opacity: 0.7 }}>No messages.</p>
          )}
        </div>
      </div>
    </>
  );
}
