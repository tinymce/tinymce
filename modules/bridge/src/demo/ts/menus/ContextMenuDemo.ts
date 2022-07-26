import { getDemoRegistry } from '../buttons/DemoRegistry';

/* eslint-disable no-console */

export const registerDemoContextMenus = (): void => {
  getDemoRegistry().addContextMenu('regular', {
    update: () => [ 'bold', 'italic', '|', 'table' ]
  });

  getDemoRegistry().addContextMenu('custom', {
    update: () => [{
      icon: 'code',
      text: 'Code',
      onAction: () => {
        console.log('open source code dialog');
      }
    }]
  });

  getDemoRegistry().addContextMenu('mixed', {
    update: () => [ 'bold', 'italic', {
      icon: 'code',
      text: 'Code',
      onAction: () => {
        console.log('open source code dialog');
      }
    }]
  });

  getDemoRegistry().addContextMenu('spelling', {
    update: () => [
      {
        text: 'word1',
        onAction: () => console.log('word1')
      },
      {
        text: 'word2',
        onAction: () => console.log('word2')
      },
      {
        type: 'separator'
      },
      {
        type: 'submenu',
        text: 'more...',
        getSubmenuItems: () => [
          {
            text: 'word3',
            onAction: () => console.log('word3')
          },
          {
            text: 'word4',
            onAction: () => console.log('word4')
          }
        ]
      }
    ]
  });

};
