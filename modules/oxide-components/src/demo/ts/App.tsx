import { Button } from 'oxide-components/components/button/Button';
import React, { useState } from 'react';

const App: React.FC = () => {
  const [ count, setCount ] = useState(0);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)} >
          {`count is ${count}`}
        </Button>
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
