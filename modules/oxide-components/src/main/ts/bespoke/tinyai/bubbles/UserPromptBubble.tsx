import type { FunctionComponent } from 'react';

import { classes } from '../../../utils/Styles';

interface UserPromptProps {
  readonly prompt: string;
}

export const UserPromptBubble: FunctionComponent<UserPromptProps> = ({ prompt }) => {
  return (
    <div
      tabIndex={-1}
      className={classes([ 'tox-ai__user-prompt__text' ])}
    >
      {prompt}
    </div>
  );
};
