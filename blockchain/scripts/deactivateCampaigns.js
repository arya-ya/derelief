const hre = require("hardhat");

async function main() {
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);

    // IDs to deactivate
    // 8: Sumatra Flood Relief 2026 - Wrong Year
    const IDs = [8];

    console.log("Deactivating campaigns...");

    for (const id of IDs) {
        try {
            const campaign = await DeRelief.getCampaign(id);
            if (campaign.isActive) {
                console.log(`Toggling ID ${id} (${campaign.name})...`);
                const tx = await DeRelief.toggleCampaignStatus(id);
                await tx.wait();
                console.log(`✅ ID ${id} is now INACTIVE`);
            } else {
                console.log(`ℹ️ ID ${id} is already INACTIVE`);
            }
        } catch (e) {
            console.error(`❌ Failed to deactivate ID ${id}:`, e.message);
        }
    }
}

main().catch(console.error);
