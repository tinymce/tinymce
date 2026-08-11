import { Optional } from '@ephox/katamari';
import { KeyboardNavigationHooks } from 'oxide-components/main';
import { useEffect, useId, useMemo, useRef, useState, type FC } from 'react';

import * as Bem from '../../utils/Bem';
import { Icon } from '../icon/Icon';

export interface ToolbarInputFormProps {
  readonly onSubmit: (inputValue: string) => void;
  readonly onEscape: () => void;
  readonly placeholder?: string;
  readonly label: string;
  readonly autoFocus?: boolean;
};

export const ToolbarInputForm: FC<ToolbarInputFormProps> = ({ onSubmit, onEscape, label, placeholder, autoFocus = true }) => {
  const [ inputValue, setInputValue ] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputID = useId();

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [ autoFocus ]);

  const tabNavigationProps: KeyboardNavigationHooks.TabKeyingProps = useMemo(() => ({
    containerRef: formRef,
    selector: [
      Bem.blockSelector('tox-toolbar-textfield'),
      Bem.blockSelector('tox-tbtn')
    ].join(', '),
    escape: () => {
      onEscape();
      return Optional.some(true);
    }
  }), [ onEscape ]);
  KeyboardNavigationHooks.useTabKeyNavigation(tabNavigationProps);

  return (
    <form
      ref={formRef}
      className={Bem.block('tox-toolbar-input-form')}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(inputValue);
      }}>
      <label htmlFor={inputID} className={Bem.block('tox-label')}>
        <span>{label}</span>
      </label>
      <input
        ref={inputRef}
        placeholder={placeholder}
        id={inputID}
        type="text"
        required
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={Bem.block('tox-toolbar-textfield')}
      />
      <button className={Bem.block('tox-tbtn')} type="submit">
        <Icon icon={'checkmark'}/>
      </button>
    </form>
  );
};