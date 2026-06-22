import { Fun } from '@ephox/katamari';
import { Bem, Tag, UniverseProvider, type UniverseResources } from 'oxide-components/main';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

const resources: UniverseResources = {
  getIcon: Fun.constant(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path fill="#222F3E" fill-rule="evenodd" d="M11.723 5.62 9.356 8l2.367 2.38a.95.95 0 0 1-1.343 1.343L8 9.356l-2.38 2.367a.95.95 0 0 1-1.343-1.343L6.644 8 4.277 5.62A.95.95 0 0 1 5.62 4.277L8 6.644l2.38-2.367a.95.95 0 0 1 1.343 1.343Z"/>
  </svg>
`),
};

describe('browser.bespoke.tinymceai.Tag', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        {children}
      </div>
    );
  };

  it('TINY-13541: should call the onClose callback when the backspace/delete key is pressed', async () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <UniverseProvider resources={resources}>
        <Tag data-testid="tag" ref={(el) => el?.focus()} closeable link={false} label="Test Tag" onClose={onClose} />
      </UniverseProvider>,
      { wrapper }
    );
    const tag = getByTestId('tag');
    await expect.element(tag).toHaveFocus();
    await userEvent.keyboard('{Backspace}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Delete}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
