import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@tinymce/oxide/build/skins/ui/default/skin.css';

import App from './App.tsx';

// @ts-expect-error this is just a test file
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="tox">
      <App />
    </div>
  </StrictMode>
);
