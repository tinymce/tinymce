import { Fun } from '@ephox/katamari';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

import * as MockDemo from './MockDemo';

declare let tinymce: TinyMCE;

/* eslint-disable no-console */

export default (): void => {
  const DemoState = MockDemo.mockFeatureState();
  const DemoState2 = MockDemo.mockFeatureState();

  tinymce.init({
    selector: 'textarea.tiny-text',
    theme: 'silver',
    // toolbar: [ 'basic-button-1', 'basic-button-2', 'menu-button-1', 'panel-button-1', 'dialog-button', 'MagicButton' ],
    plugins: [
      // 'lists', // Required for list functionality (commands),
      // 'autolink', // Required for turning pasted text into hyperlinks
      // 'autosave' // Required to prevent users losing content when they press back
    ],

    menus: {
      File: [ 'x1', 'x2', 'x3', '|', 't1', '|', 'd1' ]
    },

    setup: (ed) => {
      ed.ui.registry.addMenuItem('x1', {
        icon: 'drop',
        text: 'Text with icon',
        onAction: () => {
          console.log('Just Text click');
        }
      });

      ed.ui.registry.addMenuItem('x2', {
        // icon: Icons.getOr('bold', () => 'oh no'),
        text: 'Just Text',
        onAction: () => {
          console.log('Just Text click');
        }
      });

      ed.ui.registry.addMenuItem('x3', {
        // icon: Icons.getOr('bold', () => 'oh no'),
        text: 'Just Text with shortcut',
        shortcut: 'Ctrl+Alt+Delete',
        onAction: () => {
          console.log('Just Text click');
        }
      });

      ed.ui.registry.addToggleMenuItem('t1', {
        text: 'button with Toggle',
        shortcut: '⌘+C',
        onSetup: (api) => {
          // debugger;
          // TODO: TS narrowing, when config toggling = true
          // then the comp interface should include comp.toggleOn otherwise it should complain
          const state = DemoState.get();
          console.log(state);
          api.setActive(state);
          return Fun.noop;
        },
        onAction: (api) => {
          DemoState.toggle();
          api.setActive(DemoState.get());
          console.log('button with Toggle click - current state is: ' + DemoState.get());
        }
      });

      ed.ui.registry.addNestedMenuItem('d1', {
        // icon: Icons.getOr('drop', () => 'oh no'),
        text: 'nested',
        getSubmenuItems: () => [
          {
            type: 'menuitem',
            text: 'Nested 1',
            onAction: () => {
              console.log('clicked nested 1');
            }
          },
          {
            type: 'menuitem',
            text: 'Nested 2',
            icon: 'drop',
            onAction: () => {
              console.log('clicked nested 1');
            }
          },
          {
            type: 'menuitem',
            text: 'Nested 3',
            shortcut: 'X',
            onAction: () => {
              console.log('clicked nested 1');
            }
          },
          {
            type: 'togglemenuitem',
            text: 'nested Toggle',
            onSetup: (api) => {
              // debugger;
              // TODO: TS narrowing, when config toggling = true
              // then the comp interface should include comp.toggleOn otherwise it should complain
              const state = DemoState2.get();
              console.log(state);
              api.setActive(state);
              return Fun.noop;
            },
            onAction: (api) => {
              DemoState2.toggle();
              api.setActive(DemoState2.get());
              console.log('button with Toggle click - current state is: ' + DemoState2.get());
            }
          },
          {
            type: 'menuitem',
            text: 'Double nested',
            onAction: () => console.log('double nest go!'),
            getSubmenuItems: () => [
              {
                type: 'menuitem',
                text: 'wow',
                onAction: () => console.log('so deep')
              }
            ]
          }
        ]
      });
    }
  });
};
