import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Confirmation } from '../Confirmation';

export interface ConfirmOptions {
  readonly text: string;
  readonly onConfirm: () => Promise<void>;
}

export interface ConfirmationHostHandle {
  confirm: (options: ConfirmOptions) => void;
}

interface ConfirmRequest {
  readonly id: number;
  readonly options: ConfirmOptions;
}

export const ConfirmationHost = forwardRef<ConfirmationHostHandle>((_props, ref) => {
  const [ request, setRequest ] = useState<ConfirmRequest | null>(null);
  const nextIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    confirm: (options) => {
      nextIdRef.current += 1;
      setRequest({ id: nextIdRef.current, options });
    },
  }), []);

  // Keyed by request so a newer one gets a fresh dialog, not the previous one's pending confirm state
  return request ? <Confirmation
    key={request.id}
    text={request.options.text}
    onConfirm={() => mountedRef.current ?
      // A newer request may have replaced this one while it was pending
      request.options.onConfirm().finally(() => setRequest((current) => current?.id === request.id ? null : current)) :
      Promise.resolve()
    }
    onCancel={() => {
      setRequest(null);
      return Promise.resolve();
    }}
  /> : null;
});
