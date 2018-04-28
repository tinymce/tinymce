import { GeneralSteps, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Unlink from 'tinymce/themes/inlite/alien/Unlink';
import Theme from 'tinymce/themes/inlite/Theme';

UnitTest.asynctest('browser.alien.UnlinkTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sUnlinkSelection = function (editor) {
    return Step.sync(function () {
      Unlink.unlinkSelection(editor);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sAssertUnlink = function (inputHtml, startPath, startOffset, finishPath, finishOffset, expectedHtml) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(inputHtml),
        tinyApis.sSetSelection(startPath, startOffset, finishPath, finishOffset),
        sUnlinkSelection(editor),
        tinyApis.sAssertContent(expectedHtml)
      ]);
    };

    Pipeline.async({}, [
      sAssertUnlink('<p><a href="#">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '<p>a</p>'),
      sAssertUnlink('<p><a href="#">a</a>b</p>', [0, 0, 0], 0, [0, 1], 1, '<p>ab</p>'),
      sAssertUnlink('<p><a href="#">a</a><p><a href="#">b</a>', [0, 0, 0], 0, [0, 0, 0], 1, '<p>a</p>\n<p><a href="#">b</a></p>'),
      sAssertUnlink('<p><a href="#">a</a><p><a href="#">b</a>', [0, 0, 0], 0, [1, 0, 0], 1, '<p>a</p>\n<p>b</p>')
    ], onSuccess, onFailure);
  }, {
    inline: true,
    theme: 'inlite',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
