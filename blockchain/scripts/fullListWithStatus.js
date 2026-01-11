const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const DERELIEF_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
    const ABI = [
        "function campaignCount() view returns (uint256)",
        "function getCampaign(uint256) view returns (tuple(uint256 id, string name, string description, string category, address recipient, uint256 targetAmount, uint256 collectedAmount, uint256 deadline, bool isActive, bool isWithdrawn))"
    ];

    const contract = new ethers.Contract(DERELIEF_ADDRESS, ABI, provider);
    const count = await contract.campaignCount();

    for (let i = 1; i <= Number(count); i++) {
        try {
            const c = await contract.getCampaign(i);
            console.log(`ID: ${i} | Active: ${c[8]} | Name: ${c[1]}`);
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) { }
    }
}
main();
