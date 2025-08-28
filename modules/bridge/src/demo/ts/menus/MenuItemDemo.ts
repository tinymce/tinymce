import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerDemoMenuItems = (): void => {
  getDemoRegistry().addMenuItem('code', {
    icon: 'code',
    text: 'Code',
    onAction: (_api) => {
      // eslint-disable-next-line no-console
      console.log('open source code dialog');
    }
  });

  getDemoRegistry().addToggleMenuItem('bold', {
    text: 'Bold',
    shortcut: 'Meta+B',
    onSetup: (api) => {
      // eslint-disable-next-line no-console
      console.log('bold');
      api.setActive(true);
      return Fun.noop;
    },
    onAction: (_api) => {
      // eslint-disable-next-line no-console
      console.log('bold');
    }
  });
};
