import type { Classes } from '@tinymce/oxide/skins/ui/default/skin.ts';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { classes } from '../../utils/Styles';

const calculateClassFromVariant = (variant: 'primary' | 'secondary' | 'outlined' | 'naked'): (keyof Classes)[] => {
  switch (variant) {
    case 'primary':
      return [ 'tox-button' ];
    case 'secondary':
      return [ 'tox-button', 'tox-button--secondary' ];
    case 'outlined':
      return [ 'tox-button', 'tox-button--secondary--outline' ];
    case 'naked':
      return [ 'tox-button', 'tox-button--naked' ];
    default:
      return [ 'tox-button' ];
  }
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'outlined' | 'naked';
}

/** Primary UI component for user interaction */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  type = 'button',
  variant = 'primary',
  className,
  ...props
}, ref) => {
  return (
    <button
      type={type}
      className={`${classes(calculateClassFromVariant(variant))} ${className ?? ''}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
