"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import {
    DERELIEF_CONTRACT_ADDRESS,
    IDRX_TOKEN_ADDRESS,
    DERELIEF_ABI,
    ERC20_ABI,
} from "./contracts";

// Types
export interface Campaign {
    id: bigint;
    name: string;
    description: string;
    category: string;
    recipient: string;
    targetAmount: bigint;
    collectedAmount: bigint;
    deadline: bigint;
    isActive: boolean;
    isWithdrawn: boolean;
}

// Hook to get all active campaigns
export function useActiveCampaigns() {
    const { data, isLoading, error, refetch } = useReadContract({
        address: DERELIEF_CONTRACT_ADDRESS as `0x${string}`,
        abi: DERELIEF_ABI,
        functionName: "getActiveCampaigns",
        chainId: base.id,
    });

    return {
        campaigns: (data as Campaign[]) || [],
        isLoading,
        error,
        refetch,
    };
}

// Hook to get campaign count
export function useCampaignCount() {
    const { data, isLoading } = useReadContract({
        address: DERELIEF_CONTRACT_ADDRESS as `0x${string}`,
        abi: DERELIEF_ABI,
        functionName: "campaignCount",
        chainId: base.id,
    });

    return {
        count: data ? Number(data) : 0,
        isLoading,
    };
}

// Hook to get single campaign
export function useCampaign(campaignId: number) {
    const { data, isLoading, error } = useReadContract({
        address: DERELIEF_CONTRACT_ADDRESS as `0x${string}`,
        abi: DERELIEF_ABI,
        functionName: "getCampaign",
        args: [BigInt(campaignId)],
        chainId: base.id,
    });

    return {
        campaign: data as Campaign | undefined,
        isLoading,
        error,
    };
}

// Hook to get IDRX balance
export function useIDRXBalance() {
    const { address } = useAccount();

    const { data, isLoading, refetch } = useReadContract({
        address: IDRX_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        chainId: base.id,
    });

    return {
        balance: data ? data : BigInt(0),
        isLoading,
        refetch,
    };
}

// Hook to donate
export function useDonate() {
    const { writeContract, isPending, isSuccess, error } = useWriteContract();

    const donate = async (campaignId: number, amount: bigint) => {
        // First approve IDRX spending
        await writeContract({
            address: IDRX_TOKEN_ADDRESS as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [DERELIEF_CONTRACT_ADDRESS as `0x${string}`, amount],
        });
    };

    const confirmDonation = async (campaignId: number, amount: bigint) => {
        await writeContract({
            address: DERELIEF_CONTRACT_ADDRESS as `0x${string}`,
            abi: DERELIEF_ABI,
            functionName: "donate",
            args: [BigInt(campaignId), amount],
        });
    };

    return {
        donate,
        confirmDonation,
        isPending,
        isSuccess,
        error,
    };
}

// Helper: Format IDRX amount (2 decimals like IDR)
export function formatIDRX(amount: bigint): string {
    // IDRX has 2 decimals
    const value = Number(amount) / 100;
    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// Helper: Parse IDRX amount
export function parseIDRX(amount: number): bigint {
    return BigInt(Math.floor(amount * 100));
}

// Helper: Calculate days left
export function getDaysLeft(deadline: bigint): number {
    const now = Math.floor(Date.now() / 1000);
    const deadlineNum = Number(deadline);
    const diff = deadlineNum - now;
    return Math.max(0, Math.ceil(diff / 86400));
}
