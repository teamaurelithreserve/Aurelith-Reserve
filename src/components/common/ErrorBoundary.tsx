import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error caught by Aurelith Reserve ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    try {
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = Boolean(typeof import.meta !== 'undefined' && import.meta.env?.DEV);
      const errorMessage = this.state.error?.message || 'An unexpected rendering error occurred.';

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B111E] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 selection:bg-red-100 selection:text-red-900 font-sans">
          <div className="max-w-lg w-full bg-white dark:bg-[#152033] rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#C8102E] dark:text-red-400 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#C8102E] dark:text-red-400">
                Aurelith Reserve Security & System Notice
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C2B4C] dark:text-white">
                Unable to Display Page
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                The application encountered an unexpected issue while rendering this view. Your session credentials and account data remain secure.
              </p>
            </div>

            {isDev && errorMessage && (
              <div className="text-left bg-slate-50 dark:bg-[#0B111E] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] text-slate-700 dark:text-slate-300 font-mono break-all max-h-32 overflow-y-auto">
                <span className="font-bold text-red-600 dark:text-red-400 block mb-1">Diagnostic Details:</span>
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1C2B4C] dark:text-slate-200 text-xs font-bold rounded-full transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              Aurelith Reserve • Wealth Management & Banking Services • Member FDIC
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
