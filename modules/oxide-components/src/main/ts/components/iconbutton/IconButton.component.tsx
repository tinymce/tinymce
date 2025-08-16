import { Icon, type IconProps } from '../../internal/icon/Icon.component';
import { classes } from '../../utils/Styles';
import { Button, type ButtonProps } from '../button/Button.component';

export interface IconButtonProps extends IconProps, Omit<ButtonProps, 'children'> {
  readonly children?: never;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, resolver, ...props }) => {
  return (
    <Button {...props} className={classes([ 'tox-button--icon' ])} >
      <Icon icon={icon} resolver={resolver} />
    </Button>
  );
};
