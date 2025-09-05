import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@tinymce/oxide/build/skins/ui/default/skin.css';

import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <div className="tox">
      <App />
    </div>
  </StrictMode>
);
