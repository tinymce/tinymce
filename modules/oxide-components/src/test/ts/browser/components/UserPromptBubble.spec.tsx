import { UserPromptBubble } from 'oxide-components/bespoke/tinymceai/bubbles/UserPromptBubble';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.UserPromptBubbleTest', () => {
  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for a user prompt', () => {
      const { asFragment } = render(<UserPromptBubble prompt="Summarise this document" />, { wrapper: SnapshotTestUtils.snapshotWrapper });
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('User prompt');
    });
  });
});
