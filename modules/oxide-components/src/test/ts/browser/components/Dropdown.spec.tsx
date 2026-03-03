import { Button } from 'oxide-components/components/button/Button';
import * as Dropdown from 'oxide-components/components/dropdown/Dropdown';
import * as Tooltip from 'oxide-components/components/tooltip/Tooltip';
import * as Bem from 'oxide-components/utils/Bem';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

describe('browser.DropdownTest', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        {children}
      </div>
    );
  };

  describe('Ref forwarding', () => {
    it('Dropdown.Trigger should forward ref to the child element', async () => {
      const triggerRef = createRef<HTMLElement>();

      render(
        <Dropdown.Root>
          <Dropdown.Trigger ref={triggerRef}>
            <button>Trigger</button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <div>Content</div>
          </Dropdown.Content>
        </Dropdown.Root>,
        { wrapper }
      );

      await expect.poll(() => triggerRef.current).not.toBeNull();
      expect(triggerRef.current?.tagName).toBe('BUTTON');
    });

    it('Dropdown.Trigger should forward ref through Tooltip.Trigger to the leaf element', async () => {
      const dropdownTriggerRef = createRef<HTMLElement>();

      render(
        <Tooltip.Root>
          <Dropdown.Root>
            <Dropdown.Trigger ref={dropdownTriggerRef}>
              <Tooltip.Trigger>
                <button>Trigger</button>
              </Tooltip.Trigger>
            </Dropdown.Trigger>
            <Dropdown.Content>
              <div>Dropdown Content</div>
            </Dropdown.Content>
          </Dropdown.Root>
          <Tooltip.Content text='Tooltip text' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => dropdownTriggerRef.current).not.toBeNull();
      expect(dropdownTriggerRef.current?.tagName).toBe('BUTTON');
    });

    it('Dropdown.Trigger should forward ref to the same element as a forwardRef child', async () => {
      const triggerRef = createRef<HTMLElement>();

      const { getByText } = render(
        <Dropdown.Root>
          <Dropdown.Trigger ref={triggerRef}>
            <Button variant='secondary'>Click me</Button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <div>Content</div>
          </Dropdown.Content>
        </Dropdown.Root>,
        { wrapper }
      );

      await expect.poll(() => triggerRef.current).not.toBeNull();
      expect(triggerRef.current).toBe(getByText('Click me').element());
    });
  });

  describe('Event handler forwarding', () => {
    it('Dropdown.Trigger should invoke onClick on the child and open the dropdown', async () => {
      const childOnClick = vi.fn();

      const { getByText } = render(
        <Dropdown.Root>
          <Dropdown.Trigger>
            <button onClick={childOnClick}>Trigger</button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <div>Dropdown Content</div>
          </Dropdown.Content>
        </Dropdown.Root>,
        { wrapper }
      );

      await userEvent.click(getByText('Trigger'));
      expect(childOnClick).toHaveBeenCalledOnce();
      await expect.poll(() => document.querySelector('[popover]:popover-open'))
        .toHaveTextContent('Dropdown Content');
    });

  });

  describe('Dropdown + Tooltip composition', () => {
    it('Should open dropdown on click when Tooltip.Trigger wraps the child', async () => {
      const { getByText } = render(
        <Tooltip.Root>
          <Dropdown.Root side='bottom' align='start'>
            <Dropdown.Trigger>
              <Tooltip.Trigger>
                <Button variant='secondary'>Trigger</Button>
              </Tooltip.Trigger>
            </Dropdown.Trigger>
            <Dropdown.Content>
              <div>Dropdown Content</div>
            </Dropdown.Content>
          </Dropdown.Root>
          <Tooltip.Content text='Tooltip text' />
        </Tooltip.Root>,
        { wrapper }
      );

      await userEvent.click(getByText('Trigger'));
      await expect.poll(() => document.querySelector('[popover]:popover-open'))
        .toHaveTextContent('Dropdown Content');
    });

    it('Should chain all three refs when Dropdown.Trigger wraps Tooltip.Trigger wraps Button', async () => {
      const outerRef = createRef<HTMLElement>();
      const buttonRef = createRef<HTMLButtonElement>();

      render(
        <Tooltip.Root>
          <Dropdown.Root>
            <Dropdown.Trigger ref={outerRef}>
              <Tooltip.Trigger>
                <Button ref={buttonRef} variant='secondary'>Trigger</Button>
              </Tooltip.Trigger>
            </Dropdown.Trigger>
            <Dropdown.Content>
              <div>Content</div>
            </Dropdown.Content>
          </Dropdown.Root>
          <Tooltip.Content text='Tip' />
        </Tooltip.Root>,
        { wrapper }
      );

      await expect.poll(() => outerRef.current).not.toBeNull();
      expect(outerRef.current).toBe(buttonRef.current);
      expect(outerRef.current?.textContent).toBe('Trigger');
    });

    it('Should fire both dropdown click and tooltip mouse handlers on the composed trigger', async () => {
      const { getByText } = render(
        <Tooltip.Root>
          <Dropdown.Root side='bottom' align='start'>
            <Dropdown.Trigger>
              <Tooltip.Trigger>
                <Button variant='secondary'>Trigger</Button>
              </Tooltip.Trigger>
            </Dropdown.Trigger>
            <Dropdown.Content>
              <div>Dropdown Content</div>
            </Dropdown.Content>
          </Dropdown.Root>
          <Tooltip.Content text='Tooltip text' />
        </Tooltip.Root>,
        { wrapper }
      );

      // Hover should open tooltip (after delay)
      await userEvent.hover(getByText('Trigger'));
      await expect.poll(
        () => document.querySelector(Bem.blockSelector('tox-tooltip')),
        { timeout: 1000 }
      ).toHaveTextContent('Tooltip text');

      // Click should open dropdown
      await userEvent.click(getByText('Trigger'));
      await expect.poll(() => document.querySelector('[popover]:popover-open'))
        .toHaveTextContent('Dropdown Content');
    });
  });
});
