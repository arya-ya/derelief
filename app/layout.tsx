import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  return {
    title: "DeRelief - Transparent Crowdfunding on Base",
    description:
      "Decentralized Relief for Any Cause. Every donation onchain, every aid transparent.",
    openGraph: {
      title: "DeRelief - Transparent Crowdfunding on Base",
      description:
        "Every donation onchain, every aid transparent. Built on Base with IDRX.",
      images: [`${URL}/og-image.png`],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: `${URL}/og-image.png`,
        button: {
          title: "Donate Now",
          action: {
            type: "launch_miniapp",
            name: "DeRelief",
            url: URL,
            splashImageUrl: `${URL}/splash.png`,
            splashBackgroundColor: "#0f0f23",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
