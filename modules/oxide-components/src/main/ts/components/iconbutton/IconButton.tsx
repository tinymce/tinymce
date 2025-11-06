import { Icon, type IconProps } from '../../internal/icon/Icon.component';
import { classes } from '../../utils/Styles';
import { Button, type ButtonProps } from '../button/Button';

export interface IconButtonProps extends IconProps, Omit<ButtonProps, 'children' | 'className'> {
  readonly children?: never;
  readonly className?: never;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, resolver, ...props }) => {
  return (
    <Button {...props} className={classes([ 'tox-button--icon' ])} >
      <Icon icon={icon} resolver={resolver} />
    </Button>
  );
};
