import { GeneralSteps, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.core.SubmitTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  const sTestEmbedContentSubmit = function (ui, editor, apis, url, expected) {
    return GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      Utils.sSetFormItemNoEvent(ui, url),
      ui.sClickOnUi('click ok button', 'div.mce-primary > button'),
      Utils.sAssertEditorContent(apis, editor, expected)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      sTestEmbedContentSubmit(ui, editor, apis, 'https://www.youtube.com/watch?v=IcgmSRJHu_8',
        '<p><span id="fake">https://www.youtube.com/watch?v=IcgmSRJHu_8</span></p>'),
      apis.sSetContent(''),
      apis.sDeleteSetting('media_url_resolver'),
      sTestEmbedContentSubmit(ui, editor, apis, 'https://www.youtube.com/watch?v=IcgmSRJHu_8',
        '<p><iframe src="//www.youtube.com/embed/IcgmSRJHu_8" width="560" height="314" ' +
        'allowfullscreen="allowfullscreen"></iframe></p>'),
      apis.sSetContent('')
    ], onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    media_url_resolver (data, resolve) {
      setTimeout(function () {
        resolve({
          html: '<span id="fake">' + data.url + '</span>'
        });
      }, 500);
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
