'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <div className="bg-white border-2 border-hairline rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-soft-lg space-y-5">
            <div className="w-16 h-16 mx-auto bg-amber/10 border-2 border-amber/30 rounded-2xl flex items-center justify-center text-amber">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-xl md:text-2xl text-ink">
                Oops! A Minor Magic Hiccup
              </h2>
              <p className="text-sm font-body text-muted leading-relaxed">
                Dyuti the Lantern stumbled on a tricky path. Your progress is saved locally.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-sand p-3 rounded-xl border border-hairline text-xs font-mono text-ink-secondary overflow-x-auto">
                <summary className="cursor-pointer font-display font-semibold text-ink-tertiary mb-1">
                  Technical Details
                </summary>
                <p className="text-terracotta">{this.state.error.toString()}</p>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl font-display font-bold text-sm bg-amber text-ink border-2 border-amber-600/30 hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Restart World
              </button>

              <Link
                href="/"
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl font-display font-bold text-sm bg-white text-ink border-2 border-hairline hover:bg-sand transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
