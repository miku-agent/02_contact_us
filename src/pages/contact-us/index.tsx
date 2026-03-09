import Link from "next/link";

import { AdminLayout } from "../../components/AdminLayout";

export default function ContactUsOverviewPage() {
  return (
    <AdminLayout
      title="Contact-us"
      nav={[
        { href: "/inbox", label: "Inbox" },
        {
          label: "Contact-us",
          href: "/contact-us",
          defaultOpen: true,
          children: [
            { href: "/contact-us/a", label: "A" },
            { href: "/contact-us/b", label: "B" },
            { href: "/contact-us/c", label: "C" },
          ],
        },
      ]}
    >
      <section className="rounded-lg bg-white p-5">
        <div className="text-xs font-semibold tracking-wider text-gray-600">SERVICES</div>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">제품별 Contact Us</h2>
        <p className="mt-2 text-sm text-gray-600">사이드바에서 서비스(A/B/C)를 선택하면 해당 제품의 문의 화면으로 이동해요.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { key: "A", href: "/contact-us/a" },
            { key: "B", href: "/contact-us/b" },
            { key: "C", href: "/contact-us/c" },
          ].map((s) => (
            <Link
              key={s.key}
              href={s.href}
              className="rounded-lg bg-gray-100 p-4 text-sm font-extrabold tracking-tight text-[#111827] transition-all duration-200 hover:scale-[1.01] hover:bg-gray-200"
            >
              Service {s.key}
              <div className="mt-1 text-xs font-semibold text-gray-600">Open →</div>
            </Link>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
