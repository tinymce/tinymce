import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerDemoMenuItems = () => {
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
      return () => { };
    },
    onAction: (_api) => {
      // eslint-disable-next-line no-console
      console.log('bold');
    }
  });
};
