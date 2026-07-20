import { Fun } from '@ephox/katamari';
import { Alert, type AlertProps } from 'oxide-components/components/alert/Alert';
import { Button } from 'oxide-components/components/button/Button';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { describe, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

const closeIcon = `<svg width="24" height="24">
  <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
</svg>`;

const resources = {
  getIcon: Fun.constant(closeIcon),
};

const message = 'The change is not supported by the editor and can\'t be previewed or applied.';

const renderAlert = (args: AlertProps): JSX.Element => (
  <UniverseProvider resources={resources}>
    <div style={{ width: '480px' }}>
      <Alert {...args} />
    </div>
  </UniverseProvider>
);

const expectAlert = async (name: string, args: AlertProps) => {
  const screen = renderVisual(renderAlert(args));
  await screen.expectScreenshot(name);
};

describe('visual.AlertTest', () => {
  it('renders the error alert state', async () => {
    await expectAlert('alert-error-alert', {
      message,
      severity: 'error'
    });
  });

  it('renders the error removable state', async () => {
    await expectAlert('alert-error-removable', {
      message,
      severity: 'error',
      removable: true,
      onRemove: Fun.noop,
      closeAriaLabel: 'Dismiss alert'
    });
  });

  it('renders the error with action state', async () => {
    await expectAlert('alert-error-with-action', {
      message,
      severity: 'error',
      actions: <Button variant='naked' onClick={Fun.noop}>Action</Button>
    });
  });

  it('renders the error removable with action state', async () => {
    await expectAlert('alert-error-removable-with-action', {
      message,
      severity: 'error',
      removable: true,
      onRemove: Fun.noop,
      actions: <Button variant='naked' onClick={Fun.noop}>Action</Button>
    });
  });

  it('renders the error with actions state', async () => {
    await expectAlert('alert-error-with-actions', {
      message,
      severity: 'error',
      actions: (
        <>
          <Button variant='naked' onClick={Fun.noop}>Action 1</Button>
          <Button variant='naked' onClick={Fun.noop}>Action 2</Button>
        </>
      )
    });
  });

  it('renders the error removable with actions state', async () => {
    await expectAlert('alert-error-removable-with-actions', {
      message,
      severity: 'error',
      removable: true,
      onRemove: Fun.noop,
      actions: (
        <>
          <Button variant='naked' onClick={Fun.noop}>Action 1</Button>
          <Button variant='naked' onClick={Fun.noop}>Action 2</Button>
        </>
      )
    });
  });

  it('renders the warning state', async () => {
    await expectAlert('alert-warning', {
      message,
      severity: 'warning'
    });
  });

  it('renders the warning removable state', async () => {
    await expectAlert('alert-warning-removable', {
      message,
      severity: 'warning',
      removable: true,
      onRemove: Fun.noop
    });
  });

  it('renders the warning with action state', async () => {
    await expectAlert('alert-warning-with-action', {
      message,
      severity: 'warning',
      actions: <Button variant='naked' onClick={Fun.noop}>Action</Button>
    });
  });

  it('renders the warning removable with action state', async () => {
    await expectAlert('alert-warning-removable-with-action', {
      message,
      severity: 'warning',
      removable: true,
      onRemove: Fun.noop,
      actions: <Button variant='naked' onClick={Fun.noop}>Action</Button>
    });
  });

  it('renders the warning with actions state', async () => {
    await expectAlert('alert-warning-with-actions', {
      message,
      severity: 'warning',
      actions: (
        <>
          <Button variant='naked' onClick={Fun.noop}>Retry</Button>
          <Button variant='naked' onClick={Fun.noop}>Dismiss all</Button>
        </>
      )
    });
  });

  it('renders the warning removable with actions state', async () => {
    await expectAlert('alert-warning-removable-with-actions', {
      message,
      severity: 'warning',
      removable: true,
      onRemove: Fun.noop,
      actions: (
        <>
          <Button variant='naked' onClick={Fun.noop}>Retry</Button>
          <Button variant='naked' onClick={Fun.noop}>Dismiss all</Button>
        </>
      )
    });
  });
});
