const hre = require("hardhat");

async function main() {
    // IDRX Token address on Base (same for mainnet and sepolia)
    const IDRX_ADDRESS = "0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22";

    const network = hre.network.name;
    const isMainnet = network === "baseMainnet";

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║           DeRelief Contract Deployment                  ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    console.log(`🌐 Network: ${network}`);
    console.log(`💎 IDRX Token: ${IDRX_ADDRESS}`);

    if (isMainnet) {
        console.log("\n⚠️  WARNING: Deploying to BASE MAINNET!");
        console.log("   This will use REAL ETH for gas fees.\n");
    }

    // Get deployer info
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

    if (balance === 0n) {
        console.log("❌ ERROR: No ETH balance! Cannot deploy.");
        console.log("   Please fund your wallet with ETH first.");
        process.exit(1);
    }

    console.log("📦 Deploying DeRelief contract...\n");

    const DeRelief = await hre.ethers.getContractFactory("DeRelief");
    const derelief = await DeRelief.deploy(IDRX_ADDRESS);

    console.log("⏳ Waiting for deployment confirmation...");
    await derelief.waitForDeployment();

    const address = await derelief.getAddress();

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║           ✅ DEPLOYMENT SUCCESSFUL!                     ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    console.log(`📍 Contract Address: ${address}`);
    console.log(`💎 IDRX Token: ${IDRX_ADDRESS}`);
    console.log(`🌐 Network: ${network}`);

    const basescanUrl = isMainnet
        ? `https://basescan.org/address/${address}`
        : `https://sepolia.basescan.org/address/${address}`;

    console.log(`\n🔗 View on BaseScan: ${basescanUrl}`);

    // Save deployment info
    console.log("\n📋 NEXT STEPS:");
    console.log("   1. Copy the contract address above");
    console.log("   2. Update frontend/app/contracts.ts with new address");
    console.log("   3. Run createCampaigns.js to add test campaigns");
    if (isMainnet) {
        console.log("   4. Update frontend to use Base Mainnet chain");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
