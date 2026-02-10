import React, { useState, useEffect } from 'react';
import NorthAmericaRevenueChart from './components/NorthAmericaRevenueChart.jsx';

/**
 * Error Boundary component to catch and display React errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Dashboard Error</h2>
          <p>Something went wrong while loading the dashboard.</p>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  // Simulate app initialization (database connection check)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppLoading(true);
        setAppError(null);
        
        // Check if DATABASE_URL is configured
        if (!import.meta.env.DATABASE_URL && !process.env.DATABASE_URL) {
          console.warn('DATABASE_URL not configured. Chart data may not load.');
        }
        
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('App initialization error:', error);
        setAppError('Failed to initialize dashboard');
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (appLoading) {
    return (
      <div className="app">
        <div className="app-loading">
          <h1>KPI Dashboard</h1>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (appError) {
    return (
      <div className="app">
        <div className="app-error">
          <h1>KPI Dashboard</h1>
          <p>{appError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <h1>KPI Dashboard</h1>
        <h2>Key metrics analysis</h2>
        
        {/* North America Revenue Chart - Top Section */}
        <NorthAmericaRevenueChart />
        
        <p>Additional dashboard features will be built by Epicraft agent.</p>
      </div>
    </ErrorBoundary>
  );
}

export default App;