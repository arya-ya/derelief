const hre = require("hardhat");

async function main() {
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);
    const [owner] = await hre.ethers.getSigners();

    console.log("Creating Campaign: Darurat Banjir Sumatra 2025...");

    const tx = await DeRelief.createCampaign(
        "Darurat Banjir Sumatra 2025",
        "Merespon banjir bandang dan longsor yang melanda wilayah Sumatra di akhir tahun 2025. Bantuan akan difokuskan pada distribusi pangan, air bersih, dan obat-obatan bagi ribuan warga yang terdampak.",
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
