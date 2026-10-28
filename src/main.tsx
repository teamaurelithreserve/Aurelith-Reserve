import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { BankingAuthProvider } from './context/BankingAuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BankingAuthProvider>
          <App />
        </BankingAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);

