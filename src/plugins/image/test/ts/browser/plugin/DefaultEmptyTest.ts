import { Chain, Log, Pipeline, UnitTest, NamedChain } from '@ephox/agar';
import { Editor } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import {
  cAssertCleanHtml,
  cAssertInputValue,
  cExecCommand,
  cFillActiveDialog,
  cSubmitDialog,
  cWaitForDialog,
  generalTabSelectors,
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
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cAssertInputValue(generalTabSelectors.src, ''), '_'),
        NamedChain.direct('editor', cAssertInputValue(generalTabSelectors.alt, ''), '_'),
        NamedChain.direct('editor', cAssertInputValue(generalTabSelectors.height, ''), '_'),
        NamedChain.direct('editor', cAssertInputValue(generalTabSelectors.width, ''), '_'),
        NamedChain.outputInput
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