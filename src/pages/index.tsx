import Head from "next/head";
import { useState } from "react";

import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type FormState = {
  name: string;
  email: string;
  message: string;
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as
        | { ok: true; id: string }
        | { ok: false; error: string };

      if (!res.ok || !data.ok) {
        setResult({
          type: "error",
          text: "전송에 실패했어요. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }

      setResult({ type: "success", text: "메시지가 전송되었어요. 감사합니다!" });
      setForm({ name: "", email: "", message: "" });
    } catch {
      setResult({
        type: "error",
        text: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Contact | bini59.dev</title>
        <meta name="description" content="Contact us" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <div className={styles.intro}>
            <h1>Contact</h1>
            <p>메시지를 남겨주시면 확인 후 답장드릴게요.</p>
          </div>

          <form onSubmit={onSubmit} className={styles.card}>
            <label className={styles.label}
              >이름
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="홍길동"
                autoComplete="name"
                required
              />
            </label>

            <label className={styles.label}
              >이메일
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className={styles.label}
              >메시지
              <textarea
                className={styles.textarea}
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                placeholder="무엇을 도와드릴까요?"
                rows={6}
                required
              />
            </label>

            <button className={styles.primary} type="submit" disabled={submitting}
              >{submitting ? "전송 중..." : "보내기"}
            </button>

            {result && (
              <p
                className={
                  result.type === "success" ? styles.success : styles.error
                }
              >
                {result.text}
              </p>
            )}
          </form>
        </main>
      </div>
    </>
  );
}
