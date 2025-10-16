import { userEvent } from '@vitest/browser/context';
import { InlineToolbar } from 'oxide-components/components/inlinetoolbar/InlineToolbar';
import { classes } from 'oxide-components/utils/Styles';
import { createRef, Fragment, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
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
    const sinkRef = createRef<HTMLDivElement>();
    const { getByTestId } = render(
      <Fragment>
        <div ref={sinkRef} className="tox" style={{ position: 'relative' }} />
        <InlineToolbar sinkRef={sinkRef}>
          <InlineToolbar.Trigger>
            <div data-testid={triggerTestId}>Click Me</div>
          </InlineToolbar.Trigger>
          <InlineToolbar.Toolbar>
            <div data-testid={toolbarTestId}>Toolbar Content</div>
          </InlineToolbar.Toolbar>
        </InlineToolbar>
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

  it('TINY-13071: Should close toolbar on click outside when persistent=false', async () => {
    const sinkRef = createRef<HTMLDivElement>();
    const { getByTestId } = render(
      <Fragment>
        <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
          <InlineToolbar sinkRef={sinkRef} persistent={false}>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <div data-testid={toolbarTestId}>Toolbar Content</div>
            </InlineToolbar.Toolbar>
          </InlineToolbar>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);

    await trigger.click();

    const toolbar = getByTestId(toolbarTestId);
    await expect.element(toolbar).toBeVisible();

    // Click outside
    document.body.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      clientX: 0,
      clientY: 0
    }));

    await expect.element(toolbar).not.toBeInTheDocument();
  });

  it('TINY-13071: Should close toolbar on Escape key', async () => {
    const sinkRef = createRef<HTMLDivElement>();
    const { getByTestId } = render(
      <Fragment>
        <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
          <InlineToolbar sinkRef={sinkRef}>
            <InlineToolbar.Trigger>
              <div data-testid={triggerTestId}>Click Me</div>
            </InlineToolbar.Trigger>
            <InlineToolbar.Toolbar>
              <div data-testid={toolbarTestId}>Toolbar Content</div>
            </InlineToolbar.Toolbar>
          </InlineToolbar>
        </div>
      </Fragment>,
      { wrapper: Wrapper }
    );

    const trigger = getByTestId(triggerTestId);

    await trigger.click();

    const toolbar = getByTestId(toolbarTestId);
    await expect.element(toolbar).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await expect.element(toolbar).not.toBeInTheDocument();
  });
});