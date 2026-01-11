const hre = require("hardhat");

async function main() {
    // Base Mainnet Contract Address
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║     Creating New Campaigns for Demo                     ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Get contract instance
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);

    // Get signer (owner)
    const [owner] = await hre.ethers.getSigners();
    console.log(`Owner address: ${owner.address}\n`);

    // Campaign: Gempa Cianjur
    console.log("Creating Campaign: Bantuan Gempa Cianjur 2025...");
    const tx1 = await DeRelief.createCampaign(
        "Bantuan Gempa Cianjur 2025",
        "Gempa 5.6 SR mengguncang Cianjur. Ribuan rumah rusak dan warga mengungsi. Mari bantu saudara kita yang terdampak bencana.",
        "Disaster",
        owner.address,
        BigInt(100000000000), // 1,000,000,000 IDRX (1 Miliar)
        30 // 30 days duration
    );
    await tx1.wait();
    console.log("✅ Campaign Cianjur created!\n");

    // Get updated count
    const count = await DeRelief.campaignCount();
    console.log(`Total campaigns now: ${count}`);

    // Get active campaigns
    const activeCampaigns = await DeRelief.getActiveCampaigns();
    console.log(`Active campaigns: ${activeCampaigns.length}`);

    console.log("\n✅ Done! New campaign ready for demo.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
