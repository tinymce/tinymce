import { useCallback, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Confirmation } from '../Confirmation';

interface Request {
  text: string;
  onConfirm: () => Promise<void>;
}

export const useConfirmation = (container: HTMLElement | null): (text: string, onConfirm: () => Promise<void>) => void => {
  const [ root, setRoot ] = useState<Root | null>(null);
  const [ request, setRequest ] = useState<Request | null>(null);

  useEffect(() => {
    if (container) {
      const r = createRoot(container);
      setRoot(r);
      return () => r.unmount();
    }
  }, [ container ]);

  useEffect(() => {
    if (root) {
      root.render(
        request
          ? <Confirmation
            title=''
            text={request.text}
            buttonName='Yes'
            cancelBtnName='No'
            onConfirm={() => request.onConfirm().finally(() => setRequest(null))}
            onCancel={() => {
              setRequest(null); return Promise.resolve();
            }}
          />
          : null
      );
    }
  }, [ root, request ]);

  return useCallback((text: string, onConfirm: () => Promise<void>) => {
    setRequest({ text, onConfirm });
  }, []);
};
