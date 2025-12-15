import { NextResponse } from "next/server";

export async function GET() {
    const URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const manifest = {
        accountAssociation: {
            // These will be filled after deployment via base.dev/preview
            header: "",
            payload: "",
            signature: "",
        },
        miniapp: {
            version: "1",
            name: "DeRelief",
            homeUrl: URL,
            iconUrl: `${URL}/icon.png`,
            splashImageUrl: `${URL}/splash.png`,
            splashBackgroundColor: "#0f0f23",
            subtitle: "Transparent Crowdfunding on Base",
            description:
                "Decentralized crowdfunding platform for any cause. Every donation onchain, every aid transparent. Built on Base with IDRX.",
            screenshotUrls: [],
            primaryCategory: "social",
            tags: ["crowdfunding", "donation", "charity", "idrx", "base"],
            heroImageUrl: `${URL}/og-image.png`,
            tagline: "Decentralized Relief for Any Cause",
            ogTitle: "DeRelief - Transparent Crowdfunding on Base",
            ogDescription:
                "Every donation onchain, every aid transparent. Built on Base with IDRX.",
            ogImageUrl: `${URL}/og-image.png`,
        },
    };

    return NextResponse.json(manifest);
}
