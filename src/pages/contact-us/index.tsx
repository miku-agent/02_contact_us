import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/services",
      permanent: false,
    },
  };
};

export default function ContactUsIndexRedirect() {
  return null;
}
