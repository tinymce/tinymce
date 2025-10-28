import { forwardRef, type ButtonHTMLAttributes } from 'react';

import * as Bem from '../../utils/Bem';

const calculateClassFromVariant = (variant: 'primary' | 'secondary' | 'outlined' | 'naked', modifiers: { enabled: boolean }): string => {
  switch (variant) {
    case 'primary':
      return Bem.block('tox-button', modifiers);
    case 'secondary':
      return Bem.block('tox-button', { ...modifiers, secondary: true });
    case 'outlined':
      return Bem.block('tox-button', { ...modifiers, 'secondary--outline': true }); // TODO: Update to use correct BEM modifier when available #TINY-13169
    case 'naked':
      return Bem.block('tox-button', { ...modifiers, naked: true });
    default:
      return Bem.block('tox-button', modifiers);
  }
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'outlined' | 'naked';
  readonly active?: boolean;
}

/** Primary UI component for user interaction */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  type = 'button',
  variant = 'primary',
  active = false,
  className,
  ...props
}, ref) => {
  return (
    <button
      type={type}
      className={`${calculateClassFromVariant(variant, { enabled: active })} ${className ?? ''}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
