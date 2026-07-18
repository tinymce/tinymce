import { UserPromptBubble } from 'oxide-components/main';
import { describe, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

describe('visual.UserPromptBubbleTest', () => {
  it('renders the simple user prompt bubble state', async () => {
    const screen = renderVisual(
      <div className='tox-ai'>
        <UserPromptBubble prompt='Value' />
      </div>
    );
    await screen.expectScreenshot('user-prompt-bubble-simple-user-prompt-bubble');
  });
});
