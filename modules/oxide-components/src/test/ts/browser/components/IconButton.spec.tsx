import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

describe('browser.components.IconButtonTest', () => {
  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for every variant', () => {
      const { asFragment } = render(
        <>
          <IconButton variant="primary" icon="bold" aria-label="Bold" />
          <IconButton variant="secondary" icon="bold" aria-label="Bold" />
          <IconButton variant="outlined" icon="bold" aria-label="Bold" />
          <IconButton variant="naked" icon="bold" aria-label="Bold" />
        </>,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('All variants');
    });

    it('TINYMCE-14505: Should match snapshot for the active and disabled states', () => {
      const { asFragment } = render(
        <>
          <IconButton icon="bold" aria-label="Bold" active />
          <IconButton icon="bold" aria-label="Bold" disabled />
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

  describe('Accessible name', () => {
    it('TINYMCE-14742: Should name the button with aria-label', async () => {
      const { getByRole } = render(
        <IconButton icon="close" aria-label="Close" />,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      await expect.element(getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    });

    it('TINYMCE-14742: Should name the button with aria-labelledby', async () => {
      const labelId = 'icon-button-accessible-name';
      const { getByRole } = render(
        <>
          <span id={labelId} hidden>Dismiss the dialog</span>
          <IconButton icon="close" aria-labelledby={labelId} />
        </>,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      await expect.element(getByRole('button', { name: 'Dismiss the dialog', exact: true })).toBeVisible();
    });
  });

  describe('Type contract', () => {
    it('TINYMCE-14742: Should reject a missing or duplicated accessible name at compile time', () => {
      const rejected = [
        // @ts-expect-error TINYMCE-14742: an accessible name is required
        <IconButton icon="close" />,
        // @ts-expect-error TINYMCE-14742: only one accessible name source is allowed
        <IconButton icon="close" aria-label="Close" aria-labelledby="close-label" />
      ];
      expect(rejected).toHaveLength(2);
    });
  });
});
