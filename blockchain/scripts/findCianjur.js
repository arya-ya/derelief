const hre = require("hardhat");

async function main() {
    // Base Mainnet Contract Address
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";

    console.log("\n🔍 Searching for Cianjur campaign...\n");

    // Get contract instance
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);
    const [signer] = await hre.ethers.getSigners();

    // Get total campaign count
    const campaignCount = await DeRelief.campaignCount();
    console.log(`Total campaigns on-chain: ${campaignCount}\n`);

    let found = false;

    for (let i = 1; i <= Number(campaignCount); i++) {
        const campaign = await DeRelief.getCampaign(i);
        const nameLower = campaign.name.toLowerCase();

        // Check if this is the Cianjur campaign
        if (nameLower.includes('cianjur') || nameLower.includes('gempa')) {
            found = true;
            const collected = Number(campaign.collectedAmount) / 100;
            const isYours = signer.address.toLowerCase() === campaign.recipient.toLowerCase();

            console.log("╔════════════════════════════════════════════════════════╗");
            console.log("║           🎯 FOUND CIANJUR CAMPAIGN!                    ║");
            console.log("╚════════════════════════════════════════════════════════╝\n");
            console.log(`📋 ID: ${i}`);
            console.log(`📝 Name: ${campaign.name}`);
            console.log(`💰 Collected: ${collected.toLocaleString('id-ID')} IDRX`);
            console.log(`🎯 Target: ${(Number(campaign.targetAmount) / 100).toLocaleString('id-ID')} IDRX`);
            console.log(`📍 Recipient: ${campaign.recipient}`);
            console.log(`👤 Your Wallet: ${signer.address}`);
            console.log(`✅ Is Your Campaign: ${isYours ? "YES" : "NO"}`);
            console.log(`📌 Active: ${campaign.isActive}`);
            console.log(`💸 Already Withdrawn: ${campaign.isWithdrawn}`);

            if (isYours && collected > 0 && !campaign.isWithdrawn) {
                console.log(`\n🚀 To withdraw, update CAMPAIGN_ID to ${i} in withdrawFunds.js`);
            }
        }
    }

    if (!found) {
        console.log("❌ No Cianjur/Gempa campaign found on blockchain");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
