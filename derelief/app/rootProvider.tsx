"use client";
import { ReactNode, useState } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@coinbase/onchainkit/styles.css";

// Patch fetch once at module load to suppress OnchainKit analytics errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== "undefined" && !(window as any).__fetchPatched) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__fetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const url = args[0]?.toString() || "";
    // Silently succeed for analytics requests to prevent console errors
    if (url.includes("coinbase.com/api/v1/analytics")) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    try {
      return await originalFetch(...args);
    } catch (error) {
      // Re-throw non-analytics errors, but log them gracefully
      console.warn("Fetch error:", error);
      throw error;
    }
  };
}

export function RootProvider({ children }: { children: ReactNode }) {

  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            name: "DeRelief",
            logo: "/icon.png",
            mode: "dark",
          },
          wallet: {
            display: "modal",
            termsUrl: "https://derelief.vercel.app/terms",
            privacyUrl: "https://derelief.vercel.app/privacy",
          },
        }}
      >
        {children}
      </OnchainKitProvider>
    </QueryClientProvider>
  );
}
