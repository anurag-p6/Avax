'use client';

import React from 'react';
import type { ComponentProps } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, MessageCircle, BookOpen, Code } from 'lucide-react';

export type AISuggestionsProps = ComponentProps<'div'>;

export const AISuggestions = ({
  className,
  children,
  ...props
}: AISuggestionsProps) => (
  <div className="w-full" {...props}>
    <div className={cn('flex flex-wrap items-center gap-2 py-2 px-2', className)}>
      {children}
    </div>
  </div>
);

export type AISuggestionProps = ComponentProps<typeof motion.button> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export interface AISuggestion {
  id: string;
  text: string;
}

interface AISuggestionsListProps {
  suggestions: AISuggestion[];
  onSuggestionClick: (suggestion: string) => void;
}

export const AISuggestionsList: React.FC<AISuggestionsListProps> = ({ 
  suggestions, 
  onSuggestionClick 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map(suggestion => (
        <button 
          key={suggestion.id}
          onClick={() => onSuggestionClick(suggestion.text)}
          className="px-3 py-1.5 bg-[#2d2936] hover:bg-[#3a3545] rounded-full text-xs text-gray-300 transition-colors"
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

// Default suggestions that can be used throughout the app
export const DEFAULT_AI_SUGGESTIONS = [
  'Pump Fun stake',
  'Check my SOL balance',
  'Send 0.1 SOL to...',
  'Create a token',
  'What tokens do I own?',
  'Stake SOL to validator',
  'Swap SOL to USDC using JUP',
  'Show me NFT collections',
  'How to create an SPL token?',
];

export const DEFAULT_SUGGESTIONS: AISuggestion[] = [
  {
    id: '1',
    text: 'Generate image of cyberpunk girl with neon lights'
  },
  {
    id: '2',
    text: 'Draw a futuristic fighter jet over a city'
  },
  {
    id: '3',
    text: 'Create image of space station orbiting Earth'
  },
  {
    id: '4',
    text: 'Show me NFT collections'
  },
  {
    id: '5',
    text: 'Draw a steampunk mechanical owl'
  },
  {
    id: '6',
    text: 'How to create an SPL token?'
  }
];

export const AISuggestion = ({
  suggestion,
  onClick,
  className,
  children,
  ...props
}: AISuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <motion.button
      className={cn(
        'cursor-pointer rounded-full px-4 py-1 text-xs bg-[#2d2936] text-gray-300 border border-[#3a3545]/50 hover:bg-[#3a3545] transition-colors',
        className
      )}
      onClick={handleClick}
      type="button"
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children || suggestion}
    </motion.button>
  );
};
