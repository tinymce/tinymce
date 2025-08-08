import { Optional } from '@ephox/katamari';
import { useMemo } from 'react';

import { DefaultAvatar } from '../utils';
import { classes } from '../utils/Styles';

export interface AvatarProps {
  user: { id: string; name: string; avatar?: string };
}

/** UI component for user avatar */
export const Avatar: React.FC<AvatarProps> = ({ user }) => {
  const avatar = useMemo(
    () => Optional.from(user.avatar).getOr(DefaultAvatar.generateUserAvatar({ id: user.id, name: user.name })),
    [ user.id, user.avatar, user.name ]
  );
  return (
    <div className={classes([ 'tox-avatar' ])}>
      <img alt='' role='presentation' src={avatar} />
    </div>
  );
};
