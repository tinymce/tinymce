import { forwardRef, type InputHTMLAttributes, type KeyboardEvent } from 'react';

interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onClick'> {
  readonly onClick: () => void;
  readonly onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  readonly disabled?: boolean;
}

const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ onClick, onKeyDown, checked, name, children, ...rest }, ref) => (
    <label className="tox-toggle">
      <input
        type="checkbox"
        ref={ref}
        tabIndex={-1}
        checked={checked}
        name={name}
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-checked={checked}
        {...rest}
      />
      <span className="tox-toggle__slider" />
      {children}
    </label>
  ));

export {
  ToggleSwitch
};
