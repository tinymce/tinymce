import { Fun } from '@ephox/katamari';
import * as Tooltip from 'oxide-components/components/tooltip/Tooltip';
import { createTooltipTrigger, UniverseProvider } from 'oxide-components/main';
import * as Bem from 'oxide-components/utils/Bem';
import * as Browser from 'oxide-components/utils/Browser';
import { createRef, useState, type FC } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

vi.mock(import('oxide-components/utils/Browser'), () => ({
  isSafari: vi.fn(Fun.never)
}));

beforeEach(() => {
  vi.mocked(Browser.isSafari).mockReturnValue(false);
});

describe('browser.TooltipTest', () => {
  const getIcon = vi.fn((icon: string) => `<svg id="${icon}"></svg>`);
  const mockUniverse = {
    getIcon,
    currentTooltipTrigger: createTooltipTrigger()
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        <UniverseProvider resources={mockUniverse}>
          {children}
        </UniverseProvider>
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

  describe('TINY-14072: showCondition prop', () => {
    const tooltipSelector = Bem.blockSelector('tox-tooltip');

    it('should render Content by default (showCondition defaults to "always")', async () => {
      render(
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div style={{ width: '200px', overflow: 'hidden', whiteSpace: 'nowrap' }}>Short</div>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => document.querySelector(tooltipSelector)).not.toBeNull();
    });

    it('should not mount Content when showCondition is "overflow" and trigger does not overflow', async () => {
      render(
        <Tooltip.Root showCondition='overflow'>
          <Tooltip.Trigger>
            <div style={{ width: '200px', overflow: 'hidden', whiteSpace: 'nowrap' }}>Short</div>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => document.querySelector(tooltipSelector)).toBeNull();
    });

    it('should mount Content when showCondition is "overflow" and trigger overflows', async () => {
      render(
        <Tooltip.Root showCondition='overflow'>
          <Tooltip.Trigger>
            <div style={{ width: '50px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              This text is much longer than the trigger width
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => document.querySelector(tooltipSelector)).not.toBeNull();
    });
  });

  describe('TINY-14378: Reacts to changes in the Trigger children', () => {
    const tooltipSelector = Bem.blockSelector('tox-tooltip');

    const ReactiveHarness: FC<{ initialText: string; nextText: string }> = ({ initialText, nextText }) => {
      const [ text, setText ] = useState(initialText);
      return (
        <>
          <button data-testid='swap' onClick={() => setText(nextText)}>swap</button>
          <Tooltip.Root showCondition='overflow'>
            <Tooltip.Trigger>
              <div style={{ width: '50px', overflow: 'hidden', whiteSpace: 'nowrap' }}>{text}</div>
            </Tooltip.Trigger>
            <Tooltip.Content text='Tooltip' />
          </Tooltip.Root>
        </>
      );
    };

    it('unmounts Content when trigger text shrinks from overflowing to fitting', async () => {
      const { getByTestId } = render(
        <ReactiveHarness initialText='This text is much longer than the trigger width' nextText='Hi' />,
        { wrapper }
      );

      // Popover is mounted while the trigger overflows.
      await expect.poll(() => document.querySelector(tooltipSelector)).not.toBeNull();

      // Shrink the text; the MutationObserver should fire and unmount the popover.
      await userEvent.click(getByTestId('swap'));

      await expect.poll(() => document.querySelector(tooltipSelector)).toBeNull();
    });

    it('mounts Content when trigger text grows from fitting to overflowing', async () => {
      const { getByTestId } = render(
        <ReactiveHarness initialText='Hi' nextText='This text is much longer than the trigger width' />,
        { wrapper }
      );

      // Initially not overflowing — popover is not in the DOM.
      await expect.poll(() => document.querySelector(tooltipSelector)).toBeNull();

      await userEvent.click(getByTestId('swap'));

      await expect.poll(() => document.querySelector(tooltipSelector)).not.toBeNull();
    });
  });

  describe('TINY-14032: showCondition overflow gate', () => {
    const tooltipSelector = Bem.blockSelector('tox-tooltip');

    it('should not mount Content on Safari when showCondition is "overflow" and trigger overflows', async () => {
      vi.mocked(Browser.isSafari).mockReturnValue(true);

      render(
        <Tooltip.Root showCondition='overflow'>
          <Tooltip.Trigger>
            <div style={{ width: '50px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              This text is much longer than the trigger width
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      expect(document.querySelector(tooltipSelector)).toBeNull();
    });

    it('should mount Content on non-Safari when showCondition is "overflow" and trigger overflows', async () => {
      vi.mocked(Browser.isSafari).mockReturnValue(false);

      render(
        <Tooltip.Root showCondition='overflow'>
          <Tooltip.Trigger>
            <div style={{ width: '50px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              This text is much longer than the trigger width
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => document.querySelector(tooltipSelector)).not.toBeNull();
    });

    it('should mount Content on Safari when showCondition is "always"', async () => {
      vi.mocked(Browser.isSafari).mockReturnValue(true);

      render(
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div>Short</div>
          </Tooltip.Trigger>
          <Tooltip.Content text='Tooltip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => document.querySelector(tooltipSelector)).not.toBeNull();
    });

    it('TINYMCE-14507: opening a tooltip in different Roots should close the previous opened', async () => {
      vi.mocked(Browser.isSafari).mockReturnValue(true);
      const childOnMouseEnter = vi.fn();

      const { getByText } = render(
        <div style={{ display: 'flex', rowGap: '5xp' }}>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <div id="first" tabIndex={0}>Short</div>
            </Tooltip.Trigger>
            <Tooltip.Content text='Tooltip' />
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <div id="second" onMouseEnter={childOnMouseEnter}>Hover me</div>
            </Tooltip.Trigger>
            <Tooltip.Content text='Tooltip2' />
          </Tooltip.Root>
        </div>,
        { wrapper }
      );

      const firstDiv: HTMLDivElement | null = document.querySelector('#first');
      const openTooltipSelector = `${tooltipSelector}:popover-open`;
      await expect.poll(() => document.querySelector(openTooltipSelector)).toBeNull();

      const allTooltipEls = document.querySelectorAll(tooltipSelector);
      const firstTooltipEl = allTooltipEls[0];
      const secondTooltipEl = allTooltipEls[1];

      firstDiv?.focus();
      await expect.poll(() => firstTooltipEl.matches(':popover-open')).toBe(true);
      await userEvent.hover(getByText('Hover me'));
      expect(childOnMouseEnter).toHaveBeenCalledOnce();

      await expect.poll(() => secondTooltipEl.matches(':popover-open')).toBe(true);
      expect(document.querySelectorAll(openTooltipSelector).length).toBe(1);
    });
  });
});
