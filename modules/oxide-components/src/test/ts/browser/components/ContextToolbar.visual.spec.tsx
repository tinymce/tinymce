import { Fun } from '@ephox/katamari';
import { Button } from 'oxide-components/components/button/Button';
import * as ContextToolbar from 'oxide-components/components/contexttoolbar/ContextToolbar';
import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { useMemo, useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

/* eslint-disable max-len */
const resolvedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`;
/* eslint-enable max-len */

const resources = {
  getIcon: Fun.constant(resolvedIcon),
};

const waitForToolbar = async () => {
  await expect.poll(() =>
    document.querySelector('.tox-context-toolbar')?.checkVisibility() === true
  ).toBe(true);
};

const BasicContextToolbar = () => (
  <div className='tox' style={{ position: 'relative' }}>
    <ContextToolbar.Root persistent={false}>
      <ContextToolbar.Trigger>
        <div style={{ backgroundColor: 'red', padding: '10px' }}>
          Click me!
        </div>
      </ContextToolbar.Trigger>
      <ContextToolbar.Toolbar>
        <ContextToolbar.Group>
          <Button onClick={Fun.noop}>Accept</Button>
          <Button onClick={Fun.noop}>Reject</Button>
        </ContextToolbar.Group>
      </ContextToolbar.Toolbar>
    </ContextToolbar.Root>
  </div>
);

const PersistentContextToolbar = () => (
  <div className='tox' style={{ position: 'relative' }}>
    <ContextToolbar.Root persistent={true}>
      <ContextToolbar.Trigger>
        <div style={{ backgroundColor: 'blue', padding: '10px' }}>
          Click me (Persistent)!
        </div>
      </ContextToolbar.Trigger>
      <ContextToolbar.Toolbar>
        <ContextToolbar.Group>
          <Button onClick={Fun.noop}>Accept</Button>
          <Button onClick={Fun.noop}>Reject</Button>
        </ContextToolbar.Group>
      </ContextToolbar.Toolbar>
    </ContextToolbar.Root>
  </div>
);

const WithIconButtonsContextToolbar = () => (
  <UniverseProvider resources={resources}>
    <div className='tox' style={{ position: 'relative' }}>
      <ContextToolbar.Root persistent={false}>
        <ContextToolbar.Trigger>
          <div style={{ backgroundColor: 'lightblue', padding: '10px' }}>
            Click me!
          </div>
        </ContextToolbar.Trigger>
        <ContextToolbar.Toolbar>
          <ContextToolbar.Group>
            <IconButton variant='primary' icon='checkmark' onClick={Fun.noop} />
            <IconButton variant='secondary' icon='cross' onClick={Fun.noop} />
          </ContextToolbar.Group>
        </ContextToolbar.Toolbar>
      </ContextToolbar.Root>
    </div>
  </UniverseProvider>
);

const ManyButtonsContextToolbar = () => (
  <div className='tox' style={{ position: 'relative' }}>
    <ContextToolbar.Root persistent={false}>
      <ContextToolbar.Trigger>
        <div style={{ backgroundColor: 'lightgreen', padding: '10px' }}>
          Click me!
        </div>
      </ContextToolbar.Trigger>
      <ContextToolbar.Toolbar>
        <ContextToolbar.Group>
          <Button variant='primary' onClick={Fun.noop}>Accept</Button>
          <Button variant='secondary' onClick={Fun.noop}>Reject</Button>
        </ContextToolbar.Group>
        <ContextToolbar.Group>
          <Button variant='outlined' onClick={Fun.noop}>Edit</Button>
          <Button variant='naked' onClick={Fun.noop}>Comment</Button>
        </ContextToolbar.Group>
        <ContextToolbar.Group>
          <Button variant='primary' onClick={Fun.noop}>Share</Button>
          <Button variant='secondary' onClick={Fun.noop}>More</Button>
        </ContextToolbar.Group>
      </ContextToolbar.Toolbar>
    </ContextToolbar.Root>
  </div>
);

const MixedContentContextToolbar = () => (
  <div className='tox' style={{ position: 'relative' }}>
    <ContextToolbar.Root persistent={false}>
      <ContextToolbar.Trigger>
        <div style={{ backgroundColor: 'lightyellow', padding: '10px' }}>
          Click me!
        </div>
      </ContextToolbar.Trigger>
      <ContextToolbar.Toolbar>
        <UniverseProvider resources={resources}>
          <ContextToolbar.Group>
            <IconButton icon='arrow-up' onClick={Fun.noop} />
            <span style={{
              padding: '8px',
              fontSize: '12px',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
              1/3
            </span>
            <IconButton icon='arrow-down' onClick={Fun.noop} />
          </ContextToolbar.Group>
        </UniverseProvider>
        <ContextToolbar.Group>
          <Button variant='primary' onClick={Fun.noop}>Accept</Button>
          <Button variant='secondary' onClick={Fun.noop}>Reject</Button>
        </ContextToolbar.Group>
      </ContextToolbar.Toolbar>
    </ContextToolbar.Root>
  </div>
);

const CornersContextToolbar = () => {
  const triggerPositions = useMemo(() => ([
    { id: 'top-left', label: 'Top Left', style: { top: '20px', left: '20px' }},
    { id: 'top-center', label: 'Top Center', style: { top: '20px', left: '50%', marginLeft: 'calc(-1 * (6ch + 24px) / 2)' }},
    { id: 'top-right', label: 'Top Right', style: { top: '20px', right: '20px' }},
    { id: 'middle-left', label: 'Middle Left', style: { top: '50%', left: '20px', marginTop: 'calc(-1em / 2)' }},
    { id: 'center', label: 'Center', style: { top: '50%', left: '50%', marginTop: 'calc(-1em / 2)', marginLeft: 'calc(-1 * (4ch + 24px) / 2)' }},
    { id: 'middle-right', label: 'Middle Right', style: { top: '50%', right: '20px', marginTop: 'calc(-1em / 2)' }},
    { id: 'bottom-left', label: 'Bottom Left', style: { bottom: '20px', left: '20px' }},
    { id: 'bottom-center', label: 'Bottom Center', style: { bottom: '20px', left: '50%', marginLeft: 'calc(-1 * (9ch + 24px) / 2)' }},
    { id: 'bottom-right', label: 'Bottom Right', style: { bottom: '20px', right: '20px' }}
  ] as const), []);

  return (
    <div className='tox context-toolbar-anchors' style={{ width: '520px' }}>
      <div
        className='tox'
        style={{
          position: 'relative',
          height: '360px',
          border: '1px solid #c6cdd6',
          borderRadius: '16px',
          background: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {triggerPositions.map((pos) => (
          <ContextToolbar.Root key={pos.id} persistent={false}>
            <ContextToolbar.Trigger>
              <div style={{ position: 'absolute', display: 'inline-flex', ...pos.style }}>
                <Button>{pos.label}</Button>
              </div>
            </ContextToolbar.Trigger>
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <Button onClick={Fun.noop}>Accept</Button>
                <Button onClick={Fun.noop}>Reject</Button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
        ))}
      </div>
    </div>
  );
};

const WithAnchorRefContextToolbar = () => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [ showToolbar, setShowToolbar ] = useState(true);

  return (
    <div className='tox' style={{ position: 'relative' }}>
      <div
        ref={anchorRef}
        style={{
          backgroundColor: 'lightcoral',
          padding: '10px',
          cursor: 'pointer',
          display: 'inline-block'
        }}
      >
        Anchor element
      </div>
      <button onClick={() => setShowToolbar(!showToolbar)} style={{ marginLeft: '10px' }}>
        {showToolbar ? 'Hide' : 'Show'} Toolbar
      </button>
      {showToolbar && (
        <ContextToolbar.Root anchorRef={anchorRef} persistent={true}>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button>Accept</Button>
              <Button>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      )}
    </div>
  );
};

const ScrollAnchoredContextToolbar = () => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [ showToolbar, setShowToolbar ] = useState(true);

  return (
    <div
      className='tox'
      data-testid='scroll-container'
      style={{
        height: '300px',
        overflow: 'auto',
        border: '1px solid #ccc',
        position: 'relative',
      }}
    >
      <div style={{ height: '1000px', padding: '20px' }}>
        <p>Scroll down to find the anchor ↓</p>
        <div style={{ marginTop: '300px' }}>
          <div
            ref={anchorRef}
            style={{
              backgroundColor: 'lightgreen',
              padding: '12px',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            Scroll-anchored element
          </div>
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            style={{ marginLeft: '10px' }}
          >
            {showToolbar ? 'Hide' : 'Show'} Toolbar
          </button>
          {showToolbar && (
            <ContextToolbar.Root anchorRef={anchorRef} persistent={true} usePopover={false}>
              <ContextToolbar.Toolbar>
                <ContextToolbar.Group>
                  <Button>Accept</Button>
                  <Button>Reject</Button>
                </ContextToolbar.Group>
              </ContextToolbar.Toolbar>
            </ContextToolbar.Root>
          )}
        </div>
      </div>
    </div>
  );
};

const DisabledControlsContextToolbar = () => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [ showToolbar, setShowToolbar ] = useState(true);

  return (
    <div className='tox' style={{ position: 'relative' }}>
      <div
        ref={anchorRef}
        style={{
          backgroundColor: 'lightcoral',
          padding: '10px',
          cursor: 'pointer',
          display: 'inline-block'
        }}
      >
        Anchor element
      </div>
      <button onClick={() => setShowToolbar(!showToolbar)} style={{ marginLeft: '10px' }}>
        {showToolbar ? 'Hide' : 'Show'} Toolbar
      </button>
      {showToolbar && (
        <ContextToolbar.Root anchorRef={anchorRef} persistent={true}>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button>Accept A</Button>
              <Button>Accept B</Button>
              <Button disabled>Reject (Disabled)</Button>
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button disabled>Group 2 Action (Disabled)</Button>
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button disabled>Group 3 Action (Disabled)</Button>
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button>Final Group A</Button>
              <Button>Final Group B</Button>
              <Button>Final Group C</Button>
              <Button>Final Group D</Button>
              <Button>Final Group E</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      )}
    </div>
  );
};

describe('visual.ContextToolbarTest', () => {
  it('renders the basic state', async () => {
    const screen = renderVisual(<BasicContextToolbar />, { fullViewport: true });
    await screen.expectScreenshot('context-toolbar-basic');
  });

  it('renders the persistent state', async () => {
    const screen = renderVisual(<PersistentContextToolbar />, { fullViewport: true });
    await screen.expectScreenshot('context-toolbar-persistent');
  });

  it('renders the with icon buttons state', async () => {
    const screen = renderVisual(<WithIconButtonsContextToolbar />, { fullViewport: true });
    await screen.expectScreenshot('context-toolbar-with-icon-buttons');
  });

  it('renders the many buttons state', async () => {
    const screen = renderVisual(<ManyButtonsContextToolbar />, { fullViewport: true });
    await screen.expectScreenshot('context-toolbar-many-buttons');
  });

  it('renders the mixed content state', async () => {
    const screen = renderVisual(<MixedContentContextToolbar />, { fullViewport: true });
    await screen.expectScreenshot('context-toolbar-mixed-content');
  });

  it('renders the corners state', async () => {
    const screen = renderVisual(<CornersContextToolbar />, { fullViewport: true });
    await screen.expectScreenshot('context-toolbar-corners');
  });

  it('renders the with anchor ref state', async () => {
    const screen = renderVisual(<WithAnchorRefContextToolbar />, { fullViewport: true });
    await waitForToolbar();
    await screen.expectScreenshot('context-toolbar-with-anchor-ref');
  });

  it('renders the scroll anchored state', async () => {
    const screen = renderVisual(<ScrollAnchoredContextToolbar />, { fullViewport: true });
    const scrollContainer = screen.getByTestId('scroll-container').element() as HTMLElement;
    scrollContainer.scrollTo({ top: 300 });
    await waitForToolbar();
    await expect.poll(() => scrollContainer.scrollTop).toBeGreaterThan(0);
    await screen.expectScreenshot('context-toolbar-scroll-anchored');
  });

  it('renders the disabled controls state', async () => {
    const screen = renderVisual(<DisabledControlsContextToolbar />, { fullViewport: true });
    await waitForToolbar();
    await screen.expectScreenshot('context-toolbar-disabled-controls');
  });
});
