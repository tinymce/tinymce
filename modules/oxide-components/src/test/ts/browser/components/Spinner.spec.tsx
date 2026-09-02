import { Spinner } from 'oxide-components/bespoke/tinymceai/spinner/Spinner';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.SpinnerTest', () => {
  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for the circle type', () => {
      const { asFragment } = render(
        <>
          <Spinner type="circle" />
          <Spinner type="circle" size="small" />
        </>,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Circle, both sizes');
    });

    it('TINYMCE-14505: Should match snapshot for the dots type', () => {
      const { asFragment } = render(
        <>
          <Spinner type="dots" />
          <Spinner type="dots" size="small" />
        </>,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Dots, both sizes');
    });

    it('TINYMCE-14505: Should match snapshot for a spinner with a custom colour', () => {
      const { asFragment } = render(<Spinner color="red" />, { wrapper: SnapshotTestUtils.snapshotWrapper });
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Custom colour');
    });
  });
});
