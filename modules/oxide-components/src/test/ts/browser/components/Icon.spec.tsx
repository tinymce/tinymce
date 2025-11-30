import { Arr } from '@ephox/katamari';
import { Icon } from 'oxide-components/components/icon/Icon';
import { Fragment } from 'react/jsx-runtime';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

const chevronDownTestIconId = 'chevron-down-icon';
const chevronUpTestIconId = 'chevron-up-icon';
const customTestIconId = 'custom-icon-icon';

describe('browser.Icon', () => {
  it('TINY-13316: should render icons using resolver', async () => {
    const resolver = vi.fn((icon: string) => `<svg id="${icon}"></svg>`);
    const { getByTestId } = render(
      <Fragment>
        <Icon icon="chevron-down" resolver={resolver} dataTestId={chevronDownTestIconId} />
        <Icon icon="chevron-up" resolver={resolver} dataTestId={chevronUpTestIconId} />
        <Icon icon="custom-icon" resolver={resolver} dataTestId={customTestIconId} />
      </Fragment>
    );

    expect(resolver).toHaveBeenCalledTimes(3);
    expect(resolver).toHaveBeenNthCalledWith(1, 'chevron-down');
    expect(resolver).toHaveBeenNthCalledWith(2, 'chevron-up');
    expect(resolver).toHaveBeenNthCalledWith(3, 'custom-icon');

    Arr.each([ chevronDownTestIconId, chevronUpTestIconId, customTestIconId ], (id) => {
      const element = getByTestId(id);
      expect(element).toBeVisible();
    });
  });
});
