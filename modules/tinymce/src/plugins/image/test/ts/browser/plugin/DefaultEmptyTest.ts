import { Chain, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import {
  cAssertCleanHtml, cAssertInputValue, cExecCommand, cFillActiveDialog, cSubmitDialog, cWaitForDialog, generalTabSelectors, silverSettings
} from '../../module/Helpers';

UnitTest.asynctest('Default image dialog on empty data', (success, failure) => {
  SilverTheme();
  ImagePlugin();
  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Image: default image dialog on empty data', [
      Editor.cFromSettings(silverSettings),
      cExecCommand('mceImage', true),
      cWaitForDialog(),
      Chain.fromParent(Chain.identity, [
        cAssertInputValue(generalTabSelectors.src, ''),
        cAssertInputValue(generalTabSelectors.alt, ''),
        cAssertInputValue(generalTabSelectors.height, ''),
        cAssertInputValue(generalTabSelectors.width, '')
      ]),
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
