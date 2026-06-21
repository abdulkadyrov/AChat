import React from "react";

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("AChat runtime error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0f1724] px-4 py-8 text-white">
          <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/5 p-5">
            <h1 className="text-xl font-extrabold">AChat crashed</h1>
            <p className="mt-3 text-sm text-slate-300">
              Приложение поймало runtime-ошибку вместо белого экрана.
            </p>
            <pre className="mt-4 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-rose-200">
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
