"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch Camp Network connection errors
 * and prevent them from crashing the application
 */
export class ConnectErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Connection error caught:", error);
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
          <h3 className="text-red-400 font-medium mb-2">Connection Error</h3>
          <p className="text-sm text-gray-300 mb-3">
            There was a problem connecting to the wallet service.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-sm bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-1 rounded-md"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
