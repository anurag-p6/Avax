/**
 * Safely access a potentially undefined property chain
 * Prevents the "Cannot read property of undefined" errors
 */
export function safeAccess<T, K extends keyof T>(obj: T | undefined | null, key: K): T[K] | undefined {
  return obj === undefined || obj === null ? undefined : obj[key];
}

/**
 * Wrap async operations to catch errors and provide fallback
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  errorHandler?: (error: any) => void,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error) {
    if (errorHandler) errorHandler(error);
    else console.error("Operation failed:", error);
    return fallback;
  }
}

/**
 * Helper for safely accessing Camp Network authentication
 */
export function handleCampError(error: any): string {
  // Extract useful information from Camp Network errors
  if (!error) return "Unknown error occurred";
  
  // Common Camp Network errors
  if (error.message?.includes("connect")) {
    return "Connection to Camp Network failed. Please try again.";
  }
  
  if (error.message?.includes("wallet") || error.message?.includes("provider")) {
    return "Wallet connection issue. Please reconnect your wallet.";
  }
  
  if (error.message?.includes("mint")) {
    return "Failed to mint NFT. Please check your wallet has sufficient funds.";
  }
  
  // Default error message
  return error.message || "An error occurred. Please try again.";
}
