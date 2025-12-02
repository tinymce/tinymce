import { classes } from '../../utils/Styles';

import type { IconProps } from './IconTypes';

export const Icon: React.FC<IconProps & React.HTMLAttributes<HTMLSpanElement>> = ({ icon, resolver, ...rest }) => {
  return (
    <span
      className={classes([ 'tox-icon' ])}
      dangerouslySetInnerHTML={{ __html: resolver(icon) }}
      {...rest}
    />
  );
};
