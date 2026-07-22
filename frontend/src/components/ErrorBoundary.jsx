import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-6 rounded-3xl shadow-flat-lg text-center space-y-4">
            <div className="inline-flex p-3 bg-red-100 dark:bg-red-950/20 border-2 border-slate-950 rounded-2xl">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Something went wrong</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                An unexpected rendering error occurred. The developer team has been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-left max-h-32 overflow-y-auto">
                <p className="text-[10px] font-mono text-red-500 break-all leading-normal">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-black py-2.5 rounded-xl border-2 border-slate-950 text-xs shadow-flat-sm active:translate-y-[1px] active:shadow-none transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reload Page</span>
              </button>
              <a
                href="#/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-black py-2.5 rounded-xl border-2 border-slate-950 dark:border-slate-850 text-xs shadow-flat-sm active:translate-y-[1px] active:shadow-none transition flex items-center justify-center gap-1.5"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Go Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
