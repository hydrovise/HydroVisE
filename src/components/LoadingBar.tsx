import React, { useState } from 'react';

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    // Simulate loading progress
    if (isVisible) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsVisible(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 10;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const showProgress = (show: boolean = true) => {
    setIsVisible(show);
    if (show) {
      setProgress(1);
    }
  };

  // Expose function to global scope for compatibility
  React.useEffect(() => {
    (window as any).showProgress = showProgress;
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      id="progressDIV"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div 
        className="bgLoading" 
        id="progressbar"
        style={{
          width: '300px',
          height: '30px',
          backgroundColor: '#333',
          borderRadius: '15px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            borderRadius: '15px',
            transition: 'width 0.1s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {progress}%
        </div>
      </div>
    </div>
  );
}
