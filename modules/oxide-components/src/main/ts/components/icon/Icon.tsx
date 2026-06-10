import { useUniverse } from '../../contexts/UniverseContext/Universe';
import { classes } from '../../utils/Styles';

import type { IconProps } from './IconTypes';

export const Icon: React.FC<IconProps & React.HTMLAttributes<HTMLSpanElement>> = ({ icon, ...rest }) => {
  const { getIcon } = useUniverse();

  return (
    <span
      className={classes([ 'tox-icon' ])}
      dangerouslySetInnerHTML={{ __html: getIcon(icon) }}
      {...rest}
    />
  );
};
