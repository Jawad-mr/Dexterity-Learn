import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Create a React Query client with smart production retry strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry 401 (Unauthorized) or 404 (Not Found) errors
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
      gcTime: 10 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
