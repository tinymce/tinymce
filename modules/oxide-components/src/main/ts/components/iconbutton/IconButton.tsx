import { forwardRef } from 'react';

import { Icon, type IconProps } from '../../internal/icon/Icon.component';
import { classes } from '../../utils/Styles';
import { Button, type ButtonProps } from '../button/Button';

export interface IconButtonProps extends IconProps, Omit<ButtonProps, 'children' | 'className'> {
  readonly children?: never;
  readonly className?: never;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const { icon, resolver, ...rest } = props;

  return (
    <Button ref={ref} {...rest} className={classes([ 'tox-button--icon' ])} >
      <Icon icon={icon} resolver={resolver} />
    </Button>
  );
});
