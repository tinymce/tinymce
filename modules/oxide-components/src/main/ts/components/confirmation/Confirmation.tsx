import { useCallback, useEffect, useRef, useState, type FC, type MouseEventHandler } from 'react';

import { Spinner } from '../../bespoke/tinymceai/spinner/Spinner';
import * as Bem from '../../utils/Bem';
import { Button } from '../button/Button';

export interface ConfirmationProps {
  readonly text: string;
  readonly buttonName: string;
  readonly cancelBtnName: string;
  readonly onConfirm: () => Promise<void>;
  readonly onCancel: () => Promise<void>;
}

export const Confirmation: FC<ConfirmationProps> = ({
  text,
  buttonName,
  cancelBtnName,
  onConfirm,
  onCancel
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [ confirming, setConfirming ] = useState(false);

  useEffect(() => {
    confirmButtonRef.current?.focus();
  }, [ confirmButtonRef ]);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirming(true);
    void onConfirm()
      // eslint-disable-next-line no-console
      .catch(console.error)
      .finally(() => {
        setConfirming(false);
      });
  }, [ onConfirm ]);

  return <div className={Bem.block('tox-dialog-wrap')}>
    <div style={{ display: 'flex' }} className={Bem.element('tox-dialog-wrap', 'backdrop')}>
      <dialog style={{ margin: 'auto' }} className={Bem.block('tox-dialog')}>
        <div className={Bem.element('tox-dialog', 'body')}>
          <div className={Bem.element('tox-dialog', 'body-content')}>
            {text}
          </div>
        </div>
        <div className={Bem.element('tox-dialog', 'footer')}>
          <div className={Bem.element('tox-dialog', 'footer-start')}></div>
          <div className={Bem.element('tox-dialog', 'footer-end')}>
            <Button
              variant='primary'
              ref={confirmButtonRef}
              disabled={confirming}
              onClick={onClick}
              aria-label={buttonName}
            >{confirming ? <Spinner type="circle" color='lightgray' /> : buttonName}</Button>
            <Button
              variant='secondary'
              disabled={confirming}
              onClick={() => {
                // eslint-disable-next-line no-console
                void onCancel().catch(console.error);
              }}
              aria-label={cancelBtnName}
            >{cancelBtnName}</Button>
          </div>
        </div>
      </dialog>
    </div>
  </div>;
};
