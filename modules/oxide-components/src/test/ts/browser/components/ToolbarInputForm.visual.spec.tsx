import { Fun } from '@ephox/katamari';
import { ToolbarInputForm, type ToolbarInputFormProps } from 'oxide-components/components/toolbarInputForm/ToolbarInputForm';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { describe, expect, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

/* eslint-disable max-len */
const iconResolver = (icon: string): string => {
  const icons = new Map<string, string>([
    [ 'checkmark', `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-checkmark</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M18.1679497,5.4452998 C18.4743022,4.98577112 19.0951715,4.86159725 19.5547002,5.16794971 C20.0142289,5.47430216 20.1384028,6.09517151 19.8320503,6.5547002 L11.8320503,18.5547002 C11.4831227,19.0780915 10.7433669,19.1531818 10.2963845,18.7105809 L5.29919894,13.7623796 C4.90675595,13.3737835 4.90363744,12.7406262 5.29223356,12.3481832 C5.68082968,11.9557402 6.31398698,11.9526217 6.70642997,12.3412178 L10.8411868,16.4354442 L18.1679497,5.4452998 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>` ]
  ]);
  return icons.get(icon) || '';
};
/* eslint-enable max-len */

const resources = {
  getIcon: iconResolver,
};

const renderToolbarInputForm = (args: ToolbarInputFormProps): JSX.Element => (
  <UniverseProvider resources={resources}>
    <ToolbarInputForm {...args} />
  </UniverseProvider>
);

const expectToolbarInputForm = async (name: string, args: ToolbarInputFormProps) => {
  const screen = renderVisual(renderToolbarInputForm(args));
  await expect.element(screen.getByPlaceholder(args.placeholder ?? '')).toHaveFocus();
  await screen.expectScreenshot(name);
};

describe('visual.ToolbarInputFormTest', () => {
  it('renders the example state', async () => {
    await expectToolbarInputForm('toolbar-input-form-example', {
      label: 'Some input:',
      placeholder: 'value...',
      onSubmit: Fun.noop,
      onEscape: Fun.noop
    });
  });

  it('renders the url state', async () => {
    await expectToolbarInputForm('toolbar-input-form-url', {
      label: 'URL',
      placeholder: 'http://',
      onSubmit: Fun.noop,
      onEscape: Fun.noop
    });
  });
});
