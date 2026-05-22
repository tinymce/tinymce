import { useCallback, useState, type FC, type MouseEventHandler } from 'react';

import { Spinner } from '../../bespoke/tinymceai/spinner/Spinner';
import * as Bem from '../../utils/Bem';
import { Button } from '../button/Button';

export interface ConfirmationProps {
  readonly title: string;
  readonly text: string;
  readonly buttonName: string;
  readonly cancelBtnName: string;
  readonly onConfirm: () => Promise<void>;
  readonly onCancel: () => Promise<void>;
}

export const Confirmation: FC<ConfirmationProps> = (({
  title,
  text,
  buttonName,
  cancelBtnName = 'Cancel',
  onConfirm,
  onCancel
}) => {
  const [ confirming, setConfirming ] = useState(false);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirming(true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    onConfirm().finally(() => {
      setConfirming(false);
    });
  }, [ onConfirm ]);

  return <div className={Bem.block('tox-dialog-wrap')}>
    <div style={{ display: 'flex' }} className={Bem.element('tox-dialog-wrap', 'backdrop')}>
      <div style={{ margin: 'auto' }} className={Bem.block('tox-dialog')}>
        <div className={Bem.element('tox-dialog', 'header')}>
          <h1 className={Bem.element('tox-dialog', 'title')}>{title}</h1>
        </div>
        <div className={Bem.element('tox-dialog', 'body')}>
          <div className={Bem.element('tox-dialog', 'body-content')}>
            {text}
          </div>
        </div>
        <div className={Bem.element('tox-dialog', 'footer')}>
          <div className={Bem.element('tox-dialog', 'footer-end')}>
            <Button
              variant='secondary'
              disabled={confirming}
              onClick={onClick}
              aria-label={buttonName}
            >{confirming ? <Spinner type="circle" /> : buttonName}</Button>
            <Button
              variant='secondary'
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                onCancel();
              }}
              aria-label={cancelBtnName}
            >{cancelBtnName}</Button>
          </div>
        </div>
      </div>
    </div>
  </div>;
});
