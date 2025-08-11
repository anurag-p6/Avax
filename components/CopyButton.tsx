"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  color?: string;
  className?: string;
}

export default function CopyButton({ 
  value, 
  color = 'white',
  className = '' 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.button
      className={`p-1 rounded-md hover:bg-[#3a3545]/50 transition-colors ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className={`h-3 w-3 text-${color}`} />
      ) : (
        <Copy className={`h-3 w-3 text-${color}`} />
      )}
    </motion.button>
  );
}
