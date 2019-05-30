import { console } from '@ephox/dom-globals';
import { getDemoRegistry } from './DemoRegistry';

// tslint:disable:no-console
export const registerDemoButtons = () => {
  getDemoRegistry().addButton('code', {
    icon: 'code',
    tooltip: 'Source code',
    onAction: (api) => {
      console.log('source code editor');
    }
  });

  getDemoRegistry().addMenuButton('mymenubutton', {
    text: 'My menu button',
    tooltip: 'My menu button',
    fetch: (resolve) => {
      resolve([
        { type: 'menuitem', text: 'some item 1', value: '1', onAction: () => console.log('1') },
        { type: 'separator' },
        { type: 'menuitem', text: 'some item 2', value: '2', onAction: () => console.log('2') },
        { type: 'menuitem', text: 'some item 3', value: '3', onAction: () => console.log('3') }
      ]);
    }
  });

  getDemoRegistry().addSplitButton('mysplitbutton', {
    text: 'My split button',
    tooltip: 'My split button',
    onAction: (api) => {
      console.log('mysplitbutton clicked');
    },
    onItemAction: (api, value) => {
      console.log(value);
    },
    fetch: (resolve) => {
      resolve([
        { text: 'some item 1', value: '1' },
        { type: 'separator' },
        { text: 'some item 2', value: '2' },
        { text: 'some item 3', value: '3' }
      ]);
    }
  });

  getDemoRegistry().addToggleButton('bold', {
    icon: 'bold',
    tooltip: 'Bold',
    onSetup: (api) => {
      api.setActive(false);
      return () => { };
    },
    onAction: (api) => {
      console.log('bold clicked');
    }
  });
};