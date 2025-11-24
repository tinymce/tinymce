/* eslint-disable no-console */
import { Fun } from '@ephox/katamari';

import type { Editor, TinyMCE } from 'tinymce/core/api/PublicApi';

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
    license_key: 'gpl',
    theme: 'silver',
    toolbar: [ 'disabled-button', 'icon-button', 'icon-button-toggle' ],
    plugins: [
    ],

    setup: (ed) => {
      ed.ui.registry.addContext('enabledDemo', Fun.never);
      ed.on('skinLoaded', () => {
        // Notification fields for equality: type, text, progressBar, timeout
        ed.notificationManager.open({
          text: 'You will not see this because the mobile theme has no notifications',
          type: 'info'
        });
      });

      // Spockes api spike http://stash/users/spocke/repos/bridge/pull-requests/1/diff

      ed.ui.registry.addButton('icon-button', {
        type: 'button',
        icon: 'checkmark',
        // ariaLabel: 'aria says icon button',
        onAction: (_api) => {
          console.log('basic-button-2 click, basic-icon');
        },
        context: (state) => {
          console.log('context checker', state.check('enabledDemo'));
          return state.check('enableddemo');
        }
      });
    }
  });
};
