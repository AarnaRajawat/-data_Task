import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { TicketExplorerPage } from './pages/TicketExplorerPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Create a single stable QueryClient instance with race condition safety defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Do not retry 4xx client errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
      staleTime: 1000 * 30, // 30s fresh
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-900">
            <Header />
            <div className="flex-1">
              <Routes>
                <Route path="/tickets" element={<TicketExplorerPage />} />
                <Route path="/" element={<Navigate to="/tickets" replace />} />
                <Route path="*" element={<Navigate to="/tickets" replace />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
