const hre = require("hardhat");

async function main() {
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const DeRelief = await hre.ethers.getContractAt("DeRelief", DERELIEF_ADDRESS);
    const [owner] = await hre.ethers.getSigners();

    const newCampaigns = [
        {
            name: "Beasiswa Anak Yatim & Piatu",
            desc: "Memberikan kesempatan pendidikan bagi anak-anak yatim dan piatu agar tetap bisa melanjutkan sekolah hingga jenjang SMA.",
            cat: "Education",
            target: BigInt(50000000), // 500,000 IDRX
            days: 60
        },
        {
            name: "Reboisasi Mangrove Pantai Utara",
            desc: "Aksi penanaman 10.000 bibit mangrove untuk mencegah abrasi dan memulihkan ekosistem pesisir di Pantai Utara Jawa.",
            cat: "Environment",
            target: BigInt(120000000), // 1,200,000 IDRX
            days: 45
        },
        {
            name: "Dapur Umum Lansia Terlantar",
            desc: "Menyediakan makanan bergizi setiap hari untuk lansia yang hidup sebatang kara dan kurang mampu di wilayah perkotaan.",
            cat: "Community",
            target: BigInt(35000000), // 350,000 IDRX
            days: 30
        }
    ];

    console.log("Creating 3 new campaigns to reach the 5-active goal...\n");

    for (const campaign of newCampaigns) {
        console.log(`Creating: ${campaign.name}...`);
        try {
            const tx = await DeRelief.createCampaign(
                campaign.name,
                campaign.desc,
                campaign.cat,
                owner.address,
                campaign.target,
                campaign.days
            );
            await tx.wait();
            console.log(`✅ ${campaign.name} Created!\n`);
        } catch (error) {
            console.error(`❌ Failed to create ${campaign.name}:`, error.message);
        }
    }

    const finalCount = await DeRelief.campaignCount();
    console.log(`\n🎉 Process Complete! Total campaigns on-chain: ${finalCount}`);
}

main().catch(console.error);
