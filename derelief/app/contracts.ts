// Contract addresses
// Base Mainnet Contract Address (Deployed Jan 4, 2026)
export const DERELIEF_CONTRACT_ADDRESS = "0x69C75776ECDd1F03188D60ef748412d881919Bf0";
export const IDRX_TOKEN_ADDRESS = "0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22";

// DeRelief ABI (Application Binary Interface)
export const DERELIEF_ABI = [
    // Read functions
    {
        inputs: [],
        name: "campaignCount",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_campaignId", type: "uint256" }],
        name: "getCampaign",
        outputs: [
            {
                components: [
                    { name: "id", type: "uint256" },
                    { name: "name", type: "string" },
                    { name: "description", type: "string" },
                    { name: "category", type: "string" },
                    { name: "recipient", type: "address" },
                    { name: "targetAmount", type: "uint256" },
                    { name: "collectedAmount", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                    { name: "isActive", type: "bool" },
                    { name: "isWithdrawn", type: "bool" },
                ],
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getActiveCampaigns",
        outputs: [
            {
                components: [
                    { name: "id", type: "uint256" },
                    { name: "name", type: "string" },
                    { name: "description", type: "string" },
                    { name: "category", type: "string" },
                    { name: "recipient", type: "address" },
                    { name: "targetAmount", type: "uint256" },
                    { name: "collectedAmount", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                    { name: "isActive", type: "bool" },
                    { name: "isWithdrawn", type: "bool" },
                ],
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_campaignId", type: "uint256" }],
        name: "getCampaignProgress",
        outputs: [
            { name: "collected", type: "uint256" },
            { name: "target", type: "uint256" },
            { name: "percentage", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_campaignId", type: "uint256" }],
        name: "getDonationCount",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    // Write functions
    {
        inputs: [
            { name: "_campaignId", type: "uint256" },
            { name: "_amount", type: "uint256" },
        ],
        name: "donate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "_name", type: "string" },
            { name: "_description", type: "string" },
            { name: "_category", type: "string" },
            { name: "_recipient", type: "address" },
            { name: "_targetAmount", type: "uint256" },
            { name: "_durationDays", type: "uint256" },
        ],
        name: "createCampaign",
        outputs: [{ type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_campaignId", type: "uint256" }],
        name: "withdrawFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "campaignId", type: "uint256" },
            { indexed: false, name: "name", type: "string" },
            { indexed: false, name: "recipient", type: "address" },
            { indexed: false, name: "targetAmount", type: "uint256" },
            { indexed: false, name: "deadline", type: "uint256" },
        ],
        name: "CampaignCreated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "campaignId", type: "uint256" },
            { indexed: true, name: "donor", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
            { indexed: false, name: "timestamp", type: "uint256" },
        ],
        name: "DonationMade",
        type: "event",
    },
] as const;

// ERC20 ABI for IDRX token
export const ERC20_ABI = [
    {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{ type: "string" }],
        stateMutability: "view",
        type: "function",
    },
] as const;
