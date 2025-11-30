import { forwardRef } from 'react';

import { classes } from '../../utils/Styles';
import { Button, type ButtonProps } from '../button/Button';
import { Icon } from '../icon/Icon';
import type { IconProps } from '../icon/IconTypes';

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
