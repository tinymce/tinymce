import { Chain, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import {
  cAssertCleanHtml, cAssertInputValue, cFillActiveDialog, cSubmitDialog, cWaitForDialog, generalTabSelectors
} from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.DialogUpdateTest', (success, failure) => {
  SilverTheme();
  Plugin();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Log.chainsAsStep('TBA', 'Update an image by setting title to empty should remove the existing title attribute', [
        Chain.inject(editor),
        ApiChains.cSetContent('<p><img src="#1" title="title" /></p>'),
        ApiChains.cSetSelection([ 0 ], 0, [ 0 ], 1),
        ApiChains.cExecCommand('mceImage', true),
        cWaitForDialog(),
        Chain.fromParent(Chain.identity, [
          cAssertInputValue(generalTabSelectors.src, '#1'),
          cAssertInputValue(generalTabSelectors.title, 'title')
        ]),
        cFillActiveDialog({
          src: { value: '#2' },
          title: ''
        }),
        cSubmitDialog(),
        cAssertCleanHtml('Checking output', '<p><img src="#2" /></p>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_title: true
  }, success, failure);
});
