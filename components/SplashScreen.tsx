import React, { useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Immediately finish - no splash screen delay
    onFinish();
  }, [onFinish]);

  return null; // Don't render anything
};

export default SplashScreen;
