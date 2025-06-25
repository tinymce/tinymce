import styles from '@tinymce/oxide/skins/ui/default/skin.ts';
import type { ButtonHTMLAttributes } from 'react';

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
      className={styles['tox-button']}
      {...props}
    >
      {children}
    </button>
  );
};
