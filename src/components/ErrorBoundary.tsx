import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React component error caught by boundary:', error, errorInfo);
  }

  public componentDidMount() {
    // Non-blocking unhandled rejection logger for telemetry
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection captured (non-blocking):', event.reason);
    };
    window.addEventListener('unhandledrejection', handleRejection);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="pop-error-boundary" className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-neutral-900 border border-orange-500/30 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              An unexpected interface error occurred. You can safely reload the page or return to the POP Gaming home lobby.
            </p>

            {this.state.error && (
              <div className="bg-neutral-950 rounded-xl p-4 text-left mb-6 border border-neutral-800 text-xs font-mono text-neutral-400 overflow-x-auto">
                <p className="text-red-400 font-semibold mb-1">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="btn-reload-error"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-xl transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                id="btn-home-error"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Return to Lobby
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

