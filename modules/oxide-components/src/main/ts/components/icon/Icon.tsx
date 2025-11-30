import { classes } from '../../utils/Styles';

import type { IconProps } from './IconTypes';

export const Icon: React.FC<IconProps> = ({ icon, dataTestId, resolver }) => {
  return (
    <span
      className={classes([ 'tox-icon' ])}
      data-testid={dataTestId}
      dangerouslySetInnerHTML={{ __html: resolver(icon) }}
    />
  );
};
