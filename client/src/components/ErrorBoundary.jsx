import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CampusShelf caught an unhandled rendering error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white max-w-md w-full p-8 border border-slate-200 rounded-xl shadow-card space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              An unexpected error occurred
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              CampusShelf encountered an unhandled view error. Your session data remains safe.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="py-2 px-4 rounded-lg bg-brand-navy hover:bg-slate-900 text-white text-xs font-medium shadow-subtle flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
