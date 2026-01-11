const hre = require("hardhat");

async function main() {
    // Base Mainnet Contract Address
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";

    // Campaign ID to withdraw from
    // 5 = Bantuan Gempa Cianjur 2025 (Confirmed with 2,000 IDRX)
    const CAMPAIGN_ID = 5;

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║           DeRelief - Withdraw Funds                     ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Get contract instance
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log(`👤 Your address: ${signer.address}`);

    // Get campaign info
    const campaign = await DeRelief.getCampaign(CAMPAIGN_ID);
    console.log(`\n📋 Campaign #${CAMPAIGN_ID}:`);
    console.log(`   Name: ${campaign.name}`);
    console.log(`   Recipient: ${campaign.recipient}`);
    console.log(`   Collected: ${Number(campaign.collectedAmount) / 100} IDRX`);
    console.log(`   isWithdrawn: ${campaign.isWithdrawn}`);
    console.log(`   isActive: ${campaign.isActive}`);

    // Check if you are the recipient
    if (signer.address.toLowerCase() !== campaign.recipient.toLowerCase()) {
        console.log("\n❌ ERROR: You are NOT the recipient of this campaign!");
        console.log(`   Your address: ${signer.address}`);
        console.log(`   Recipient:    ${campaign.recipient}`);
        return;
    }

    // Check if already withdrawn
    if (campaign.isWithdrawn) {
        console.log("\n❌ ERROR: Funds already withdrawn!");
        return;
    }

    // Check if there are funds
    if (campaign.collectedAmount === 0n) {
        console.log("\n❌ ERROR: No funds to withdraw!");
        return;
    }

    console.log("\n💸 Withdrawing funds...");

    try {
        const tx = await DeRelief.withdrawFunds(CAMPAIGN_ID);
        console.log(`   TX Hash: ${tx.hash}`);

        await tx.wait();

        console.log("\n╔════════════════════════════════════════════════════════╗");
        console.log("║           ✅ WITHDRAWAL SUCCESSFUL!                     ║");
        console.log("╚════════════════════════════════════════════════════════╝");
        console.log(`\n💰 ${Number(campaign.collectedAmount) / 100} IDRX has been sent to your wallet!`);
        console.log(`🔗 View on BaseScan: https://basescan.org/tx/${tx.hash}`);

    } catch (error) {
        console.error("\n❌ Withdrawal failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
