const hre = require("hardhat");

async function main() {
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);
    const [owner] = await hre.ethers.getSigners();

    console.log("Creating Campaign: Sumatra Flood Relief 2026...");

    const tx = await DeRelief.createCampaign(
        "Sumatra Flood Relief 2026",
        "Darurat banjir melanda Aceh, Sumut, dan Sumbar (Jan 2026). 1.182 korban jiwa & 238rb pengungsi membutuhkan bantuan pangan, medis, dan perbaikan tempat tinggal segera.",
        "Disaster",
        owner.address,
        BigInt(1000000000), // 10,000,000 IDRX (1B cents)
        30 // 30 days
    );

    console.log("Waiting for confirmation...");
    await tx.wait();

    const count = await DeRelief.campaignCount();
    console.log(`✅ Success! New Campaign ID: ${count}`);
}

main().catch(console.error);
