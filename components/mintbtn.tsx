"use client"

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth, useAuthState, useModal as useCampModal, CampModal } from "@campnetwork/origin/react";
import { useModal, ParaModal, OAuthMethod } from "@getpara/react-sdk";

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
  const { origin, jwt } = useAuth();
  const [internalLoading, setInternalLoading] = useState(false);
  const { authenticated } = useAuthState();
  const { openModal: openCampModal } = useCampModal();
  const { openModal: openParaModal } = useModal();
  
  // Use either external loading state or internal loading state
  const loading = externalLoading || internalLoading;

  const handleMint = async () => {
    if (disabled || loading) return;
    
    try {
      // If not authenticated, open authentication modal
      if (!authenticated) {
        openCampModal();
        return;
      }

      setInternalLoading(true);
      
      if (file && imageId && meta && origin && jwt) {
        const licence = {
          price: 0n,
          duration: 0n,
          royaltyBps: 0,
          paymentToken: "0x0000000000000000000000000000000000000000",
        } as const;

        const parentId = 4n; // optional: define if this is a derivative
        await origin.mintFile(file, meta, licence, parentId);
      }
      
      // If custom onClick handler is provided, call it
      if (onClick) onClick();
    } catch (error) {
      console.error("Minting failed:", error);
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
          {loading ? "Processing..." : (authenticated ? "Mint NFT" : "Connect to Mint")}
        </span>
        {loading && (
          <div className="ml-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
        )}
      </motion.button>

      {/* Modals are rendered at root level but don't display unless opened */}
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
