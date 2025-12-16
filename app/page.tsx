"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { sdk } from "@farcaster/miniapp-sdk";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import styles from "./page.module.css";
import DonateModal from "./DonateModal";
import {
  useActiveCampaigns,
  useCampaignCount,
  useIDRXBalance,
  formatIDRX as formatIDRXFromChain,
  getDaysLeft,
  Campaign,
} from "./hooks";

// Mock data for campaigns
const mockCampaigns = [
  {
    id: 1,
    title: "Darurat Banjir & Longsor Sumatra 2025",
    category: "disaster",
    categoryLabel: "Bencana",
    raised: 2150000000,
    goal: 5000000000,
    donors: 12847,
    daysLeft: 30,
    icon: "flood",
    description: "Bencana banjir dan longsor melanda Aceh, Sumut & Sumbar. 1.030 korban jiwa, 186.488 rumah rusak, 3.274 sekolah terdampak. Mari bantu saudara kita.",
    featured: true,
  },
  {
    id: 2,
    title: "Operasi Jantung untuk Andi",
    category: "health",
    categoryLabel: "Kesehatan",
    raised: 45000000,
    goal: 80000000,
    donors: 156,
    daysLeft: 8,
    icon: "health",
    description: "Andi (5 tahun) butuh operasi jantung segera untuk bertahan hidup.",
    featured: false,
  },
  {
    id: 3,
    title: "Buku Sekolah untuk Anak Pedalaman",
    category: "education",
    categoryLabel: "Pendidikan",
    raised: 12000000,
    goal: 25000000,
    donors: 89,
    daysLeft: 21,
    icon: "education",
    description: "Bantu anak-anak di daerah terpencil mendapatkan buku pelajaran.",
    featured: false,
  },
];

const categories = [
  { id: "all", label: "Semua" },
  { id: "disaster", label: "Bencana" },
  { id: "health", label: "Kesehatan" },
  { id: "education", label: "Pendidikan" },
  { id: "community", label: "Komunitas" },
  { id: "personal", label: "Personal" },
  { id: "environment", label: "Lingkungan" },
];

// SVG Icons Component
const CampaignIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    flood: (
      <svg viewBox="0 0 64 64" className={styles.iconSvg}>
        <circle cx="32" cy="32" r="28" fill="url(#blueGrad)" />
        <path d="M20 38c4-6 8-10 12-10s8 4 12 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M16 44c4-6 8-10 16-10s12 4 16 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="24" r="6" fill="white" opacity="0.8" />
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    ),
    health: (
      <svg viewBox="0 0 64 64" className={styles.iconSvg}>
        <circle cx="32" cy="32" r="28" fill="url(#redGrad)" />
        <path d="M32 20c-6 0-12 5-12 12 0 10 12 18 12 18s12-8 12-18c0-7-6-12-12-12z" fill="white" />
        <defs>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>
    ),
    education: (
      <svg viewBox="0 0 64 64" className={styles.iconSvg}>
        <circle cx="32" cy="32" r="28" fill="url(#greenGrad)" />
        <rect x="22" y="20" width="20" height="26" rx="2" fill="white" />
        <rect x="26" y="24" width="12" height="2" fill="#22c55e" />
        <rect x="26" y="30" width="12" height="2" fill="#22c55e" />
        <rect x="26" y="36" width="8" height="2" fill="#22c55e" />
        <defs>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
    ),
    community: (
      <svg viewBox="0 0 64 64" className={styles.iconSvg}>
        <circle cx="32" cy="32" r="28" fill="url(#purpleGrad)" />
        <circle cx="32" cy="26" r="6" fill="white" />
        <circle cx="22" cy="32" r="5" fill="white" opacity="0.8" />
        <circle cx="42" cy="32" r="5" fill="white" opacity="0.8" />
        <path d="M20 44c0-6 5-10 12-10s12 4 12 10" fill="white" />
        <defs>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    ),
  };
  return icons[type] || icons.community;
};

// Format number
const formatIDRX = (num: number) => {
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(1)} M`;
  }
  if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(0)} Jt`;
  }
  return `Rp ${num.toLocaleString("id-ID")}`;
};

