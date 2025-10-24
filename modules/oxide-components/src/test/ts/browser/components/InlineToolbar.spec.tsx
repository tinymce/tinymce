import { page, userEvent } from '@vitest/browser/context';
import * as InlineToolbar from 'oxide-components/components/inlinetoolbar/InlineToolbar';
import { classes } from 'oxide-components/utils/Styles';
import { Fragment, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

const triggerTestId = 'inline-toolbar-trigger';
const toolbarTestId = 'inline-toolbar-toolbar';

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className={classes([ 'tox' ])}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

describe('browser.inlinetoolbar.InlineToolbar', () => {
  it('TINY-13071: Should render trigger and toolbar', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className="tox" style={{ position: 'relative' }} />
        <InlineToolbar.Root>
          <InlineToolbar.Trigger>
            <div data-testid={triggerTestId}>Click Me</div>
          </InlineToolbar.Trigger>
          <InlineToolbar.Toolbar>
            <InlineToolbar.Group>
              <div data-testid={toolbarTestId}>Toolbar Content</div>
            </InlineToolbar.Group>
          </InlineToolbar.Toolbar>
        </InlineToolbar.Root>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await expect.element(trigger).toBeVisible();

    // Open toolbar
    await trigger.click();

    const toolbar = getByTestId(toolbarTestId);
    await expect.element(toolbar).toBeVisible();
  });

  it('TINY-13071: Should throw error when Trigger used outside of InlineToolbar', () => {
    expect(() => {
      render(
        <InlineToolbar.Trigger>
          <div data-testid={triggerTestId}>Click Me</div>
        </InlineToolbar.Trigger>,
        { wrapper: Wrapper }
      );
    }).toThrow('useInlineToolbarContext must be used within an InlineToolbarProvider');
  });

  it('TINY-13071: Should close toolbar on click outside when persistent={false}', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className="tox" style={{ position: 'relative' }}>
          <InlineToolbar.Root persistent={false}>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <InlineToolbar.Group>
                <div data-testid={toolbarTestId}>Toolbar Content</div>
              </InlineToolbar.Group>
            </InlineToolbar.Toolbar>
          </InlineToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);

    await trigger.click();

    const toolbar = getByTestId(toolbarTestId);
    await expect.element(toolbar).toBeVisible();

    // Click outside
    await page.elementLocator(document.body).click({ position: { x: 0, y: 0 }});

    await expect.element(toolbar).not.toBeVisible();
  });

  it('TINY-13071: Should close toolbar on Escape key', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className="tox" style={{ position: 'relative' }}>
          <InlineToolbar.Root>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <InlineToolbar.Group>
                <div data-testid={toolbarTestId}>Toolbar Content</div>
              </InlineToolbar.Group>
            </InlineToolbar.Toolbar>
          </InlineToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await trigger.click();

    const toolbar = getByTestId(toolbarTestId);
    await expect.element(toolbar).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await expect.element(toolbar).not.toBeVisible();
  });

  it('TINY-13071: Should not close toolbar on Escape key when persistent={true}', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className="tox" style={{ position: 'relative' }}>
          <InlineToolbar.Root persistent={true}>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <InlineToolbar.Group>
                <div data-testid={toolbarTestId}>Toolbar Content</div>
              </InlineToolbar.Group>
            </InlineToolbar.Toolbar>
          </InlineToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await trigger.click();

    const toolbar = getByTestId(toolbarTestId);
    await expect.element(toolbar).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await expect.element(toolbar).toBeVisible();
  });

  it('TINY-13071: Should navigate between groups with Tab key', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className="tox" style={{ position: 'relative' }}>
          <InlineToolbar.Root>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <InlineToolbar.Group>
                <button data-testid="button1">Button 1</button>
                <button data-testid="button2">Button 2</button>
              </InlineToolbar.Group>
              <InlineToolbar.Group>
                <button data-testid="button3">Button 3</button>
                <button data-testid="button4">Button 4</button>
              </InlineToolbar.Group>
            </InlineToolbar.Toolbar>
          </InlineToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await trigger.click();

    await userEvent.keyboard('{Tab}');
    const button1 = getByTestId('button1');
    await expect.element(button1).toHaveFocus();

    await userEvent.keyboard('{Tab}');
    const button3 = getByTestId('button3');
    await expect.element(button3).toHaveFocus();

    await userEvent.keyboard('{Tab}');
    await expect.element(button1).toHaveFocus();
  });

  it('TINY-13071: Should navigate within group with arrow keys', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className="tox" style={{ position: 'relative' }}>
          <InlineToolbar.Root>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <InlineToolbar.Group>
                <button data-testid="button1">Button 1</button>
                <button data-testid="button2">Button 2</button>
                <button data-testid="button3">Button 3</button>
              </InlineToolbar.Group>
            </InlineToolbar.Toolbar>
          </InlineToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await trigger.click();

    const button1 = getByTestId('button1');
    const button2 = getByTestId('button2');
    const button3 = getByTestId('button3');

    await userEvent.keyboard('{Tab}');
    await expect.element(button1).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect.element(button2).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect.element(button3).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(button2).toHaveFocus();
  });

  it('TINY-13071: Should execute button on Enter key', async () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <Fragment>
        <div className="tox" style={{ position: 'relative' }}>
          <InlineToolbar.Root>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <InlineToolbar.Group>
                <button data-testid="button1" onClick={onClick}>Button 1</button>
              </InlineToolbar.Group>
            </InlineToolbar.Toolbar>
          </InlineToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await trigger.click();

    await userEvent.keyboard('{Tab}');
    const button1 = getByTestId('button1');
    await expect.element(button1).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledOnce();
  });
});