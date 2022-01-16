import NextHead from "next/head";

export default function Head() {
  return (
    <>
      <NextHead>
        <title>sizesnap</title>
        <meta name="title" content="sizesnap" />
        <meta
          name="description"
          content="file size snapshots for js packages"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://metatags.io/" />
        <meta property="og:title" content="sizesnap" />
        <meta
          property="og:description"
          content="file size snapshots for js packages"
        />
        <meta property="og:image" content="https://sizesnap.reaper.im/og.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://metatags.io/" />
        <meta property="twitter:title" content="sizesnap" />
        <meta
          property="twitter:description"
          content="file size snapshots for js packages"
        />
        <meta
          property="twitter:image"
          content="https://sizesnap.reaper.im/og.png"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://sizesnap.reaper.im/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://sizesnap.reaper.im/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://sizesnap.reaper.im/favicon-16x16.png"
        />
        <link
          rel="manifest"
          href="https://sizesnap.reaper.im/site.webmanifest"
        />
      </NextHead>
    </>
  );
}
