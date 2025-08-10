"use client"

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth, useAuthState, useModal as useCampModal, CampModal } from "@campnetwork/origin/react";
import { useModal, ParaModal, OAuthMethod } from "@getpara/react-sdk";
import type { Address } from "viem/accounts";
import { dataURLtoFile } from "../utils/imageUtils";

interface MintButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  file?: any;
  imageId?: string;
  imageUrl?: string;
  prompt?: string;
  model?: string;
}

type LicenseTerms = {
  price: bigint;
  duration: number;
  royaltyBps: number;
  paymentToken: Address;
};

export function MintButton({ 
  onClick, 
  disabled = false,
  loading: externalLoading = false,
  className = "",
  imageUrl,
  prompt = "AI Generated Image",
  model = "AI Model",
  imageId
}: MintButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Access Camp authentication
  const { authenticated } = useAuthState();
  const { openModal: openCampModal } = useCampModal();
  const { origin, walletAddress, jwt } = useAuth();
  
  // Loading state
  const loading = externalLoading || internalLoading;

  const handleMint = async () => {
    if (disabled || loading) return;
    setError(null);
    setSuccess(false);
    
    try {
      // If not authenticated, open authentication modal
      if (!authenticated) {
        openCampModal();
        return;
      }

      // Check wallet connection
      if (!walletAddress) {
        setError("Wallet not connected. Please connect your wallet first.");
        return;
      }

      setInternalLoading(true);
      
      // Convert image URL to file object
      if (!imageUrl) {
        setError("No image available to mint");
        return;
      }
      
      // Create file from image URL
      const file = dataURLtoFile(
        imageUrl, 
        `ai-generated-${Date.now()}.png`
      );
      
      if (!file) {
        setError("Could not process image for minting");
        return;
      }
      
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        setError(`File too large (${fileSizeMB.toFixed(2)}MB). Maximum allowed is 10MB.`);
        return;
      }
      
      // Create NFT metadata
      const metadata = {
        name: prompt ? `AI Generated: ${prompt.substring(0, 30)}...` : "AI Generated Image",
        description: prompt || "Generated with AI",
        attributes: [
          {
            trait_type: "Generated with",
            value: model
          },
          {
            trait_type: "Prompt",
            value: prompt
          },
          {
            trait_type: "Date",
            value: new Date().toISOString().split('T')[0]
          }
        ]
      };
      
      // Create license terms
      const license = {
        price: BigInt(0),
        duration: 2629800, // 30 days in seconds
        royaltyBps: 0,
        paymentToken: "0x0000000000000000000000000000000000000000" as Address,
      } as LicenseTerms;

      console.log("Starting NFT minting...", {
        fileSize: fileSizeMB.toFixed(2) + "MB",
        walletAddress,
        model,
      });
      
      // Mint NFT
      const result = await origin.mintFile(file, metadata, license);
      
      // Set success state
      setSuccess(true);
      
      // Call onClick callback if provided
      if (onClick) onClick();
    } catch (mintError: any) {
      console.error("Minting failed:", mintError);
      
      // Determine the specific error message
      if (mintError?.message?.includes("BigInt") || mintError?.message?.includes("serialize")) {
        setError("Technical error with NFT data. Please try with a different wallet.");
      } else if (mintError?.message?.includes("signature") || mintError?.message?.includes("rejected")) {
        setError("Transaction rejected. Please approve the transaction in your wallet.");
      } else {
        setError("Failed to mint NFT. Please try again.");
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className={`w-full bg-[#3a3349] hover:bg-[#4a4359] 
          text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center
          shadow-md shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed 
          border border-[#4d4561] transition-colors ${className}`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleMint}
        disabled={disabled || loading}
      >
        <span className="tracking-wide">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div>
              Minting...
            </div>
          ) : (
            success ? "Minted!" : (authenticated ? "Mint NFT" : "Connect to Mint")
          )}
        </span>
      </motion.button>
      
      {error && (
        <div className="mt-2 text-center text-sm text-red-400 bg-red-900/20 p-2 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-2 text-center text-sm text-green-400 bg-green-900/20 p-2 rounded-md">
          Successfully minted as NFT!
        </div>
      )}

      {/* Modals */}
      <CampModal injectButton={false} />
      <ParaModal
        appName="Camp"
        oAuthMethods={[OAuthMethod.GOOGLE, OAuthMethod.TWITTER]}
        authLayout={["EXTERNAL:FULL", "AUTH:FULL"]}
        externalWallets={[
          "METAMASK",
          "WALLETCONNECT",
          "COINBASE",
          "OKX",
          "ZERION",
        ]}
        disablePhoneLogin
        recoverySecretStepEnabled
      />
    </>
  );
}
