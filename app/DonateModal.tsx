"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import styles from "./DonateModal.module.css";
import {
    DERELIEF_CONTRACT_ADDRESS,
    IDRX_TOKEN_ADDRESS,
    DERELIEF_ABI,
    ERC20_ABI,
} from "./contracts";

interface DonateModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: {
        id: number;
        title: string;
        raised: number;
        goal: number;
    };
    onSuccess?: () => void;
}

export default function DonateModal({ isOpen, onClose, campaign, onSuccess }: DonateModalProps) {
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState("");
    const [step, setStep] = useState<"input" | "approve" | "donate" | "success">("input");

    const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
    const { writeContract: donate, data: donateHash, isPending: isDonating } = useWriteContract();

    const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
        hash: approveHash,
    });

    const { isLoading: isDonateConfirming, isSuccess: isDonateConfirmed } = useWaitForTransactionReceipt({
        hash: donateHash,
    });

    // Quick amount buttons
    const quickAmounts = [10000, 50000, 100000, 500000];

    const handleApprove = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        try {
            // IDRX has 2 decimals
            const amountInCents = parseUnits(amount, 2);

            setStep("approve");

            approve({
                address: IDRX_TOKEN_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [DERELIEF_CONTRACT_ADDRESS as `0x${string}`, amountInCents],
            });
        } catch (error) {
            console.error("Approve error:", error);
            setStep("input");
        }
    };

    const handleDonate = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        try {
            const amountInCents = parseUnits(amount, 2);

            setStep("donate");

            donate({
                address: DERELIEF_CONTRACT_ADDRESS as `0x${string}`,
                abi: DERELIEF_ABI,
                functionName: "donate",
                args: [BigInt(campaign.id), amountInCents],
            });
        } catch (error) {
            console.error("Donate error:", error);
            setStep("input");
        }
    };

    // Effect: After approve confirmed, proceed to donate
    if (isApproveConfirmed && step === "approve") {
        handleDonate();
    }

    // Effect: After donate confirmed, show success
    if (isDonateConfirmed && step === "donate") {
        setStep("success");
        onSuccess?.();
    }

    const formatIDRX = (num: number) => {
        return new Intl.NumberFormat("id-ID").format(num);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>

                <h2 className={styles.title}>Donate to Campaign</h2>
                <p className={styles.campaignName}>{campaign.title}</p>

                <div className={styles.progress}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                        />
                    </div>
                    <p className={styles.progressText}>
                        {formatIDRX(campaign.raised)} / {formatIDRX(campaign.goal)} IDRX
                    </p>
                </div>

                {step === "input" && (
                    <>
                        <div className={styles.inputGroup}>
                            <label>Amount (IDRX)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className={styles.input}
                                min="1"
                            />
                        </div>

                        <div className={styles.quickAmounts}>
                            {quickAmounts.map((qa) => (
                                <button
                                    key={qa}
                                    onClick={() => setAmount(qa.toString())}
                                    className={styles.quickButton}
                                >
                                    {formatIDRX(qa)}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleApprove}
                            disabled={!amount || parseFloat(amount) <= 0 || !isConnected}
                            className={styles.donateButton}
                        >
                            {!isConnected ? "Connect Wallet First" : "Donate Now"}
                        </button>

                        <p className={styles.note}>
                            💡 You will need to approve IDRX spending first, then confirm the donation.
                        </p>
                    </>
                )}

                {step === "approve" && (
                    <div className={styles.processing}>
                        <div className={styles.spinner}></div>
                        <p>Step 1/2: Approving IDRX...</p>
                        <p className={styles.subtext}>
                            {isApproving ? "Waiting for wallet confirmation..." : ""}
                            {isApproveConfirming ? "Confirming on blockchain..." : ""}
                        </p>
                    </div>
                )}

                {step === "donate" && (
                    <div className={styles.processing}>
                        <div className={styles.spinner}></div>
                        <p>Step 2/2: Donating...</p>
                        <p className={styles.subtext}>
                            {isDonating ? "Waiting for wallet confirmation..." : ""}
                            {isDonateConfirming ? "Confirming on blockchain..." : ""}
                        </p>
                    </div>
                )}

                {step === "success" && (
                    <div className={styles.success}>
                        <div className={styles.checkmark}>✓</div>
                        <h3>Donation Successful!</h3>
                        <p>Thank you for donating {formatIDRX(parseFloat(amount))} IDRX</p>
                        <button onClick={onClose} className={styles.closeSuccessButton}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
