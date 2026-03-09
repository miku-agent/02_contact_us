import Head from "next/head";
import { useMemo, useState } from "react";

import type { GetServerSideProps } from "next";
import { Archive, Inbox, Mail, Tag } from "lucide-react";

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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wider text-white">
      {children}
    </span>
  );
}

export default function InboxPage({ messages }: { messages: MessageRow[] }) {
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

      <div className="relative overflow-hidden">
        {/* Flat poster-like header */}
        <header className="relative bg-base-200">
          <div className="pointer-events-none absolute inset-0">
            {/* geometric decoration (no blur, no shadows) */}
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/10" />
            <div className="absolute right-10 top-10 h-28 w-28 rotate-12 bg-secondary/15" />
            <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-accent/10" />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary text-white">
                    <Inbox className="h-7 w-7" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-wider text-primary">
                      FLAT INBOX
                    </p>
                    <h1 className="text-4xl font-extrabold tracking-tightish">
                      Contact Inbox
                    </h1>
                  </div>
                </div>

                <p className="mt-4 text-lg leading-relaxed opacity-80">
                  서비스별로 컨택 메시지를 <strong>DB에 저장</strong>하고,
                  여기서 한 번에 처리합니다.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="w-full max-w-xs">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-70">
                    <Tag className="h-4 w-4" /> Service
                  </div>
                  <select
                    className="h-14 w-full rounded-md bg-base-100 px-4 text-sm font-medium outline-none transition-colors focus:border-2 focus:border-primary"
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

                <div className="grid h-14 min-w-40 place-items-center rounded-md bg-base-100 px-5 text-sm">
                  <span className="text-xs font-semibold tracking-wider uppercase opacity-60">
                    Showing
                  </span>
                  <span className="text-xl font-extrabold leading-none">
                    {filtered.length}
                    <span className="text-sm font-semibold opacity-60">
                      /{messages.length}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Inbox list */}
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-6">
            {filtered.map((m) => (
              <article
                key={m.id}
                className={`group rounded-lg bg-base-200 p-6 transition-transform duration-200 hover:scale-[1.02] ${
                  m.archived ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>
                      <Tag className="h-3.5 w-3.5" /> {m.service}
                    </Badge>

                    <div className="text-base font-bold tracking-tightish">
                      {m.name}
                    </div>

                    <a
                      className="inline-flex items-center gap-2 rounded-md bg-base-100 px-3 py-2 text-sm font-semibold transition-transform duration-200 hover:scale-105"
                      href={`mailto:${m.email}`}
                    >
                      <Mail className="h-4 w-4 text-primary" strokeWidth={2.5} />
                      {m.email}
                    </a>

                    {m.archived && (
                      <span className="inline-flex items-center gap-2 rounded-md bg-base-100 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                        <Archive className="h-4 w-4" /> archived
                      </span>
                    )}
                  </div>

                  <time className="text-sm font-medium opacity-60">
                    {new Date(m.createdAt).toLocaleString()}
                  </time>
                </div>

                <div className="mt-4 rounded-md bg-base-100 p-4">
                  <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {m.message}
                  </pre>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                  {m.archived ? (
                    <button
                      className="h-14 rounded-md bg-base-100 px-6 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:bg-secondary hover:text-white"
                      onClick={() => archive(m.id, false)}
                      disabled={busy === m.id}
                    >
                      Unarchive
                    </button>
                  ) : (
                    <button
                      className="h-14 rounded-md border-4 border-primary bg-transparent px-6 text-sm font-semibold text-primary transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-white"
                      onClick={() => archive(m.id, true)}
                      disabled={busy === m.id}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-lg bg-base-200 p-8">
                <p className="text-lg font-semibold">No messages.</p>
                <p className="mt-2 opacity-70">
                  아직 저장된 컨택 메시지가 없어요.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
