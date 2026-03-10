import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const service = ctx.params?.service;
  const encoded = service ? encodeURIComponent(String(service)) : "all";

  return {
    redirect: {
      destination: `/services/${encoded}`,
      permanent: false,
    },
  };
};

export default function ContactUsServiceRedirect() {
  return null;
}
