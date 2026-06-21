import React from 'react';
import { Button } from './Common';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong.' };
  }

  componentDidCatch(error, info) {
    console.error('GLOWOUT GH UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-surface-0 px-4 py-16 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gold/20 bg-surface-1 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl">!</div>
          <p className="section-eyebrow mb-3">GLOWOUT GH Recovery</p>
          <h1 className="font-display text-3xl font-bold">This page needs a refresh</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#C8BAD0]">
            The interface caught an unexpected error before it could break the full website. Refresh the page or return to the store dashboard.
          </p>
          <p className="mt-4 rounded-2xl border border-[rgba(201,169,110,.12)] bg-surface-2 p-3 text-sm text-[#8A7A98]">{this.state.message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button variant="outline" onClick={() => { window.location.hash = '#home'; window.location.reload(); }}>Return Home</Button>
          </div>
        </div>
      </div>
    );
  }
}
