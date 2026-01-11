"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, useChainId } from "wagmi";
import { parseUnits } from "viem";
import { base } from "wagmi/chains";
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
    const chainId = useChainId();
    const [showManualApprove, setShowManualApprove] = useState(false);
    const [showManualDonate, setShowManualDonate] = useState(false);

    // Missing state variables restored
    const { switchChain } = useSwitchChain();
    const [amount, setAmount] = useState("");
    const [step, setStep] = useState<"input" | "switching" | "approve" | "donate" | "success">("input");
    const [error, setError] = useState<string | null>(null);

    // Check if on correct chain
    const isWrongChain = chainId !== base.id;

    // Get user's IDRX balance
    const { data: balanceData } = useReadContract({
        address: IDRX_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    const userBalance = balanceData ? BigInt(balanceData as bigint) : BigInt(0);
    const formattedBalance = Number(userBalance) / 100; // IDRX has 2 decimals

    // Write contract hooks
    const {
        writeContract: approve,
        data: approveHash,
        isPending: isApproving,
        error: approveError,
        reset: resetApprove
    } = useWriteContract();

    const {
        writeContract: donate,
        data: donateHash,
        isPending: isDonating,
        error: donateError,
        reset: resetDonate
    } = useWriteContract();

    // Transaction receipt hooks
    const {
        isLoading: isApproveConfirming,
        isSuccess: isApproveConfirmed,
        error: approveReceiptError
    } = useWaitForTransactionReceipt({
        hash: approveHash,
        confirmations: 1,
    });

    useEffect(() => {
        if (approveHash) console.log("Approve Hash:", approveHash);
        if (isApproveConfirming) console.log("Approve Confirming...");
        if (isApproveConfirmed) console.log("Approve Confirmed!");
        if (approveReceiptError) console.error("Approve Receipt Error:", approveReceiptError);
    }, [approveHash, isApproveConfirming, isApproveConfirmed, approveReceiptError]);

    const {
        isLoading: isDonateConfirming,
        isSuccess: isDonateConfirmed,
        error: donateReceiptError
    } = useWaitForTransactionReceipt({
        hash: donateHash,
        confirmations: 1,
    });

    useEffect(() => {
        if (donateHash) console.log("Donate Hash:", donateHash);
        if (isDonateConfirming) console.log("Donate Confirming...");
        if (isDonateConfirmed) console.log("Donate Confirmed!");
        if (donateReceiptError) console.error("Donate Receipt Error:", donateReceiptError);
    }, [donateHash, isDonateConfirming, isDonateConfirmed, donateReceiptError]);

    // Timer for manual overrides
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === "approve" && isApproveConfirming) {
            timer = setTimeout(() => setShowManualApprove(true), 12000); // Show after 12s
        } else {
            setShowManualApprove(false);
        }
        return () => clearTimeout(timer);
    }, [step, isApproveConfirming]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === "donate" && isDonateConfirming) {
            timer = setTimeout(() => setShowManualDonate(true), 12000); // Show after 12s
        } else {
            setShowManualDonate(false);
        }
        return () => clearTimeout(timer);
    }, [step, isDonateConfirming]);

    // Quick amount buttons
    const quickAmounts = [10000, 50000, 100000, 500000];

    // Reset modal state when closed
    useEffect(() => {
        if (!isOpen) {
            setAmount("");
            setStep("input");
            setError(null);
            resetApprove();
            resetDonate();
        }
    }, [isOpen, resetApprove, resetDonate]);

    // Handle errors from transactions
    useEffect(() => {
        if (approveError) {
            console.error("Approve error:", approveError);
            setError(getErrorMessage(approveError));
            setStep("input");
        }
    }, [approveError]);

    useEffect(() => {
        if (donateError) {
            console.error("Donate error:", donateError);
            setError(getErrorMessage(donateError));
            setStep("input");
        }
    }, [donateError]);

    useEffect(() => {
        if (approveReceiptError) {
            console.error("Approve receipt error:", approveReceiptError);
            setError("Approval transaction failed. Please try again.");
            setStep("input");
        }
    }, [approveReceiptError]);

    useEffect(() => {
        if (donateReceiptError) {
            console.error("Donate receipt error:", donateReceiptError);
            setError("Donation transaction failed. Please try again.");
            setStep("input");
        }
    }, [donateReceiptError]);

    // Handle donation flow - after approve confirmed, proceed to donate
    const handleDonate = useCallback(() => {
        if (!amount || parseFloat(amount) <= 0) return;

        try {
            const amountInCents = parseUnits(amount, 2);
            setStep("donate");
            setError(null);

            donate({
                address: DERELIEF_CONTRACT_ADDRESS as `0x${string}`,
                abi: DERELIEF_ABI,
                functionName: "donate",
                args: [BigInt(campaign.id), amountInCents],
            });
        } catch (err) {
            console.error("Donate error:", err);
            setError("Failed to submit donation. Please try again.");
            setStep("input");
        }
    }, [amount, campaign.id, donate]);

    // Auto-proceed to donate after approve is confirmed
    useEffect(() => {
        if (isApproveConfirmed && step === "approve") {
            handleDonate();
        }
    }, [isApproveConfirmed, step, handleDonate]);

    // Show success after donation is confirmed
    useEffect(() => {
        if (isDonateConfirmed && step === "donate") {
            setStep("success");
            onSuccess?.();
        }
    }, [isDonateConfirmed, step, onSuccess]);

    // Extract user-friendly error message
    function getErrorMessage(error: Error): string {
        const message = error.message.toLowerCase();

        if (message.includes("user rejected") || message.includes("user denied")) {
            return "Transaction cancelled by user.";
        }
        if (message.includes("insufficient funds")) {
            return "Insufficient ETH for gas fees.";
        }
        if (message.includes("insufficient allowance")) {
            return "IDRX allowance insufficient. Please try again.";
        }
        if (message.includes("transfer amount exceeds balance")) {
            return "Insufficient IDRX balance.";
        }
        if (message.includes("rpc") || message.includes("too many errors") || message.includes("rate limit")) {
            return "Network is busy. Please wait a moment and try again.";
        }
        if (message.includes("timeout") || message.includes("timed out")) {
            return "Request timed out. Please try again.";
        }

        return "Transaction failed. Please try again.";
    }

    const handleApprove = async () => {
        setError(null);

        // Validation: Check amount
        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        const amountValue = parseFloat(amount);

        // Check if on wrong chain FIRST - before balance check!
        if (isWrongChain) {
            try {
                setStep("switching");
                setError(null);
                await switchChain({ chainId: base.id });
                // After switch, user needs to click again
                setStep("input");
                setError("Switched to Base network. Please click Donate again.");
                return;
            } catch (err) {
                console.error("Chain switch error:", err);
                setError("Failed to switch to Base network. Please switch manually in MetaMask.");
                setStep("input");
                return;
            }
        }

        // Validation: Check balance (only after confirming we're on Base)
        if (amountValue > formattedBalance) {
            setError(`Insufficient IDRX balance. You have ${formatIDRX(formattedBalance)} IDRX.`);
            return;
        }

        try {
            const amountInCents = parseUnits(amount, 2);
            setStep("approve");

            approve({
                address: IDRX_TOKEN_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [DERELIEF_CONTRACT_ADDRESS as `0x${string}`, amountInCents],
            });
        } catch (err) {
            console.error("Approve error:", err);
            setError("Failed to submit approval. Please try again.");
            setStep("input");
        }
    };

    const formatIDRX = (num: number) => {
        return new Intl.NumberFormat("id-ID").format(Math.floor(num));
    };

    const getProgressPercentage = () => {
        if (campaign.goal === 0) return 0;
        return Math.min((campaign.raised / campaign.goal) * 100, 100);
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
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                    <p className={styles.progressText}>
                        {formatIDRX(campaign.raised)} / {formatIDRX(campaign.goal)} IDRX
                    </p>
                </div>

                {/* Hackathon Disclaimer */}
                <div className={styles.disclaimer}>
                    <div className={styles.disclaimerTitle}>
                        <span>⚠️</span>
                        <span>HACKATHON DEMO PROJECT</span>
                    </div>
                    <p className={styles.disclaimerText}>
                        This is a demo for Base Indonesia Hackathon 2025. Campaigns are for demonstration purposes only. Do not donate real funds expecting actual charitable distribution.
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className={styles.errorBox}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Wrong Chain Warning */}
                {isConnected && isWrongChain && step === "input" && (
                    <div className={styles.warningBox}>
                        <span>🔗</span> You are on wrong network. Click Donate to switch to Base.
                    </div>
                )}

                {step === "input" && (
                    <>
                        {/* Balance Display */}
                        {isConnected && (
                            <div className={styles.balanceInfo}>
                                <span>Your Balance {isWrongChain ? "(switch to Base)" : ""}:</span>
                                <span className={styles.balanceAmount}>
                                    {isWrongChain ? "—" : `${formatIDRX(formattedBalance)} IDRX`}
                                </span>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Amount (IDRX)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setError(null);
                                }}
                                placeholder="Enter amount"
                                className={styles.input}
                                min="1"
                            />
                        </div>

                        <div className={styles.quickAmounts}>
                            {quickAmounts.map((qa) => (
                                <button
                                    key={qa}
                                    onClick={() => {
                                        setAmount(qa.toString());
                                        setError(null);
                                    }}
                                    className={`${styles.quickButton} ${amount === qa.toString() ? styles.quickButtonActive : ""}`}
                                    disabled={qa > formattedBalance}
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
                            {!isConnected
                                ? "Connect Wallet First"
                                : isWrongChain
                                    ? "Switch to Base & Donate"
                                    : `Donate ${amount ? formatIDRX(parseFloat(amount)) : "0"} IDRX`
                            }
                        </button>

                        <p className={styles.note}>
                            💡 You will need to approve IDRX spending first, then confirm the donation.
                        </p>
                    </>
                )}

                {step === "switching" && (
                    <div className={styles.processing}>
                        <div className={styles.spinner}></div>
                        <p className={styles.stepTitle}>Switching Network</p>
                        <p className={styles.subtext}>
                            Please confirm network switch in your wallet...
                        </p>
                        <div className={styles.txInfo}>
                            Switching from Ethereum to Base
                        </div>
                    </div>
                )}

                {step === "approve" && (
                    <div className={styles.processing}>
                        <div className={styles.spinner}></div>
                        <p className={styles.stepTitle}>Step 1 of 2: Approving IDRX</p>
                        <p className={styles.subtext}>
                            {isApproving && "Please confirm in your wallet..."}
                            {isApproveConfirming && "Waiting for blockchain confirmation..."}
                        </p>
                        <div className={styles.txInfo}>
                            Approving {formatIDRX(parseFloat(amount))} IDRX for donation
                        </div>
                        {showManualApprove && (
                            <button
                                className={styles.manualButton}
                                onClick={handleDonate}
                            >
                                Transaction confirmed? Click to Continue →
                            </button>
                        )}
                    </div>
                )}

                {step === "donate" && (
                    <div className={styles.processing}>
                        <div className={styles.spinner}></div>
                        <p className={styles.stepTitle}>Step 2 of 2: Donating</p>
                        <p className={styles.subtext}>
                            {isDonating && "Please confirm in your wallet..."}
                            {isDonateConfirming && "Waiting for blockchain confirmation..."}
                        </p>
                        <div className={styles.txInfo}>
                            Donating {formatIDRX(parseFloat(amount))} IDRX to campaign
                        </div>
                        {showManualDonate && (
                            <button
                                className={styles.manualButton}
                                onClick={() => {
                                    setStep("success");
                                    onSuccess?.();
                                }}
                            >
                                Transaction confirmed? Click to Finish →
                            </button>
                        )}
                    </div>
                )}

                {step === "success" && (
                    <div className={styles.success}>
                        <div className={styles.checkmark}>✓</div>
                        <h3>Donation Successful!</h3>
                        <p>Thank you for donating <strong>{formatIDRX(parseFloat(amount))} IDRX</strong></p>
                        <p className={styles.txHash}>
                            Transaction recorded on blockchain
                        </p>
                        {donateHash && (
                            <a
                                href={`https://basescan.org/tx/${donateHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewTx}
                            >
                                View on BaseScan →
                            </a>
                        )}
                        <button onClick={onClose} className={styles.closeSuccessButton}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
