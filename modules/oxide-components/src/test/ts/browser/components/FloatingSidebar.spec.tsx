import { SelectorFind, SugarElement } from '@ephox/sugar';
import * as FloatingSidebar from 'oxide-components/components/floatingsidebar/FloatingSidebar';
import { classes } from 'oxide-components/utils/Styles';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
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

describe('browser.floatingsidebar.FloatingSidebar', () => {
  it('TINY-13052: Popover should be closed when isOpen is false', async () => {
    const { getByTestId } = render(
      <FloatingSidebar.Root isOpen={false}>
        <FloatingSidebar.Header>
          <div data-testid={floatingSidebarHeaderTestId}>Header</div>
        </FloatingSidebar.Header>
        <div data-testid={floatingSidebarContentTestId}>Content</div>
      </FloatingSidebar.Root>, { wrapper: Wrapper });

    const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
    const containerElement = SelectorFind.closest(floatingSidebarContent, containerSelector).getOrDie();

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
    const containerElement = SelectorFind.closest(floatingSidebarContent, containerSelector).getOrDie();

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
    const containerElement = SelectorFind.closest(floatingSidebarContent, containerSelector).getOrDie();

    expect(containerElement.dom.matches(':popover-open')).toBe(false);
    await userEvent.click(openSidebarButton);
    expect(containerElement.dom.matches(':popover-open')).toBe(true);
    await userEvent.click(closeSidebarButton);
    expect(containerElement.dom.matches(':popover-open')).toBe(false);
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
      // Render sidebar in bottom right corner
      const { getByTestId } = render(
        <FloatingSidebar.Root isOpen={true} initialPosition={{ x: 1500, y: 1500, origin: 'bottomright' }}>
          <FloatingSidebar.Header>
            <div data-testid={floatingSidebarHeaderTestId}>Header</div>
          </FloatingSidebar.Header>
          <div data-testid={floatingSidebarContentTestId}>Content</div>
        </FloatingSidebar.Root>, { wrapper: Wrapper });

      const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
      const containerElement = SelectorFind.closest<HTMLElement>(floatingSidebarContent, containerSelector).getOrDie();
      let rect = containerElement.dom.getBoundingClientRect();

      // Validate, that initially it's in the bottom right corner
      expect(rect.right).toBe(1500);
      expect(rect.bottom).toBe(1500);

      // Shrink the viewport
      await page.viewport(500, 500);
      rect = containerElement.dom.getBoundingClientRect();

      expect(rect.right).toBe(500);
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

  describe('TINY-13044: Initial position', () => {
    let originalViewport = { width: 0, height: 0 };

    beforeAll(async () => {
      originalViewport = { width: window.innerWidth, height: window.innerHeight };
    });

    afterAll(async () => {
      await page.viewport(originalViewport.width, originalViewport.height);
    });

    beforeEach(async () => {
      await page.viewport(1500, 1500);
    });

    const renderWithPosition = (initialPosition: { x: number; y: number; origin: 'topleft' | 'topright' | 'bottomleft' | 'bottomright' }): { containerElement: HTMLElement } => {
      const { getByTestId } = render(
        <FloatingSidebar.Root initialPosition={initialPosition} height={100}>
          <FloatingSidebar.Header>
            <div data-testid={floatingSidebarHeaderTestId}>Header</div>
          </FloatingSidebar.Header>
          <div data-testid={floatingSidebarContentTestId}>Content</div>
        </FloatingSidebar.Root>, { wrapper: Wrapper });

      const floatingSidebarContent = SugarElement.fromDom(getByTestId(floatingSidebarContentTestId).element());
      const containerElement = SelectorFind.closest<HTMLElement>(floatingSidebarContent, containerSelector).getOrDie();
      return { containerElement: containerElement.dom };
    };

    it('TINY-13044: Should have correct initial position origin topleft', async () => {
      const initialPosition = { x: 500, y: 500, origin: 'topleft' as const };
      const { containerElement } = renderWithPosition(initialPosition);
      const rect = containerElement.getBoundingClientRect();
      expect(rect.left).toBe(500);
      expect(rect.top).toBe(500);
    });

    it('TINY-13044: Should have correct initial position origin topright', async () => {
      const initialPosition = { x: 500, y: 500, origin: 'topright' as const };
      const { containerElement } = renderWithPosition(initialPosition);
      const rect = containerElement.getBoundingClientRect();
      expect(rect.right).toBe(500);
      expect(rect.top).toBe(500);
    });

    it('TINY-13044: Should have correct initial position origin bottomleft', async () => {
      const initialPosition = { x: 500, y: 500, origin: 'bottomleft' as const };
      const { containerElement } = renderWithPosition(initialPosition);
      const rect = containerElement.getBoundingClientRect();
      expect(rect.left).toBe(500);
      expect(rect.bottom).toBe(500);
    });

    it('TINY-13044: Should have correct initial position origin bottomright', async () => {
      const initialPosition = { x: 500, y: 500, origin: 'bottomright' as const };
      const { containerElement } = renderWithPosition(initialPosition);
      const rect = containerElement.getBoundingClientRect();
      expect(rect.right).toBe(500);
      expect(rect.bottom).toBe(500);
    });
  });
});
