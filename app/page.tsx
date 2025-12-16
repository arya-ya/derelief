"use client";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Wallet } from "@coinbase/onchainkit/wallet";
import styles from "./page.module.css";

// Mock data for campaigns (will be replaced with blockchain data later)
const mockCampaigns = [
  {
    id: 1,
    title: "Flood Relief - West Java",
    category: "disaster",
    categoryLabel: "🌊 Disaster",
    raised: 75000000,
    goal: 100000000,
    donors: 234,
    daysLeft: 15,
    image: "🌊",
  },
  {
    id: 2,
    title: "Heart Surgery for Andi",
    category: "health",
    categoryLabel: "🏥 Health",
    raised: 45000000,
    goal: 80000000,
    donors: 156,
    daysLeft: 8,
    image: "❤️",
  },
  {
    id: 3,
    title: "School Books for Rural Kids",
    category: "education",
    categoryLabel: "📚 Education",
    raised: 12000000,
    goal: 25000000,
    donors: 89,
    daysLeft: 21,
    image: "📚",
  },
];

const categories = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "disaster", label: "Disaster", emoji: "🌊" },
  { id: "health", label: "Health", emoji: "🏥" },
  { id: "education", label: "Education", emoji: "📚" },
  { id: "personal", label: "Personal", emoji: "🏠" },
  { id: "environment", label: "Environment", emoji: "🌳" },
  { id: "community", label: "Community", emoji: "🤝" },
];

// Format number to Indonesian Rupiah style
const formatIDRX = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  return num.toLocaleString("id-ID");
};

export default function Home() {
  // Signal to Base App that the mini-app is ready to display
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/icon.png" alt="DeRelief Logo" className={styles.logoIcon} />
          <span className={styles.logoText}>DeRelief</span>
        </div>
        <Wallet />
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Decentralized Relief for <span className={styles.highlight}>Any Cause</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Every donation onchain, every aid transparent. Built on Base with IDRX.
        </p>
        <div className={styles.heroButtons}>
          <button className={styles.primaryButton}>Start Donating</button>
          <button className={styles.secondaryButton}>View All Campaigns</button>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>125M</span>
          <span className={styles.statLabel}>IDRX Raised</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>1,234</span>
          <span className={styles.statLabel}>Donors</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>12</span>
          <span className={styles.statLabel}>Active Campaigns</span>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Browse by Category</h2>
        <div className={styles.categories}>
          {categories.map((cat) => (
            <button key={cat.id} className={styles.categoryButton}>
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Campaigns */}
      <section className={styles.campaignsSection}>
        <h2 className={styles.sectionTitle}>Featured Campaigns</h2>
        <div className={styles.campaignsGrid}>
          {mockCampaigns.map((campaign) => (
            <div key={campaign.id} className={styles.campaignCard}>
              <div className={styles.campaignImage}>{campaign.image}</div>
              <div className={styles.campaignCategory}>{campaign.categoryLabel}</div>
              <h3 className={styles.campaignTitle}>{campaign.title}</h3>

              {/* Progress Bar */}
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                />
              </div>

              <div className={styles.campaignStats}>
                <span>{formatIDRX(campaign.raised)} / {formatIDRX(campaign.goal)} IDRX</span>
              </div>

              <div className={styles.campaignMeta}>
                <span>👥 {campaign.donors} donors</span>
                <span>⏰ {campaign.daysLeft} days left</span>
              </div>

              <button className={styles.donateButton}>Donate Now</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Built with ❤️ on Base | Powered by IDRX</p>
        <p className={styles.footerLinks}>
          <a href="#">About</a> • <a href="#">How it Works</a> • <a href="#">Contact</a>
        </p>
      </footer>
    </div>
  );
}
