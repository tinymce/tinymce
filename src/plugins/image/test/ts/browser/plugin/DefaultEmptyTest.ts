import { Log, Pipeline, UnitTest, Chain } from '@ephox/agar';
import { Editor } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import {
  cAssertCleanHtml,
  cExecCommand,
  cFillActiveDialog,
  cSubmitDialog,
  cWaitForDialog,
  silverSettings,
} from '../../module/Helpers';

UnitTest.asynctest('Default image dialog on empty data', (success, failure) => {
  SilverTheme();
  ImagePlugin();
  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Image: default image dialog on empty data', [
      Editor.cFromSettings(silverSettings),
      cExecCommand('mceImage', true),
      cWaitForDialog(),
      Chain.async((v, n, d) => d('need to assert something here')),
      // TODO ACTUALLY FIX THIS
      // cAssertActiveDialogData('checking initial dialog data', {
      //   src: {
      //     value: '',
      //     meta: {}
      //   },
      //   alt: '',
      //   dimensions: {
      //     width: '',
      //     height: ''
      //   }
      // }),
      cFillActiveDialog({
        src: {
          value: 'src'
        },
        alt: 'alt',
        dimensions: {
          width: '200',
          height: '100'
        }
      }),
      cSubmitDialog(),
      cAssertCleanHtml('Checking output', '<p><img src="src" alt="alt" width="200" height="100" /></p>'),
      Editor.cRemove
    ])
  ], () => success(), failure);
});