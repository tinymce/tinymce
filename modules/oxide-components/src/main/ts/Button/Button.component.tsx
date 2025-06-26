import type { ButtonHTMLAttributes } from 'react';

import { classes } from '../utils/Styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
}

/** Primary UI component for user interaction */
export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={classes([ 'tox-button' ])}
      {...props}
    >
      {children}
    </button>
  );
};
