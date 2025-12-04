import { useId, useState, type FC } from 'react';

import * as Bem from '../../utils/Bem';
import { Icon } from '../icon/Icon';

export interface ToolbarInputFormProps {
  readonly onSubmit: (inputValue: string) => void;
  /*
   * The function to resolve the icon name to an html string.
   * This would eventually default to retrieving the icon from the editor's registry.
   * (name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'
   *
   * @param icon - The name of the icon
   * @returns The html string representation of the icon
   */
  readonly iconResolver: (icon: string) => string;
  readonly placeholder?: string;
  readonly label: string;
};

export const ToolbarInputForm: FC<ToolbarInputFormProps> = ({ onSubmit, iconResolver, label, placeholder }) => {
  const [ inputValue, setInputValue ] = useState('');
  const inputID = useId();

  return (
    <form
      className={Bem.block('toolbar-input-form')}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(inputValue);
      }}>
      <label htmlFor={inputID} className={Bem.block('tox-label')}>
        <span>{label}</span>
      </label>
      <input
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
        <Icon icon={'checkmark'} resolver={iconResolver}/>
      </button>
    </form>
  );
};