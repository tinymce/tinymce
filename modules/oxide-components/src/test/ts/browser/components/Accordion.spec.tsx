import { SelectorFind, SugarElement } from '@ephox/sugar';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { userEvent } from '@vitest/browser/context';
import * as Accordion from 'oxide-components/components/accordion/Accordion';
import { UniverseProvider } from 'oxide-components/main';
import * as Bem from 'oxide-components/utils/Bem';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  'chevron-down': allIcons['chevron-down'],
  'chevron-up': allIcons['chevron-up']
};

describe('browser.components.AccordionTest', () => {
  const getIcon = vi.fn((icon: string) => icons[icon] || `<svg id="${icon}"></svg>`);
  const mockUniverse = {
    getIcon,
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

  it('TINY-13450: Should expand and collapse items on click (single-expand mode)', async () => {
    const { getByRole } = render(
      <Accordion.Root allowMultiple={false}>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button1 = getByRole('button', { name: /Item 1/i });
    const button2 = getByRole('button', { name: /Item 2/i });

    expect(button1.element()).toHaveAttribute('aria-expanded', 'false');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(button1);
    expect(button1.element()).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(button2);
    expect(button1.element()).toHaveAttribute('aria-expanded', 'false');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'true');
  });

  it('TINY-13450: Should allow multiple items to be expanded in multi-expand mode', async () => {
    const { getByRole } = render(
      <Accordion.Root allowMultiple={true}>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button1 = getByRole('button', { name: /Item 1/i });
    const button2 = getByRole('button', { name: /Item 2/i });

    await userEvent.click(button1);
    expect(button1.element()).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(button2);
    expect(button1.element()).toHaveAttribute('aria-expanded', 'true');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'true');
  });

  it('TINY-13450: Should toggle item on Enter key press', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });

    expect(button.element()).toHaveAttribute('aria-expanded', 'false');

    button.element().focus();
    await userEvent.keyboard('{Enter}');

    expect(button.element()).toHaveAttribute('aria-expanded', 'true');
  });

  it('TINY-13450: Should toggle item on Space key press', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });

    expect(button.element()).toHaveAttribute('aria-expanded', 'false');

    button.element().focus();
    await userEvent.keyboard('{ }');

    expect(button.element()).toHaveAttribute('aria-expanded', 'true');
  });

  it('TINY-13450: Should navigate between items with arrow keys', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
        <Accordion.Item id="item3" title="Item 3">
          <p>Content 3</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button1 = getByRole('button', { name: /Item 1/i });
    const button2 = getByRole('button', { name: /Item 2/i });
    const button3 = getByRole('button', { name: /Item 3/i });

    button1.element().focus();
    expect(document.activeElement).toBe(button1.element());

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(button2.element());

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(button3.element());

    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(button2.element());
  });

  it('TINY-13450: Should jump to first item with Home key', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
        <Accordion.Item id="item3" title="Item 3">
          <p>Content 3</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button1 = getByRole('button', { name: /Item 1/i });
    const button3 = getByRole('button', { name: /Item 3/i });

    button3.element().focus();
    expect(document.activeElement).toBe(button3.element());

    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(button1.element());
  });

  it('TINY-13450: Should jump to last item with End key', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
        <Accordion.Item id="item3" title="Item 3">
          <p>Content 3</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button1 = getByRole('button', { name: /Item 1/i });
    const button3 = getByRole('button', { name: /Item 3/i });

    button1.element().focus();
    expect(document.activeElement).toBe(button1.element());

    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(button3.element());
  });

  it('TINY-13450: Should not expand disabled items', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1" disabled>
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });

    expect(button.element()).toHaveAttribute('aria-disabled', 'true');
    expect(button.element()).toHaveAttribute('aria-expanded', 'false');
    expect(button.element()).toHaveAttribute('disabled');
  });

  it('TINY-13450: Should work in controlled mode', async () => {
    const TestComponent = () => {
      const [ expanded, setExpanded ] = useState<string[]>([]);

      return (
        <div>
          <button onClick={() => setExpanded([ 'item1' ])}>Expand Item 1</button>
          <button onClick={() => setExpanded([ 'item2' ])}>Expand Item 2</button>
          <button onClick={() => setExpanded([])}>Collapse All</button>
          <Accordion.Root expanded={expanded} onExpandedChange={setExpanded}>
            <Accordion.Item id="item1" title="Item 1">
              <p>Content 1</p>
            </Accordion.Item>
            <Accordion.Item id="item2" title="Item 2">
              <p>Content 2</p>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      );
    };

    const { getByRole } = render(<TestComponent />, { wrapper });

    const button1 = getByRole('button', { name: 'Item 1', exact: true });
    const button2 = getByRole('button', { name: 'Item 2', exact: true });
    const expandItem1Button = getByRole('button', { name: 'Expand Item 1' });
    const expandItem2Button = getByRole('button', { name: 'Expand Item 2' });
    const collapseAllButton = getByRole('button', { name: 'Collapse All' });

    expect(button1.element()).toHaveAttribute('aria-expanded', 'false');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(expandItem1Button);
    expect(button1.element()).toHaveAttribute('aria-expanded', 'true');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(expandItem2Button);
    expect(button1.element()).toHaveAttribute('aria-expanded', 'false');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(collapseAllButton);
    expect(button1.element()).toHaveAttribute('aria-expanded', 'false');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'false');
  });

  it('TINY-13450: Should have proper ARIA attributes', async () => {
    const { getByRole, container } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });
    const region = SelectorFind.descendant<HTMLElement>(
      SugarElement.fromDom(container),
      '[role="region"]'
    ).getOrDie();

    expect(button.element()).toHaveAttribute('aria-expanded');
    expect(button.element()).toHaveAttribute('aria-controls');

    const controlsId = button.element().getAttribute('aria-controls');
    expect(region.dom).toHaveAttribute('id', controlsId);
    expect(region.dom).toHaveAttribute('aria-labelledby', button.element().id);
  });

  it('TINY-13450: Should use default expanded items in uncontrolled mode', async () => {
    const { getByRole } = render(
      <Accordion.Root defaultExpanded={[ 'item1' ]}>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button1 = getByRole('button', { name: /Item 1/i });
    const button2 = getByRole('button', { name: /Item 2/i });

    expect(button1.element()).toHaveAttribute('aria-expanded', 'true');
    expect(button2.element()).toHaveAttribute('aria-expanded', 'false');
  });

  it('TINY-13450: Should always render content (hidden via CSS when collapsed)', async () => {
    const { getByRole, getByText } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });

    expect(getByText('Content 1').element()).toBeTruthy();

    await userEvent.click(button);
    expect(getByText('Content 1').element()).toBeTruthy();
  });

  it('TINY-13450: Should position icon at end when iconPosition is set to end', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1" iconPosition="end">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });
    expect(button.element().className).toContain('tox-accordion__header--icon-end');
  });

  it('TINY-13450: Should position icon at start by default', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });
    expect(button.element().className).not.toContain('tox-accordion__header--icon-end');
  });

  it('TINY-13450: Should toggle icon between chevron-down and chevron-up', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });

    expect(getIcon).toHaveBeenCalledWith('chevron-down');

    await userEvent.click(button);

    expect(getIcon).toHaveBeenCalledWith('chevron-up');
  });

  it('TINY-13450: Should render correct heading level', async () => {
    const { container } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1" headingLevel="h2">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2" headingLevel="h4">
          <p>Content 2</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const h2 = SelectorFind.descendant<HTMLElement>(
      SugarElement.fromDom(container),
      'h2.tox-accordion__heading'
    ).getOrDie();
    const h4 = SelectorFind.descendant<HTMLElement>(
      SugarElement.fromDom(container),
      'h4.tox-accordion__heading'
    ).getOrDie();

    expect(h2).toBeTruthy();
    expect(h4).toBeTruthy();
  });

  it('TINY-13450: Should default to h3 heading level', async () => {
    const { container } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const h3 = SelectorFind.descendant<HTMLElement>(
      SugarElement.fromDom(container),
      'h3.tox-accordion__heading'
    ).getOrDie();
    expect(h3).toBeTruthy();
  });

  it('TINY-13450: Should apply correct CSS classes for expanded/collapsed states', async () => {
    const { getByRole, container } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });
    const contentElement = SelectorFind.descendant<HTMLElement>(
      SugarElement.fromDom(container),
      '.tox-accordion__content'
    ).getOrDie();

    expect(contentElement.dom.className).toContain('tox-accordion__content--collapsed');
    expect(contentElement.dom.className).not.toContain('tox-accordion__content--expanded');

    await userEvent.click(button);

    expect(contentElement.dom.className).toContain('tox-accordion__content--expanded');
    expect(contentElement.dom.className).not.toContain('tox-accordion__content--collapsed');
  });

  it('TINY-13450: Should apply disabled CSS class when disabled', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1" disabled>
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });
    expect(button.element().className).toContain('tox-accordion__header--disabled');
  });

  it('TINY-13450: Should not navigate past last item with ArrowDown', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button2 = getByRole('button', { name: /Item 2/i });

    button2.element().focus();
    expect(document.activeElement).toBe(button2.element());

    await userEvent.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(button2.element());
  });

  it('TINY-13450: Should not navigate past first item with ArrowUp', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button1 = getByRole('button', { name: /Item 1/i });

    button1.element().focus();
    expect(document.activeElement).toBe(button1.element());

    await userEvent.keyboard('{ArrowUp}');

    expect(document.activeElement).toBe(button1.element());
  });

  it('TINY-13450: Should unregister item on unmount', async () => {
    const TestComponent = ({ showItem }: { showItem: boolean }) => (
      <Accordion.Root>
        {showItem && (
          <Accordion.Item id="item1" title="Item 1">
            <p>Content 1</p>
          </Accordion.Item>
        )}
        <Accordion.Item id="item2" title="Item 2">
          <p>Content 2</p>
        </Accordion.Item>
      </Accordion.Root>
    );

    const { rerender, getByRole } = render(<TestComponent showItem={true} />, { wrapper });

    const button1 = getByRole('button', { name: /Item 1/i });
    expect(button1).toBeTruthy();

    rerender(<TestComponent showItem={false} />);

    const buttons = SugarElement.fromDom(document.body).dom.querySelectorAll('.tox-accordion__header');
    expect(buttons.length).toBe(1);

    const button2 = getByRole('button', { name: /Item 2/i });
    button2.element().focus();
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(button2.element());
  });

  it('TINY-13450: Should support RTL mode with proper icon positioning', async () => {
    const rtlWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className={Bem.block('tox')} dir="rtl">
        <UniverseProvider resources={mockUniverse}>
          {children}
        </UniverseProvider>
      </div>
    );

    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1" iconPosition="end">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper: rtlWrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });
    expect(button.element().className).toContain('tox-accordion__header--icon-end');

    // In RTL, icon-end should still apply the same class
    // The CSS handles the RTL-specific positioning
    const parentDiv = SelectorFind.closest<HTMLElement>(
      SugarElement.fromDom(button.element()),
      '.tox'
    ).getOrDie();
    expect(parentDiv.dom.getAttribute('dir')).toBe('rtl');
  });

  it('TINY-13450: Should apply expanded class to header when expanded', async () => {
    const { getByRole } = render(
      <Accordion.Root>
        <Accordion.Item id="item1" title="Item 1">
          <p>Content 1</p>
        </Accordion.Item>
      </Accordion.Root>,
      { wrapper }
    );

    const button = getByRole('button', { name: /Item 1/i });

    expect(button.element().className).not.toContain('tox-accordion__header--expanded');

    await userEvent.click(button);

    expect(button.element().className).toContain('tox-accordion__header--expanded');
  });
});

