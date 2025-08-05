"use client";

import { ReactNode } from 'react';

export const usePhantom = () => {
  return {
    phantom: null,
    connected: false,
    publicKey: null,
    connect: async () => {},
    disconnect: async () => {},
  };
};

export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}