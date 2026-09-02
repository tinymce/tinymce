import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.IconButtonTest', () => {
  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for every variant', () => {
      const { asFragment } = render(
        <>
          <IconButton variant="primary" icon="bold" />
          <IconButton variant="secondary" icon="bold" />
          <IconButton variant="outlined" icon="bold" />
          <IconButton variant="naked" icon="bold" />
        </>,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('All variants');
    });

    it('TINYMCE-14505: Should match snapshot for the active and disabled states', () => {
      const { asFragment } = render(
        <>
          <IconButton icon="bold" active />
          <IconButton icon="bold" disabled />
        </>,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Active and disabled');
    });

    it('TINYMCE-14505: Should match snapshot for an icon button with an aria-label', () => {
      const { asFragment } = render(<IconButton icon="close" aria-label="Close" />, { wrapper: SnapshotTestUtils.snapshotWrapper });
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('With aria-label');
    });
  });
});
