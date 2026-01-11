const hre = require("hardhat");

async function main() {
    // Base Mainnet Contract Address (Deployed Jan 4, 2026)
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";

    console.log("Creating new campaign: Bencana Sumatra & Aceh...\n");

    // Get contract instance
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);

    // Get signer (owner)
    const [owner] = await hre.ethers.getSigners();
    console.log(`Owner address: ${owner.address}\n`);

    // Create new campaign: Bencana Sumatra & Aceh
    console.log("Creating Campaign: Darurat Banjir & Longsor Sumatra 2025...");
    const tx = await DeRelief.createCampaign(
        "Darurat Banjir & Longsor Sumatra 2025",
        "Bencana banjir dan longsor melanda Aceh, Sumut & Sumbar. 1.030 korban jiwa, 186.488 rumah rusak, 3.274 sekolah terdampak. Mari bantu saudara kita.",
        "Disaster",
        owner.address,
        BigInt(500000000000), // 5,000,000,000 IDRX (5 Miliar)
        30 // 30 days duration
    );
    await tx.wait();
    console.log("✅ Campaign created!\n");

    // Verify
    const count = await DeRelief.campaignCount();
    console.log(`Total campaigns: ${count}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
