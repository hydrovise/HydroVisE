import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} />;
      }

      return (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          borderRadius: '8px',
          maxWidth: '600px',
          textAlign: 'center',
          border: '2px solid #dc3545'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
            🚨 Application Error
          </h2>
          
          <p style={{ marginBottom: '16px' }}>
            Something went wrong while rendering this component.
          </p>
          
          {this.state.error && (
            <details style={{ 
              marginBottom: '16px', 
              textAlign: 'left',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '12px',
              borderRadius: '4px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto', 
                maxHeight: '200px',
                marginTop: '8px',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error.message}
                {this.state.error.stack && (
                  <>
                    <br /><br />
                    Stack Trace:
                    <br />
                    {this.state.error.stack}
                  </>
                )}
              </pre>
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by hook:', error, errorInfo);
    
    // You could dispatch to a global error state here
    // or show a toast notification
  };
}

// Utility component for async error handling
export function AsyncErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      <React.Suspense fallback={
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>
            🌊 Loading HydroVisE...
          </div>
          <div style={{ fontSize: '14px', color: '#aaa' }}>
            Please wait while we load the application
          </div>
        </div>
      }>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}
