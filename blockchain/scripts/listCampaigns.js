const hre = require("hardhat");

async function main() {
    // Base Mainnet Contract Address
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║           DeRelief - List All Campaigns                 ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Get contract instance
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log(`👤 Your wallet: ${signer.address}\n`);

    // Get total campaign count
    const campaignCount = await DeRelief.campaignCount();
    console.log(`📊 Total Campaigns: ${campaignCount}\n`);

    console.log("═══════════════════════════════════════════════════════════");

    for (let i = 1; i <= Number(campaignCount); i++) {
        const campaign = await DeRelief.getCampaign(i);
        const collected = Number(campaign.collectedAmount) / 100;
        const target = Number(campaign.targetAmount) / 100;
        const isYourCampaign = signer.address.toLowerCase() === campaign.recipient.toLowerCase();

        console.log(`\n📋 Campaign #${i}: ${campaign.name}`);
        console.log(`   Category: ${campaign.category}`);
        console.log(`   Recipient: ${campaign.recipient} ${isYourCampaign ? "✅ (YOU)" : ""}`);
        console.log(`   Collected: ${collected.toLocaleString('id-ID')} / ${target.toLocaleString('id-ID')} IDRX`);
        console.log(`   Active: ${campaign.isActive ? "✅ Yes" : "❌ No"}`);
        console.log(`   Withdrawn: ${campaign.isWithdrawn ? "✅ Yes" : "❌ No"}`);

        if (isYourCampaign && collected > 0 && !campaign.isWithdrawn) {
            console.log(`   💰 CAN WITHDRAW: ${collected.toLocaleString('id-ID')} IDRX`);
        }
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("\n📝 To withdraw, run:");
    console.log("   npx hardhat run scripts/withdrawFunds.js --network base");
    console.log("   (Make sure to set the correct CAMPAIGN_ID in the script)\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
