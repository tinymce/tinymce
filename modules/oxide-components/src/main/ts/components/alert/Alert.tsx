import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import * as Bem from '../../utils/Bem';
import { IconButton } from '../iconbutton/IconButton';

const calculateClassFromSeverity = (severity: 'error' | 'warning'): string => {
  switch (severity) {
    case 'error':
      return Bem.block('tox-alert', { error: true });
    case 'warning':
      return Bem.block('tox-alert', { warning: true });
    default:
      return Bem.block('tox-alert');
  }
};

interface BaseAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  readonly message: string;
  readonly severity: 'error' | 'warning';
  readonly actions?: ReactNode;
}

interface NonRemovableAlertProps {
  readonly removable?: false;
  readonly onRemove?: never;
}

interface RemovableAlertProps {
  readonly removable: true;
  readonly onRemove: () => void;
}

export type AlertProps = BaseAlertProps & (NonRemovableAlertProps | RemovableAlertProps);

export const Alert = forwardRef<HTMLDivElement, AlertProps>(({
  message,
  severity,
  removable = false,
  onRemove,
  actions,
  ...domProps
}, ref) => {
  return (
    <div
      ref={ref}
      className={calculateClassFromSeverity(severity)}
      role='alert'
      aria-live='polite'
      {...domProps}
    >
      <div className={Bem.element('tox-alert', 'body')}>
        <div className={Bem.element('tox-alert', 'content')}>
          <p className={Bem.element('tox-alert', 'message')}>{message}</p>
        </div>
        {actions && (
          <div className={Bem.element('tox-alert', 'actions')}>
            {actions}
          </div>
        )}
      </div>
      {removable && (
        <IconButton
          variant='naked'
          icon='close'
          onClick={onRemove}
          aria-label='Close'
        />
      )}
    </div>
  );
});
