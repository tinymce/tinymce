import { Fun } from '@ephox/katamari';
import { Alert } from 'oxide-components/components/alert/Alert';
import { Button } from 'oxide-components/components/button/Button';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.AlertTest', () => {
  const actions = (
    <>
      <Button variant="outlined">Retry</Button>
      <Button variant="naked">Dismiss</Button>
    </>
  );

  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for an error alert', () => {
      const { asFragment } = render(<Alert severity="error" message="Something went wrong" />, { wrapper: SnapshotTestUtils.snapshotWrapper });
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Error');
    });

    it('TINYMCE-14505: Should match snapshot for a warning alert', () => {
      const { asFragment } = render(<Alert severity="warning" message="Check your input" />, { wrapper: SnapshotTestUtils.snapshotWrapper });
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Warning');
    });

    it('TINYMCE-14505: Should match snapshot for a removable error alert with actions', () => {
      const { asFragment } = render(
        <Alert severity="error" message="Something went wrong" actions={actions} removable onRemove={Fun.noop} />,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Error, removable, with actions');
    });

    it('TINYMCE-14505: Should match snapshot for a removable warning alert with a custom close label', () => {
      const { asFragment } = render(
        <Alert severity="warning" message="Check your input" removable onRemove={Fun.noop} closeAriaLabel="Dismiss warning" />,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Warning, removable, custom close label');
    });
  });
});
