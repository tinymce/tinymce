import { Fun } from '@ephox/katamari';
import { ToolbarInputForm } from 'oxide-components/components/toolbarinputform/ToolbarInputForm';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.ToolbarInputFormTest', () => {
  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for an empty form', () => {
      const { asFragment } = render(
        <ToolbarInputForm label="Prompt" placeholder="Ask anything" onSubmit={Fun.noop} onEscape={Fun.noop} />,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Empty form');
    });

    it('TINYMCE-14505: Should match snapshot for a form with a typed value', async () => {
      const { asFragment, getByRole } = render(
        <ToolbarInputForm label="Prompt" onSubmit={Fun.noop} onEscape={Fun.noop} />,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );

      await userEvent.fill(getByRole('textbox'), 'Summarise this');

      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Form with a typed value');
    });
  });
});
