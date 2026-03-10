import Link from "next/link";

import { AdminLayout } from "../../components/AdminLayout";

export default function ServicesOverviewPage() {
  return (
    <AdminLayout
      title="Services"
      nav={[
        { href: "/services/all", label: "All Messages" },
        {
          label: "Services",
          href: "/services/pm2",
          defaultOpen: true,
          children: [{ href: "/services/pm2", label: "PM2 List" }],
        },
      ]}
    >
      <section className="rounded-lg bg-white p-5">
        <div className="text-xs font-semibold tracking-wider text-gray-600">SERVICES</div>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">서비스별 Contact Inbox</h2>
        <p className="mt-2 text-sm text-gray-600">사이드바에서 서비스명을 선택하면 해당 제품의 문의 화면으로 이동해요.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { key: "MikuDashboard", href: "/services/mikudashboard" },
            { key: "B", href: "/services/b" },
            { key: "C", href: "/services/c" },
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