export default function Home() {
  const { isConnected } = useAccount();
  const { campaigns: blockchainCampaigns, isLoading: campaignsLoading, refetch } = useActiveCampaigns();
  useCampaignCount(); // Called for side effects
  const { balance: idrxBalance } = useIDRXBalance();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: number; title: string; raised: number; goal: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default dark

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleDonateClick = (campaign: { id: number; title: string; raised: number; goal: number }) => {
    setSelectedCampaign(campaign);
    setDonateModalOpen(true);
  };

  const handleDonateSuccess = () => refetch();

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const hasBlockchainCampaigns = blockchainCampaigns && blockchainCampaigns.length > 0;

  const displayCampaigns = hasBlockchainCampaigns
    ? blockchainCampaigns.map((c: Campaign, index: number) => ({
      id: Number(c.id),
      title: c.name,
      category: c.category.toLowerCase(),
      categoryLabel: c.category,
      raised: Number(c.collectedAmount),
      goal: Number(c.targetAmount),
      donors: 0,
      daysLeft: getDaysLeft(c.deadline),
      icon: c.category.toLowerCase(),
      description: c.description,
      featured: index === 0,
    }))
    : mockCampaigns;

  const filteredCampaigns =
    selectedCategory === "all"
      ? displayCampaigns
      : displayCampaigns.filter((c) => c.category === selectedCategory);

  const featuredCampaign = filteredCampaigns.find(c => c.featured);
  const regularCampaigns = filteredCampaigns.filter(c => !c.featured);

  // Stats
  const totalRaised = displayCampaigns.reduce((acc, c) => acc + c.raised, 0);
  const totalDonors = displayCampaigns.reduce((acc, c) => acc + c.donors, 0);

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <Image src="/icon.png" alt="DeRelief" width={36} height={36} className={styles.logoIcon} />
            <span className={styles.logoText}>DeRelief</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {isConnected && (
            <div className={styles.balance}>
              <span>{formatIDRXFromChain(idrxBalance)}</span>
              <span className={styles.currency}>IDRX</span>
            </div>
          )}
          <Wallet />
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Donasi Transparan, <span className={styles.highlight}>100% Onchain</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Setiap donasi tercatat di blockchain. Tidak ada yang tersembunyi.
          </p>
        </div>

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{formatIDRX(totalRaised)}</span>
            <span className={styles.statLabel}>Total Terkumpul</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{displayCampaigns.length}</span>
            <span className={styles.statLabel}>Kampanye Aktif</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalDonors.toLocaleString()}</span>
            <span className={styles.statLabel}>Total Donatur</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoriesWrapper}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.categoryActive : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Kampanye Terbaru</h2>
          {hasBlockchainCampaigns && (
            <span className={styles.onchainBadge}>🔗 Live from Blockchain</span>
          )}
        </div>

        {campaignsLoading ? (
          <div className={styles.loading}>Memuat dari blockchain...</div>
        ) : (
          <>
            {/* Featured Campaign */}
            {featuredCampaign && (
              <article className={styles.featuredCard}>
                <div className={styles.featuredImage}>
                  <CampaignIcon type={featuredCampaign.icon} />
                  <span className={styles.featuredBadge}>⭐ Pilihan</span>
                </div>
                <div className={styles.featuredContent}>
                  <span className={styles.cardCategory}>{featuredCampaign.categoryLabel}</span>
                  <h3 className={styles.featuredTitle}>{featuredCampaign.title}</h3>
                  <p className={styles.featuredDesc}>{featuredCampaign.description}</p>

                  <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${Math.min((featuredCampaign.raised / featuredCampaign.goal) * 100, 100)}%` }}
                      />
                    </div>
                    <div className={styles.progressInfo}>
                      <div className={styles.raised}>
                        <span className={styles.raisedAmount}>{formatIDRX(featuredCampaign.raised)}</span>
                        <span className={styles.raisedLabel}>dari {formatIDRX(featuredCampaign.goal)}</span>
                      </div>
                      <div className={styles.meta}>
                        <span>{featuredCampaign.donors} donatur</span>
                        <span>•</span>
                        <span>{featuredCampaign.daysLeft} hari lagi</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={styles.donateButtonLarge}
                    onClick={() => handleDonateClick(featuredCampaign)}
                    disabled={!isConnected}
                  >
                    {isConnected ? "Donasi Sekarang" : "Hubungkan Wallet"}
                  </button>
                </div>
              </article>
            )}

            {/* Regular Campaigns Grid */}
            <div className={styles.campaignsGrid}>
              {regularCampaigns.map((campaign) => (
                <article key={campaign.id} className={styles.campaignCard}>
                  <div className={styles.cardImage}>
                    <CampaignIcon type={campaign.icon} />
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardCategory}>{campaign.categoryLabel}</span>
                    <h3 className={styles.cardTitle}>{campaign.title}</h3>

                    <div className={styles.progressSection}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                        />
                      </div>
                      <div className={styles.progressInfo}>
                        <div className={styles.raised}>
                          <span className={styles.raisedAmount}>{formatIDRX(campaign.raised)}</span>
                          <span className={styles.raisedLabel}>terkumpul</span>
                        </div>
                        <div className={styles.meta}>
                          <span>{campaign.donors} donatur</span>
                          <span>•</span>
                          <span>{campaign.daysLeft} hari lagi</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className={styles.donateButton}
                      onClick={() => handleDonateClick(campaign)}
                      disabled={!isConnected}
                    >
                      {isConnected ? "Donasi Sekarang" : "Hubungkan Wallet"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Donate Modal */}
      {selectedCampaign && (
        <DonateModal
          isOpen={donateModalOpen}
          onClose={() => setDonateModalOpen(false)}
          campaign={selectedCampaign}
          onSuccess={handleDonateSuccess}
        />
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Image src="/icon.png" alt="DeRelief" width={28} height={28} className={styles.footerLogo} />
            <span>DeRelief</span>
          </div>
          <p className={styles.footerTagline}>Crowdfunding transparan berbasis blockchain</p>
          <div className={styles.footerLinks}>
            <a href="#">Tentang</a>
            <a href="#">Cara Kerja</a>
            <a href="#">FAQ</a>
          </div>
          <p className={styles.footerContract}>
            Smart Contract: <code>0x20C8...9c1b</code> • Base Sepolia
          </p>
        </div>
      </footer>
    </div>
  );
}
