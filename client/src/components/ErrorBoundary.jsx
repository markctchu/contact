import React from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Send the error to your server logs!
    const errorData = {
      message: error.toString(),
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.error('[ErrorBoundary] Caught crash:', errorData);
    
    // Only send if socket is available
    if (socket && socket.connected) {
      socket.emit(EVENTS.ERROR_REPORT, errorData);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-10 text-center">
          <div className="bg-surface-lowest p-10 rounded-xl ambient-shadow max-w-md border border-tertiary/10">
            <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter mb-4">Interface Error</h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              The application encountered an unexpected visual error. We've automatically reported this to the logs.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-tertiary text-white font-black rounded-full uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg"
            >
              Reload Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
