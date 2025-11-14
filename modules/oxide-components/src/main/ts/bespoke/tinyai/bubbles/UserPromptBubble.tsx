import * as Bem from 'oxide-components/utils/Bem';
import type { FunctionComponent } from 'react';

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
