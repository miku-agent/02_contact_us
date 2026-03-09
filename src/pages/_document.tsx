import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko" data-theme="business">
      <Head />
      <body className="min-h-screen bg-base-200 text-base-content">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
