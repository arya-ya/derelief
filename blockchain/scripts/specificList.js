const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const ABI = [
        "function campaignCount() view returns (uint256)",
        "function getCampaign(uint256) view returns (tuple(uint256 id, string name, string description, string category, address recipient, uint256 targetAmount, uint256 collectedAmount, uint256 deadline, bool isActive, bool isWithdrawn))"
    ];

    const contract = new ethers.Contract(DERELIEF_ADDRESS, ABI, provider);

    // Fetch specifically IDs 4, 5, 6
    for (let i = 4; i <= 6; i++) {
        try {
            const c = await contract.getCampaign(i);
            console.log(`ID: ${i} | Name: ${c[1]} | Raised: ${Number(c[6]) / 100} IDRX | Recipient: ${c[4]}`);
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            console.log(`ID: ${i} failed or not exists`);
        }
    }
}

main().catch(console.error);
