import { Css, SelectorFind, SugarElement } from '@ephox/sugar';
import * as FloatingSidebar from 'oxide-components/components/floatingsidebar/FloatingSidebar';
import { classes } from 'oxide-components/utils/Styles';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, beforeAll, afterEach } from 'vitest';
import { userEvent, page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import * as Mouse from './utils/Mouse';

const floatingSidebarHeaderTestId = 'floating-sidebar-header';
const floatingSidebarContentTestId = 'floating-sidebar-content';
const containerSelector = '.tox-floating-sidebar';
const headerSelector = '.tox-floating-sidebar__header';

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

const expectToBeVisible = (element: SugarElement<HTMLElement>) =>
  expect(Css.get(element, 'display')).toBe('block');

const expectToBeHidden = (element: SugarElement<HTMLElement>) =>
  expect(Css.get(element, 'display')).toBe('none');

describe('browser.components.FloatingSidebar', () => {
  it('TINY-13052: should be closed when isOpen is false', async () => {
    const { container } = render(
      <FloatingSidebar.Root isOpen={false}>
        <FloatingSidebar.Header>
          <div data-testid={floatingSidebarHeaderTestId}>Header</div>
        </FloatingSidebar.Header>
        <div data-testid={floatingSidebarContentTestId}>Content</div>
      </FloatingSidebar.Root>, { wrapper: Wrapper });

    const containerElement = SelectorFind.descendant<HTMLElement>(SugarElement.fromDom(container), containerSelector).getOrDie();
    expectToBeHidden(containerElement);
  });

  it('TINY-13052: should be opened when isOpen is true', async () => {
    const { getByTestId } = render(
      <FloatingSidebar.Root isOpen={true}>
        <FloatingSidebar.Header>
          <div data-testid={floatingSidebarHeaderTestId}>Header</div>
        </FloatingSidebar.Header>
        <div data-testid={floatingSidebarContentTestId}>Content</div>
      </FloatingSidebar.Root>, { wrapper: Wrapper });

    const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
    const containerElement = SelectorFind.closest<HTMLElement>(floatingSidebarContent, containerSelector).getOrDie();

    expectToBeVisible(containerElement);
  });

  it('TINY-13052: should toggle correctly when isOpen changes', async () => {
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
    const { getByTestId, container } = render(<ToggleSidebar />, { wrapper: Wrapper });
    const openSidebarButton = getByTestId(openButtonTestId);
    const closeSidebarButton = getByTestId(closeButtonTestId);
    const containerElement = SelectorFind.descendant<HTMLElement>(SugarElement.fromDom(container), containerSelector).getOrDie();

    expectToBeHidden(containerElement);
    await userEvent.click(openSidebarButton);
    expectToBeVisible(containerElement);
    await userEvent.click(closeSidebarButton);
    expectToBeHidden(containerElement);
  });

  describe('TINY-13052: Viewport tests', () => {
    let originalViewport = { width: 0, height: 0 };

    beforeAll(async () => {
      originalViewport = { width: window.innerWidth, height: window.innerHeight };
    });

    afterEach(async () => {
      await page.viewport(originalViewport.width, originalViewport.height);
    });

    it('TINY-13052: Should be draggable by handle', async () => {
      await page.viewport(1500, 1500);
      const { getByTestId } = render(
        <FloatingSidebar.Root isOpen={true}>
          <FloatingSidebar.Header>
            <div data-testid={floatingSidebarHeaderTestId}>Header</div>
          </FloatingSidebar.Header>
          <div data-testid={floatingSidebarContentTestId}>Content</div>
        </FloatingSidebar.Root>, { wrapper: Wrapper });

      const handle = SugarElement.fromDom(getByTestId(floatingSidebarHeaderTestId).element() as HTMLElement);
      const headerElement = SelectorFind.closest<HTMLElement>(handle, headerSelector).getOrDie();
      const containerElement = SelectorFind.closest<HTMLElement>(handle, containerSelector).getOrDie();

      await Mouse.dragTo(headerElement.dom, { top: 100, left: 100 }, { startPosition: { x: 10, y: 10 }});

      const rect = containerElement.dom.getBoundingClientRect();
      expect(rect.top).toBe(90);
      expect(rect.left).toBe(90);
    });

    it('TINY-13109: Should stay within viewport on window resize', async () => {
      await page.viewport(1500, 1500);
      const { getByTestId } = render(
        <FloatingSidebar.Root isOpen={true}>
          <FloatingSidebar.Header>
            <div data-testid={floatingSidebarHeaderTestId}>Header</div>
          </FloatingSidebar.Header>
          <div data-testid={floatingSidebarContentTestId}>Content</div>
        </FloatingSidebar.Root>, { wrapper: Wrapper });

      const handle = SugarElement.fromDom(getByTestId(floatingSidebarHeaderTestId).element() as HTMLElement);
      const headerElement = SelectorFind.closest<HTMLElement>(handle, headerSelector).getOrDie();
      const containerElement = SelectorFind.closest<HTMLElement>(handle, containerSelector).getOrDie();

      // Move sidebar to bottom left corner
      await Mouse.dragTo(headerElement.dom, { top: 1500 * 0.2 + 10, left: 10 }, { startPosition: { x: 10, y: 10 }});

      // Validate, that initially it's in the bottom left corner
      let rect = containerElement.dom.getBoundingClientRect();
      expect(rect.left).toBe(0);
      expect(rect.bottom).toBe(1500);

      // Shrink the viewport
      await page.viewport(500, 500);
      rect = containerElement.dom.getBoundingClientRect();

      expect(rect.left).toBe(-304);
      expect(rect.bottom).toBe(500);
    });

    it('TINY-13052: Should shrink to take max 90% of viewport width', async () => {
      await page.viewport(100, 500);
      const { getByTestId } = render(
        <FloatingSidebar.Root isOpen={true}>
          <FloatingSidebar.Header></FloatingSidebar.Header>
          <div data-testid={floatingSidebarContentTestId}>Content</div>
        </FloatingSidebar.Root>, { wrapper: Wrapper });

      const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
      const containerElement = SelectorFind.closest<HTMLElement>(floatingSidebarContent, containerSelector).getOrDie();
      const rect = containerElement.dom.getBoundingClientRect();

      expect(rect.width).toBe(90);
    });

    it('TINY-13052: Should shrink to take max 80% of viewport height', async () => {
      await page.viewport(500, 100);
      const { getByTestId } = render(
        <FloatingSidebar.Root isOpen={true}>
          <FloatingSidebar.Header></FloatingSidebar.Header>
          <div data-testid={floatingSidebarContentTestId}>Content</div>
        </FloatingSidebar.Root>, { wrapper: Wrapper });

      const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
      const containerElement = SelectorFind.closest<HTMLElement>(floatingSidebarContent, containerSelector).getOrDie();
      const rect = containerElement.dom.getBoundingClientRect();

      expect(rect.height).toBe(80);
    });
  });
});
