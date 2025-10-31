import * as ContextToolbar from 'oxide-components/components/contexttoolbar/ContextToolbar';
import { classes } from 'oxide-components/utils/Styles';
import { Fragment, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

const triggerTestId = 'context-toolbar-trigger';
const toolbarTestId = 'context-toolbar-toolbar';

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

describe('browser.ContextToolbar.ContextToolbar', () => {
  it('TINY-13071: Should render trigger and toolbar', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }} />
        <ContextToolbar.Root>
          <ContextToolbar.Trigger>
            <div data-testid={triggerTestId}>Click Me</div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <div data-testid={toolbarTestId}>Toolbar Content</div>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
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

  it('TINY-13071: Should throw error when Trigger used outside of ContextToolbar', () => {
    expect(() => {
      render(
        <ContextToolbar.Trigger>
          <div data-testid={triggerTestId}>Click Me</div>
        </ContextToolbar.Trigger>,
        { wrapper: Wrapper }
      );
    }).toThrow('useContextToolbarContext must be used within a ContextToolbarProvider');
  });

  it('TINY-13071: Should close toolbar on click outside when persistent={false}', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root persistent={false}>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <div data-testid={toolbarTestId}>Toolbar Content</div>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
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
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <div data-testid={toolbarTestId}>Toolbar Content</div>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
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

  it('TINY-13066: Should not close toolbar on Escape key when persistent={true}', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root persistent={true}>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <div data-testid={toolbarTestId}>Toolbar Content</div>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
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

  it('TINY-13066: Should not close toolbar on click outside when persistent={true}', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root persistent={true}>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <div data-testid={toolbarTestId}>Toolbar Content</div>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
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

    await expect.element(toolbar).toBeVisible();
  });

  it('TINY-13066: Should navigate between groups with Tab key', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <button data-testid='button1'>Button 1</button>
                <button data-testid='button2'>Button 2</button>
              </ContextToolbar.Group>
              <ContextToolbar.Group>
                <button data-testid='button3'>Button 3</button>
                <button data-testid='button4'>Button 4</button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await trigger.click();

    const button1 = getByTestId('button1');
    await expect.element(button1).toHaveFocus();

    await userEvent.keyboard('{Tab}');
    const button3 = getByTestId('button3');
    await expect.element(button3).toHaveFocus();

    await userEvent.keyboard('{Tab}');
    await expect.element(button1).toHaveFocus();
  });

  it('TINY-13066: Should navigate within group with arrow keys', async () => {
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <button data-testid='button1'>Button 1</button>
                <button data-testid='button2'>Button 2</button>
                <button data-testid='button3'>Button 3</button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
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

  it('TINY-13066: Should execute button on Enter key', async () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <button data-testid='button1' onClick={onClick}>Button 1</button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
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

  it('TINY-13066: Should execute button on Space key', async () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <Fragment>
        <div className='tox' style={{ position: 'relative' }}>
          <ContextToolbar.Root>
            <ContextToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <button data-testid='button1' onClick={onClick}>Button 1</button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);
    await trigger.click();

    await userEvent.keyboard('{Tab}');
    const button1 = getByTestId('button1');
    await expect.element(button1).toHaveFocus();

    await userEvent.keyboard(' ');

    expect(onClick).toHaveBeenCalledOnce();
  });
});