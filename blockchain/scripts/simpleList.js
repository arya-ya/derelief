const hre = require("hardhat");

async function main() {
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);
    const campaignCount = await DeRelief.campaignCount();

    for (let i = 1; i <= Number(campaignCount); i++) {
        const campaign = await DeRelief.getCampaign(i);
        console.log(`ID:${i}|Name:${campaign.name}|Recipient:${campaign.recipient}|Collected:${campaign.collectedAmount}|Withdrawn:${campaign.isWithdrawn}`);
    }
}

main().catch(console.error);
