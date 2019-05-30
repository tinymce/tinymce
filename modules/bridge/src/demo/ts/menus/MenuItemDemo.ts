import { console } from '@ephox/dom-globals';
import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerDemoMenuItems = () => {
  getDemoRegistry().addMenuItem('code', {
    icon: 'code',
    text: 'Code',
    onAction: (api) => {
      // tslint:disable-next-line:no-console
      console.log('open source code dialog');
    }
  });

  getDemoRegistry().addToggleMenuItem('bold', {
    text: 'Bold',
    shortcut: 'Meta+B',
    onSetup: (api) => {
      // tslint:disable-next-line:no-console
      console.log('bold');
      api.setActive(true);
      return () => { };
    },
    onAction: (api) => {
      // tslint:disable-next-line:no-console
      console.log('bold');
    }
  });
};
