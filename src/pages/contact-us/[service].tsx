import { useRouter } from "next/router";

import { AdminLayout } from "../../components/AdminLayout";

const SERVICES = ["a", "b", "c"] as const;

export default function ContactUsServicePage() {
  const router = useRouter();
  const serviceParam = router.query.service;
  const service = Array.isArray(serviceParam) ? serviceParam[0] : serviceParam;

  const normalized = typeof service === "string" ? service.toLowerCase() : "";
  const isKnown = (SERVICES as readonly string[]).includes(normalized);

  return (
    <AdminLayout
      title={isKnown ? `Service ${normalized.toUpperCase()}` : "Service"}
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
        <div className="text-xs font-semibold tracking-wider text-gray-600">CONTACT-US · SERVICE</div>

        {!router.isReady ? (
          <div className="mt-4 text-sm text-gray-600">Loading…</div>
        ) : isKnown ? (
          <div className="mt-4">
            <h2 className="text-lg font-extrabold tracking-tight">{normalized.toUpperCase()}</h2>
            <p className="mt-2 text-sm text-gray-600">
              여기는 서비스 <b>{normalized.toUpperCase()}</b>용 Contact Us 페이지(placeholder)예요.
              <br />
              다음 단계로는: 이 서비스에 맞는 폼/설명/약관 링크 등을 붙이면 됩니다.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-[#FEF3C7] p-4 text-sm text-[#92400E]">
            <div className="font-semibold">Unknown service</div>
            <div className="mt-1 break-words">service={String(serviceParam)}</div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
