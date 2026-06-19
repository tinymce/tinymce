import { forwardRef, useImperativeHandle, useState } from 'react';

import { Confirmation } from '../Confirmation';

interface ConfirmOptions {
  readonly text: string;
  readonly onConfirm: () => Promise<void>;
}

export interface ConfirmationHostHandle {
  confirm: (options: ConfirmOptions) => void;
}

export const ConfirmationHost = forwardRef<ConfirmationHostHandle>((_props, ref) => {
  const [ request, setRequest ] = useState<ConfirmOptions | null>(null);

  useImperativeHandle(ref, () => ({
    confirm: (options) => setRequest(options),
  }), []);

  return request ? <Confirmation
    text={request.text}
    buttonName='Yes'
    cancelBtnName='No'
    onConfirm={() => request.onConfirm().finally(() => setRequest(null))}
    onCancel={() => {
      setRequest(null);
      return Promise.resolve();
    }}
  /> : null;
});
