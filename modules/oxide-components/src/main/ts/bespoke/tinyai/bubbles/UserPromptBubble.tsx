import type { FunctionComponent } from 'react';

import * as Bem from '../../../utils/Bem';

interface UserPromptProps {
  readonly prompt: string;
}

export const UserPromptBubble: FunctionComponent<UserPromptProps> = ({ prompt }) => {
  return (
    <div
      tabIndex={-1}
      className={Bem.element('tox-ai', 'user-prompt__text')}
    >
      {prompt}
    </div>
  );
};
