import { Arr, Fun } from '@ephox/katamari';
import { Icon } from 'oxide-components/components/icon/Icon';
import { UniverseProvider } from 'oxide-components/Main';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import * as SnapshotTestUtils from './utils/SnapshotTestUtils';

const chevronDownTestIconId = 'chevron-down-icon';
const chevronUpTestIconId = 'chevron-up-icon';

describe('browser.components.Icon', () => {
  it('TINY-13316: should render icons using universe context', async () => {
    const getIcon = vi.fn((icon: string) => `<svg id="${icon}"></svg>`);
    const mockUniverse = {
      getIcon,
      translate: Fun.identity,
    };

    const { getByTestId } = render(
      <UniverseProvider resources={mockUniverse}>
        <Icon icon="chevron-down" data-testid={chevronDownTestIconId} />
        <Icon icon="chevron-up" data-testid={chevronUpTestIconId} />
      </UniverseProvider>
    );

    expect(getIcon).toHaveBeenCalledTimes(2);
    expect(getIcon).toHaveBeenNthCalledWith(1, 'chevron-down');
    expect(getIcon).toHaveBeenNthCalledWith(2, 'chevron-up');

    Arr.each([ chevronDownTestIconId, chevronUpTestIconId ], (id) => {
      const element = getByTestId(id);
      expect(element).toBeVisible();
    });
  });

  describe('Snapshot Tests', () => {
    it('TINYMCE-14505: Should match snapshot for a rendered icon', () => {
      const { asFragment } = render(<Icon icon="chevron-down" />, { wrapper: SnapshotTestUtils.snapshotWrapper });
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Icon');
    });

    it('TINYMCE-14505: Should match snapshot for an icon with extra span attributes', () => {
      const { asFragment } = render(
        <Icon icon="chevron-up" aria-hidden="true" data-testid={chevronUpTestIconId} />,
        { wrapper: SnapshotTestUtils.snapshotWrapper }
      );
      expect(SnapshotTestUtils.normalize(asFragment())).toMatchSnapshot('Icon with span attributes');
    });
  });
});
