"use client";

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth, useAuthState, useModal as useCampModal, CampModal } from "@campnetwork/origin/react";
import { useModal, ParaModal, OAuthMethod } from "@getpara/react-sdk";

interface WalletButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function WalletButton({ 
  onClick,
  className = ""
}: WalletButtonProps) {
  const { authenticated } = useAuthState();
  const { openModal: openCampModal } = useCampModal();
  
  const handleWalletAction = () => {
    if (!authenticated) {
      openCampModal();
    } else {
      // Handle disconnect if needed
    }
    
    if (onClick) onClick();
  };
  
  // For display purposes - simulate a truncated wallet address when connected
  const displayAddress = authenticated ? 
    `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}` : '';
  
  return (
    <>
      <div className="mt-auto p-4 flex items-center justify-between text-gray-300 border-t border-[#1a1625]">
        <motion.button
          className={`w-full bg-[#2d2936] hover:bg-[#3a3545] text-white rounded-md py-2 font-medium flex items-center justify-center gap-2 ${className}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWalletAction}
        >
          {authenticated ? (
            <>
              <span className="text-sm">
                {displayAddress}
              </span>
              <LogOut className="w-4 h-4" />
            </>
          ) : (
            <span className="text-sm">Connect Wallet</span>
          )}
        </motion.button>
      </div>

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
          