const hre = require("hardhat");

async function main() {
    // Base Mainnet Contract Address (Deployed Jan 4, 2026)
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";

    console.log("Creating test campaigns...\n");

    // Get contract instance
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);

    // Get signer (owner)
    const [owner] = await hre.ethers.getSigners();
    console.log(`Owner address: ${owner.address}\n`);

    // Campaign 1: Disaster Relief
    console.log("Creating Campaign 1: Flood Relief - West Java...");
    const tx1 = await DeRelief.createCampaign(
        "Flood Relief - West Java",
        "Help victims of flooding in West Java. Funds will be used for food, shelter, and medical supplies.",
        "Disaster",
        owner.address, // recipient (for testing, using owner)
        BigInt(100000000), // 1,000,000 IDRX (100M cents = 1M IDRX with 2 decimals)
        30 // 30 days duration
    );
    await tx1.wait();
    console.log("✅ Campaign 1 created!\n");

    // Campaign 2: Health
    console.log("Creating Campaign 2: Heart Surgery for Andi...");
    const tx2 = await DeRelief.createCampaign(
        "Heart Surgery for Andi",
        "Andi needs urgent heart surgery. Your donation can save his life.",
        "Health",
        owner.address,
        BigInt(80000000), // 800,000 IDRX
        15 // 15 days duration
    );
    await tx2.wait();
    console.log("✅ Campaign 2 created!\n");

    // Campaign 3: Education
    console.log("Creating Campaign 3: School Books for Rural Kids...");
    const tx3 = await DeRelief.createCampaign(
        "School Books for Rural Kids",
        "Provide textbooks and learning materials for children in rural areas.",
        "Education",
        owner.address,
        BigInt(25000000), // 250,000 IDRX
        45 // 45 days duration
    );
    await tx3.wait();
    console.log("✅ Campaign 3 created!\n");

    // Get campaign count
    const count = await DeRelief.campaignCount();
    console.log(`\n--- Campaign Creation Complete ---`);
    console.log(`Total campaigns: ${count}`);

    // Get active campaigns
    const campaigns = await DeRelief.getActiveCampaigns();
    console.log(`Active campaigns: ${campaigns.length}`);

    campaigns.forEach((c, i) => {
        console.log(`\n[Campaign ${i + 1}]`);
        console.log(`  ID: ${c.id}`);
        console.log(`  Name: ${c.name}`);
        console.log(`  Category: ${c.category}`);
        console.log(`  Target: ${Number(c.targetAmount) / 100} IDRX`);
        console.log(`  Collected: ${Number(c.collectedAmount) / 100} IDRX`);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
