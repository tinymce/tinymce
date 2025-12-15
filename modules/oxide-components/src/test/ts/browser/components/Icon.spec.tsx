import { Arr } from '@ephox/katamari';
import { Icon } from 'oxide-components/components/icon/Icon';
import { UniverseProvider } from 'oxide-components/main';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

const chevronDownTestIconId = 'chevron-down-icon';
const chevronUpTestIconId = 'chevron-up-icon';

describe('browser.components.Icon', () => {
  it('TINY-13316: should render icons using universe context', async () => {
    const getIcon = vi.fn((icon: string) => `<svg id="${icon}"></svg>`);
    const mockUniverse = {
      getIcon,
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
});
