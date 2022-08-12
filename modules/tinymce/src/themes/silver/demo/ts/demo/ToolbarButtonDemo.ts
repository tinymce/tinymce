/* eslint-disable no-console */
import { Fun } from '@ephox/katamari';

import { Editor, TinyMCE } from 'tinymce/core/api/PublicApi';

import * as MockDemo from './MockDemo';

declare let tinymce: TinyMCE;

export default (): void => {
  const DemoState2 = MockDemo.mockFeatureState();
  const generateButton = (editor: Editor, buttonType: 'button', name: string, num: number) => {
    const names: string[] = [];

    for (let i = 0; i <= num; i++) {
      editor.ui.registry.addButton(`${name}-${i}`, {
        type: buttonType,
        icon: `*-${i}-*`,
        onAction: (_api) => {
          console.log(`${name} ${i} button clicked`);
        }
      });

      names.push(`${name}-${i}`);
    }
    return names;
  };

  const generatedNames = [
    'generated-1', 'generated-2', 'generated-3', 'generated-4', 'generated-5', 'generated-6', 'generated-7', 'generated-8', 'generated-9', 'generated-10'
  ];

  tinymce.init({
    selector: 'textarea.tiny-text',
    theme: 'silver',
    toolbar: [ 'disabled-button', 'icon-button', 'icon-button-toggle' ].concat(generatedNames).join(' '),
    plugins: [
      'lists', // Required for list functionality (commands),
      'autolink', // Required for turning pasted text into hyperlinks
      'autosave' // Required to prevent users losing content when they press back
    ],

    setup: (ed) => {
      ed.on('skinLoaded', () => {
        // Notification fields for equality: type, text, progressBar, timeout
        ed.notificationManager.open({
          text: 'You will not see this because the mobile theme has no notifications',
          type: 'info'
        });
      });

      // Spockes api spike http://stash/users/spocke/repos/bridge/pull-requests/1/diff

      ed.ui.registry.addButton('disabled-button', {
        type: 'button',
        icon: 'bold',
        // ariaLabel: 'aria says icon button',
        enabled: false,
        onAction: (_api) => {
          console.log('basic-button-2 click, basic-icon');
        }
      });

      ed.ui.registry.addButton('icon-button', {
        type: 'button',
        icon: 'checkmark',
        // ariaLabel: 'aria says icon button',
        onAction: (_api) => {
          console.log('basic-button-2 click, basic-icon');
        }
      });

      ed.ui.registry.addToggleButton('icon-button-toggle', {
        type: 'togglebutton',
        icon: 'italic',
        // ariaLabel: 'aria speaks icon button toggle',
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
      });

      generateButton(ed, 'button', 'generated', 5);

    }
  });
};
