import { SelectorFind, SugarElement } from '@ephox/sugar';
import { userEvent } from '@vitest/browser/context';
import * as FloatingSidebar from 'oxide-components/components/floatingsidebar/FloatingSidebar';
import { classes } from 'oxide-components/utils/Styles';
import { useState, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as Dragging from './utils/Dragging';

const floatingSidebarHeaderTestId = 'floating-sidebar-header';
const floatingSidebarContentTestId = 'floating-sidebar-content';

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className={classes([ 'tox' ])}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}>
        {children}
      </div>
    </div>
  );
};

describe('browser.floatingsidebar.FloatingSidebar', () => {
  it('TINY-13052: Should throw an error when Header is missing', () => {
    expect(() => {
      render(
        <FloatingSidebar.Root>
          <div data-testid={floatingSidebarContentTestId}>Content</div>
        </FloatingSidebar.Root>
        , { wrapper: Wrapper }
      );
    }).toThrow('FloatingSidebar requires a header');
  });

  it('TINY-13052: Popover should be closed when isOpen is false', async () => {
    const { getByTestId } = render(
      <FloatingSidebar.Root isOpen={false}>
        <FloatingSidebar.Header>
          <div data-testid={floatingSidebarHeaderTestId}>Header</div>
        </FloatingSidebar.Header>
        <div data-testid={floatingSidebarContentTestId}>Content</div>
      </FloatingSidebar.Root>, { wrapper: Wrapper });

    const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
    const containerElement = SelectorFind.closest(floatingSidebarContent, '.tox-floating-sidebar').getOrDie();

    expect(containerElement.dom.matches(':popover-open')).toBe(false);
  });

  it('TINY-13052: Popover should be opened when isOpen is true', async () => {
    const { getByTestId } = render(
      <FloatingSidebar.Root isOpen={true}>
        <FloatingSidebar.Header>
          <div data-testid={floatingSidebarHeaderTestId}>Header</div>
        </FloatingSidebar.Header>
        <div data-testid={floatingSidebarContentTestId}>Content</div>
      </FloatingSidebar.Root>, { wrapper: Wrapper });

    const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
    const containerElement = SelectorFind.closest(floatingSidebarContent, '.tox-floating-sidebar').getOrDie();

    expect(containerElement.dom.matches(':popover-open')).toBe(true);
  });

  it('TINY-13052: Popover should toggle correctly when isOpen changes', async () => {
    const openButtonTestId = 'open-button';
    const closeButtonTestId = 'close-button';
    const ToggleSidebar = () => {
      const [ isOpen, setIsOpen ] = useState(false);
      return (
        <>
          <button data-testid={openButtonTestId} onClick={() => setIsOpen(true)}>Open Sidebar</button>

          <FloatingSidebar.Root isOpen={isOpen}>
            <FloatingSidebar.Header>
              <div data-testid={floatingSidebarHeaderTestId}>Header</div>
            </FloatingSidebar.Header>
            <div data-testid={floatingSidebarContentTestId}>Content</div>
            <button data-testid={closeButtonTestId} onClick={() => setIsOpen(false)}>Close Sidebar</button>
          </FloatingSidebar.Root>
        </>
      );
    };
    const { getByTestId } = render(<ToggleSidebar />, { wrapper: Wrapper });
    const openSidebarButton = getByTestId(openButtonTestId);
    const closeSidebarButton = getByTestId(closeButtonTestId);
    const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
    const containerElement = SelectorFind.closest(floatingSidebarContent, '.tox-floating-sidebar').getOrDie();

    expect(containerElement.dom.matches(':popover-open')).toBe(false);
    await userEvent.click(openSidebarButton);
    expect(containerElement.dom.matches(':popover-open')).toBe(true);
    await userEvent.click(closeSidebarButton);
    expect(containerElement.dom.matches(':popover-open')).toBe(false);
  });

  it('TINY-13052: Should be draggable by handle', async () => {
    const { getByTestId } = render(
      <FloatingSidebar.Root isOpen={true}>
        <FloatingSidebar.Header>
          <div data-testid={floatingSidebarHeaderTestId}>Header</div>
        </FloatingSidebar.Header>
        <div data-testid={floatingSidebarContentTestId}>Content</div>
      </FloatingSidebar.Root>, { wrapper: Wrapper });

    const [ shiftX, shiftY ] = [ 10, 10 ];
    const handle = getByTestId(floatingSidebarHeaderTestId).element() as HTMLElement;
    const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
    const containerElement = SelectorFind.closest<HTMLElement>(floatingSidebarContent, '.tox-floating-sidebar').getOrDie();

    const { down, move, up } = Dragging.mouse(handle);
    down();
    await Dragging.tick();
    move([ shiftX, shiftY ]);
    await Dragging.tick();
    up();

    expect(containerElement.dom.style.transform).toBe(`translate3d(${shiftX}px, ${shiftY}px, 0px)`);
  });
});
