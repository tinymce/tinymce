import { Fun } from '@ephox/katamari';
import * as SegmentedControl from 'oxide-components/components/segmentedcontrol/SegmentedControl';
import { useState } from 'react';
import { describe, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

const LeftActiveSegmentedControl = () => {
  const [ value, setValue ] = useState('diff');

  return (
    <SegmentedControl.Root value={value} onChange={setValue}>
      <SegmentedControl.Option value='diff'>Diff mode</SegmentedControl.Option>
      <SegmentedControl.Option value='preview'>Preview</SegmentedControl.Option>
    </SegmentedControl.Root>
  );
};

const RightActiveSegmentedControl = () => {
  const [ value, setValue ] = useState('preview');

  return (
    <SegmentedControl.Root value={value} onChange={setValue}>
      <SegmentedControl.Option value='diff'>Diff mode</SegmentedControl.Option>
      <SegmentedControl.Option value='preview'>Preview</SegmentedControl.Option>
    </SegmentedControl.Root>
  );
};

const ShortLabelsSegmentedControl = () => {
  const [ value, setValue ] = useState('off');

  return (
    <SegmentedControl.Root value={value} onChange={setValue}>
      <SegmentedControl.Option value='off'>Off</SegmentedControl.Option>
      <SegmentedControl.Option value='on'>On</SegmentedControl.Option>
    </SegmentedControl.Root>
  );
};

const LongLabelsSegmentedControl = () => {
  const [ value, setValue ] = useState('show');

  return (
    <SegmentedControl.Root value={value} onChange={setValue}>
      <SegmentedControl.Option value='show'>Show changes</SegmentedControl.Option>
      <SegmentedControl.Option value='hide'>Hide changes</SegmentedControl.Option>
    </SegmentedControl.Root>
  );
};

const DisabledSegmentedControl = () => {
  const [ value, setValue ] = useState('diff');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start'
    }}>
      <SegmentedControl.Root value={value} onChange={setValue} disabled>
        <SegmentedControl.Option value='diff'>Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value='preview'>Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
      <SegmentedControl.Root value='preview' onChange={setValue} disabled>
        <SegmentedControl.Option value='diff'>Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value='preview'>Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    </div>
  );
};

const InteractiveSegmentedControl = () => {
  const [ value, setValue ] = useState('left');

  return (
    <SegmentedControl.Root value={value} onChange={setValue}>
      <SegmentedControl.Option value='left'>Left</SegmentedControl.Option>
      <SegmentedControl.Option value='right'>Right</SegmentedControl.Option>
    </SegmentedControl.Root>
  );
};

const ThreeOptionsSegmentedControl = () => {
  const [ value, setValue ] = useState('view');

  return (
    <SegmentedControl.Root value={value} onChange={setValue}>
      <SegmentedControl.Option value='view'>View</SegmentedControl.Option>
      <SegmentedControl.Option value='edit'>Edit</SegmentedControl.Option>
      <SegmentedControl.Option value='preview'>Preview</SegmentedControl.Option>
    </SegmentedControl.Root>
  );
};

const MultipleControlsSegmentedControl = () => {
  const [ state1, setState1 ] = useState('diff');
  const [ state2, setState2 ] = useState('edit');
  const [ state3, setState3 ] = useState('light');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start'
    }}>
      <SegmentedControl.Root value={state1} onChange={setState1}>
        <SegmentedControl.Option value='diff'>Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value='preview'>Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
      <SegmentedControl.Root value={state2} onChange={setState2}>
        <SegmentedControl.Option value='edit'>Edit</SegmentedControl.Option>
        <SegmentedControl.Option value='view'>View</SegmentedControl.Option>
      </SegmentedControl.Root>
      <SegmentedControl.Root value={state3} onChange={setState3}>
        <SegmentedControl.Option value='light'>Light</SegmentedControl.Option>
        <SegmentedControl.Option value='dark'>Dark</SegmentedControl.Option>
      </SegmentedControl.Root>
      <SegmentedControl.Root value='disabled' onChange={Fun.noop} disabled>
        <SegmentedControl.Option value='disabled'>Disabled</SegmentedControl.Option>
        <SegmentedControl.Option value='control'>Control</SegmentedControl.Option>
      </SegmentedControl.Root>
    </div>
  );
};

describe('visual.SegmentedControlTest', () => {
  it('renders the left active state', async () => {
    const screen = renderVisual(<LeftActiveSegmentedControl />);
    await screen.expectScreenshot('segmented-control-left-active');
  });

  it('renders the right active state', async () => {
    const screen = renderVisual(<RightActiveSegmentedControl />);
    await screen.expectScreenshot('segmented-control-right-active');
  });

  it('renders the short labels state', async () => {
    const screen = renderVisual(<ShortLabelsSegmentedControl />);
    await screen.expectScreenshot('segmented-control-short-labels');
  });

  it('renders the long labels state', async () => {
    const screen = renderVisual(<LongLabelsSegmentedControl />);
    await screen.expectScreenshot('segmented-control-long-labels');
  });

  it('renders the disabled state', async () => {
    const screen = renderVisual(<DisabledSegmentedControl />);
    await screen.expectScreenshot('segmented-control-disabled');
  });

  it('renders the interactive state', async () => {
    const screen = renderVisual(<InteractiveSegmentedControl />);
    await screen.expectScreenshot('segmented-control-interactive');
  });

  it('renders the three options state', async () => {
    const screen = renderVisual(<ThreeOptionsSegmentedControl />);
    await screen.expectScreenshot('segmented-control-three-options');
  });

  it('renders the multiple controls state', async () => {
    const screen = renderVisual(<MultipleControlsSegmentedControl />);
    await screen.expectScreenshot('segmented-control-multiple-controls');
  });
});
