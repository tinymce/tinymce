import { forwardRef, useEffect, useRef, useState, type MouseEventHandler } from 'react';

import { Spinner } from '../../bespoke/tinymceai/spinner/Spinner';
import * as Bem from '../../utils/Bem';
import { Button } from '../button/Button';

export interface ConfirmationProps {
  readonly title: string;
  readonly text: string;
  readonly buttonName: string;
  readonly cancelBtnName?: string;
  readonly onConfirm: () => Promise<void>;
  readonly onCancel: () => Promise<void>;
}

const Loading = () => <div style={{ margin: 'auto' }} >
  <Spinner type="circle" />
</div>;

export const Confirmation = forwardRef<HTMLDivElement, ConfirmationProps>(({
  title,
  text,
  buttonName,
  cancelBtnName = 'Cancel',
  onConfirm,
  onCancel
}) => {
  const [ confirming, setConfirming ] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirming(true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    onConfirm().finally(() => {
      setConfirming(false);
      dialogRef.current?.close();
    });
  };

  const onCancelHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    onCancel().finally(() => {
      dialogRef.current?.close();
    });
  };

  return <dialog ref={dialogRef} style={{ margin: 'auto' }}>
    <div className={Bem.block('tox-dialog-wrap')}>
      {confirming ? <Loading /> :
        <div className={Bem.element('tox-dialog-wrap', 'backdrop')}>
          <div className={Bem.block('tox-dialog')}>
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
                  variant='primary'
                  onClick={onClick}
                  aria-label={buttonName}
                >{buttonName}</Button>
                <Button
                  variant='secondary'
                  onClick={onCancelHandler}
                  aria-label={cancelBtnName}
                >{cancelBtnName}</Button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  </dialog>;
});
