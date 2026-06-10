import * as Tooltip from 'oxide-components/components/tooltip/Tooltip';
import * as Bem from 'oxide-components/utils/Bem';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

describe('browser.TooltipTest', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        {children}
      </div>
    );
  };

  describe('Ref forwarding', () => {
    it('Tooltip.Trigger should forward ref to the child element', async () => {
      const triggerRef = createRef<HTMLElement>();

      render(
        <Tooltip.Root>
          <Tooltip.Trigger ref={triggerRef}>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => triggerRef.current).not.toBeNull();
      expect(triggerRef.current?.tagName).toBe('BUTTON');
    });

    it('Tooltip.Content should forward ref to the popover element', async () => {
      const contentRef = createRef<HTMLDivElement>();

      render(
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content ref={contentRef} text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => contentRef.current).not.toBeNull();
      expect(contentRef.current?.tagName).toBe('DIV');
    });
  });

  describe('Event handler forwarding', () => {
    it('Tooltip.Trigger should preserve child mouse event handlers', async () => {
      const childOnMouseEnter = vi.fn();
      const childOnMouseLeave = vi.fn();

      const { getByText } = render(
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button onMouseEnter={childOnMouseEnter} onMouseLeave={childOnMouseLeave}>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await userEvent.hover(getByText('Hover me'));
      expect(childOnMouseEnter).toHaveBeenCalledOnce();

      await userEvent.unhover(getByText('Hover me'));
      expect(childOnMouseLeave).toHaveBeenCalledOnce();
    });
  });
});
