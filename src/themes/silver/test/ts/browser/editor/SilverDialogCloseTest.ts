import '../../../../../silver/main/ts/Theme';

import { Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

UnitTest.asynctest('Editor (Silver) Configuration Close test', (success, failure) => {
  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);

      Pipeline.async({ }, Logger.ts(
          'Dialog closes without error using close button',
          [
            tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog'),
            tinyUi.sClickOnUi('click on close button', 'div[role="dialog"] button[aria-label="Close"]'),
          ]
        ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide',
      setup: (ed) => {
        ed.on('init', () => {
          ed.windowManager.open({
            title: 'test',
            body: {
              type: 'panel',
              items: []
            },
            buttons: [
              {
                type: 'cancel',
                name: 'cancel',
                text: 'Cancel'
              }
            ],
          });
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});