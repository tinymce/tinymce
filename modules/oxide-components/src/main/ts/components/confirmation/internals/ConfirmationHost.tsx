import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Confirmation } from '../Confirmation';

export interface ConfirmOptions {
  readonly text: string;
  readonly onConfirm: () => Promise<void>;
}

export interface ConfirmationHostHandle {
  confirm: (options: ConfirmOptions) => void;
}

export const ConfirmationHost = forwardRef<ConfirmationHostHandle>((_props, ref) => {
  const [ request, setRequest ] = useState<ConfirmOptions | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    confirm: (options) => setRequest(options),
  }), []);

  return request ? <Confirmation
    text={request.text}
    buttonName='Yes'
    cancelBtnName='No'
    onConfirm={() => mountedRef.current ?
      request.onConfirm().finally(() => setRequest(null)) :
      Promise.resolve()
    }
    onCancel={() => {
      setRequest(null);
      return Promise.resolve();
    }}
  /> : null;
});
