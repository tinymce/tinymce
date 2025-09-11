import { Button } from 'oxide-components/components/button/Button';
import { FloatingSidebar } from 'oxide-components/components/floatingsidebar/FloatingSidebar';
import React, { useState } from 'react';

const App: React.FC = () => {
  const [ count, setCount ] = useState(0);
  const [ isFloatingSidebarOpen, setIsFloatingSidebarOpen ] = useState(false);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)} >
          {`count is ${count}`}
        </Button>
        <Button onClick={() => setIsFloatingSidebarOpen(!isFloatingSidebarOpen)} >
          Toggle floating sidebar
        </Button>
        <FloatingSidebar
          isOpen={isFloatingSidebarOpen}
          onClose={ () => setIsFloatingSidebarOpen(false) }
          title={'I am floating sidebar!'}
        >
          <p>I am a sidebar content</p>
          <Button onClick={() => setIsFloatingSidebarOpen(!isFloatingSidebarOpen)} >Close me!</Button>
        </FloatingSidebar>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;
