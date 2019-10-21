import { Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Editor (Silver) Configuration Close test', (success, failure) => {
  SilverTheme();

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
      base_url: '/project/tinymce/js/tinymce',
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
                name: 'close',
                text: 'Close'
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
