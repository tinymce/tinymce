import { Bem, IconButton } from 'oxide-components/main';
import * as React from 'react';

interface BaseProps {
  readonly message: string;
}

interface NonRemoveableErrorMessageProps extends BaseProps {
  readonly removable?: false;
}

interface RemoveableErrorMessageProps extends BaseProps {
  readonly removable: true;
  readonly onRemove: () => void;
}

export type ErrorMessageProps = NonRemoveableErrorMessageProps | RemoveableErrorMessageProps;

const ErrorMessage: React.FC<ErrorMessageProps> = (props) => {
  const { message, removable } = props;
  return (
    <div className={Bem.block('tox-ai-error')} role="alert" aria-live="polite">
      <div className={Bem.element('tox-ai-error', 'message')}>
        {message}
      </div>
      {removable && (
        <div className={Bem.element('tox-ai-error', 'icon')}>
          <IconButton variant='naked' icon='close' onClick={props.onRemove} />
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
