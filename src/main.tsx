import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('unhandledrejection', event => {
  if (event.reason && typeof event.reason.message === 'string') {
    if (
      event.reason.message.includes('INTERNAL ASSERTION FAILED: Pending promise was never set') ||
      event.reason.message.includes('The user aborted a request')
    ) {
      event.preventDefault();
    }
  }
});

const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string') {
    if (
      args[0].includes('INTERNAL ASSERTION FAILED: Pending promise was never set') ||
      args[0].includes('The user aborted a request')
    ) {
      return;
    }
  }
  originalConsoleError(...args);
};

createRoot(document.getElementById('root')!).render(
  <App />
);
