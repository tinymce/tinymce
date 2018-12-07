import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import InsertNewLine from 'tinymce/core/newline/InsertNewLine';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Editor } from 'tinymce/core/api/Editor';
import { PlatformDetection } from '@ephox/sand';

const browser = PlatformDetection.detect().browser;

UnitTest.asynctest('browser.tinymce.core.newline.InsertNewLine', (success, failure) => {
  Theme();

  const sInsertNewline = function (editor: Editor, args) {
    return Step.sync(function () {
      InsertNewLine.insert(editor, args);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('Enter in paragraph', GeneralSteps.sequence([
        Logger.t('Insert block before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>ab</p>'),
          tinyApis.sSetCursor([0, 0], 0),
          sInsertNewline(editor, { }),
          tinyApis.sAssertContent('<p>&nbsp;</p><p>ab</p>'),
          tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
        ])),
        Logger.t('Split block in the middle', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>ab</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          sInsertNewline(editor, { }),
          tinyApis.sAssertContent('<p>a</p><p>b</p>'),
          tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
        ])),
        Logger.t('Insert block after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>ab</p>'),
          tinyApis.sSetCursor([0, 0], 2),
          sInsertNewline(editor, { }),
          tinyApis.sAssertContent('<p>ab</p><p>&nbsp;</p>'),
          tinyApis.sAssertSelection([1], 0, [1], 0)
        ]))
      ])),
      Logger.t('br_newline_selector', GeneralSteps.sequence([
        tinyApis.sSetSetting('br_newline_selector', 'p,div.test'),
        Logger.t('Insert newline where br is forced', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>ab</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          sInsertNewline(editor, { }),
          tinyApis.sNodeChanged,
          tinyApis.sAssertContent('<p>a<br />b</p>')
        ])),
        Logger.t('Insert newline where br is forced', GeneralSteps.sequence([
          tinyApis.sSetContent('<div class="test">ab</div>'),
          tinyApis.sSetCursor([0, 0], 1),
          sInsertNewline(editor, { }),
          tinyApis.sNodeChanged,
          tinyApis.sAssertContent('<div class="test">a<br />b</div>')
        ])),
        Logger.t('Insert newline where br is not forced', GeneralSteps.sequence([
          tinyApis.sSetContent('<div>ab</div>'),
          tinyApis.sSetCursor([0, 0], 1),
          sInsertNewline(editor, { }),
          tinyApis.sNodeChanged,
          tinyApis.sAssertContent('<div>a</div><div>b</div>')
        ])),
        tinyApis.sDeleteSetting('br_newline_selector')
      ])),
      Logger.t('no_newline_selector', GeneralSteps.sequence([
        tinyApis.sSetSetting('no_newline_selector', [ 'p,div.test' ]),
        Logger.t('Insert newline where newline is blocked', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>ab</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          sInsertNewline(editor, { }),
          tinyApis.sNodeChanged,
          tinyApis.sAssertContent('<p>ab</p>')
        ])),
        Logger.t('Insert newline where newline is blocked', GeneralSteps.sequence([
          tinyApis.sSetContent('<div class="test">ab</div>'),
          tinyApis.sSetCursor([0, 0], 1),
          sInsertNewline(editor, { }),
          tinyApis.sNodeChanged,
          tinyApis.sAssertContent('<div class="test">ab</div>')
        ])),
        Logger.t('Insert newline where newline is not blocked', GeneralSteps.sequence([
          tinyApis.sSetContent('<div>ab</div>'),
          tinyApis.sSetCursor([0, 0], 1),
          sInsertNewline(editor, { }),
          tinyApis.sNodeChanged,
          tinyApis.sAssertContent('<div>a</div><div>b</div>')
        ])),
        tinyApis.sDeleteSetting('no_newline_selector')
      ])),
      Logger.t('Insert newline before image in link', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><a href="#">a<img src="about:blank" /></a></p>'),
        tinyApis.sSetCursor([0, 0], 1),
        sInsertNewline(editor, { }),
        tinyApis.sAssertContent('<p><a href="#">a</a></p><p><a href="#"><img src="about:blank" /></a></p>'),
        // For some bizarre IE issue getSelection().addRange() creates a zwsp from nowhere and moves the caret after it
        browser.isIE() ? tinyApis.sAssertSelection([1, 0, 0], 1, [1, 0, 0], 1) : tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
