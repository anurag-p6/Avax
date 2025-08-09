"use client"

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth, useAuthState, useModal as useCampModal, CampModal } from "@campnetwork/origin/react";
import { useModal, ParaModal, OAuthMethod } from "@getpara/react-sdk";
import { assignImage } from "../utils/assignImage";

interface MintButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  file?: any;
  imageId?: string;
  meta?: any;
}

export function MintButton({ 
  onClick, 
  disabled = false,
  loading: externalLoading = false,
  className = "",
  file,
  imageId,
  meta
}: MintButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Access Camp authentication
  const { authenticated } = useAuthState();
  const { openModal: openCampModal } = useCampModal();
  const { origin, jwt } = useAuth();
  
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

      setInternalLoading(true);
      
      if (file && imageId && meta && origin && jwt) {
        try {
          // Use direct BigInt literals to avoid serialization issues
          const licence = {
            price: BigInt(0),
            duration: BigInt(0),
            royaltyBps: 0,
            paymentToken: "0x0000000000000000000000000000000000000000",
          };

          // Create a safe metadata object with only primitive values
          const safeMeta = {
            name: String(meta.name || "AI Generated Image"),
            description: String(meta.description || ""),
            properties: {
              timestamp: new Date().toISOString(),
              ...(meta.properties?.model ? { model: String(meta.properties.model) } : {})
            }
          };
          
          // Mint the NFT
          await origin.mintFile(file, safeMeta, licence, BigInt(4));
          
          // Assign the image
          await assignImage(imageId, jwt);
          
          // Set success state
          setSuccess(true);
          
          // Call onClick callback if provided
          if (onClick) onClick();
        } catch (mintError: any) {
          console.error("Minting failed:", mintError);
          setError("Failed to mint NFT. Please try again.");
        }
      } else {
        if (!origin || !jwt) {
          setError("Authentication issue. Please reconnect your wallet.");
          openCampModal();
        } else if (!file) {
          setError("No image file to mint.");
        }
      }
    } catch (error: any) {
      console.error("Error in mint process:", error);
      setError(error?.message || "An error occurred. Please try again.");
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
          {loading ? "Processing..." : 
           success ? "Minted!" :
           authenticated ? "Mint NFT" : "Connect to Mint"}
        </span>
        {loading && (
          <div className="ml-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
        )}
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
