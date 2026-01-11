const hre = require("hardhat");

async function main() {
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);
    const [owner] = await hre.ethers.getSigners();

    console.log("Creating new campaign: Sumatra Flood (Research)...\n");

    const tx = await DeRelief.createCampaign(
        "Sumatra Flood (Research)",
        "Advanced research and relief coordination for Sumatra flood victims. Ensuring long-term recovery through data-driven aid distribution.",
        "Disaster",
        owner.address,
        BigInt(500000000), // 5,000,000 IDRX (500M cents)
        30 // 30 days
    );

    console.log("Waiting for transaction...");
    await tx.wait();

    const count = await DeRelief.campaignCount();
    console.log(`✅ Campaign created successfully!`);
    console.log(`📍 New Campaign ID: ${count}`);
}

main().catch(console.error);
