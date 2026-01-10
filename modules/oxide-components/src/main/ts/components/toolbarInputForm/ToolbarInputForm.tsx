import { useId, useState, type FC } from 'react';

import * as Bem from '../../utils/Bem';
import { Icon } from '../icon/Icon';

export interface ToolbarInputFormProps {
  readonly onSubmit: (inputValue: string) => void;
  readonly placeholder?: string;
  readonly label: string;
};

export const ToolbarInputForm: FC<ToolbarInputFormProps> = ({ onSubmit, label, placeholder }) => {
  const [ inputValue, setInputValue ] = useState('');
  const inputID = useId();

  return (
    <form
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
        autoFocus={true}
        placeholder={placeholder}
        id={inputID}
        type={'text'}
        required
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={
          Bem.block('tox-toolbar-textfield')
        }
      />
      <button className={Bem.block('tox-tbtn')} type="submit">
        <Icon icon={'checkmark'}/>
      </button>
    </form>
  );
};