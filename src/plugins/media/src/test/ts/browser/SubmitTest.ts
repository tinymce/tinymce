import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/media/Plugin';
import Utils from '../module/test/Utils';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.core.SubmitTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  var sTestEmbedContentSubmit = function (ui, editor, apis, url, expected) {
    return GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      Utils.sSetFormItemNoEvent(ui, url),
      ui.sClickOnUi('click ok button', 'div.mce-primary > button'),
      Utils.sAssertEditorContent(apis, editor, expected)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var ui = TinyUi(editor);
    var apis = TinyApis(editor);

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
    plugins: ["media"],
    toolbar: "media",
    media_url_resolver: function (data, resolve) {
      setTimeout(function () {
        resolve({
          html: '<span id="fake">' + data.url + '</span>'
        });
      }, 500);
    },
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

