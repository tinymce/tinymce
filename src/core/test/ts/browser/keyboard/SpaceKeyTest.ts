import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.SpaceKeyTest', (success, failure) => {
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    const img = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=" />';

    Pipeline.async({}, [
      Logger.t('Space key around inline boundary elements', GeneralSteps.sequence([
        Logger.t('Press space at beginning of inline boundary inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 0),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          tinyApis.sAssertContent('<p>a <a href="#">&nbsp;b</a> c</p>')
        ])),
        Logger.t('Press space at end of inline boundary inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 1),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2),
          tinyApis.sAssertContent('<p>a <a href="#">b&nbsp;</a> c</p>')
        ])),
        Logger.t('Press space at beginning of inline boundary inserting space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 0),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          tinyApis.sAssertContent('<p>a<a href="#"> b</a>c</p>')
        ])),
        Logger.t('Press space at end of inline boundary inserting space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 1),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2),
          tinyApis.sAssertContent('<p>a<a href="#">b </a>c</p>')
        ])),
        Logger.t('Press space at start of inline boundary with leading space inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#"> b</a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 0),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          tinyApis.sAssertContent('<p>a<a href="#">&nbsp; b</a>c</p>')
        ])),
        Logger.t('Press space at end of inline boundary with trailing space inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#">b </a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 2),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 3, [0, 1, 0], 3),
          tinyApis.sAssertContent('<p>a<a href="#">b &nbsp;</a>c</p>')
        ]))
      ])),
      Logger.t('Space key in block elements', GeneralSteps.sequence([
        Logger.t('Press space at beginning of block', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 0),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1),
          tinyApis.sAssertContent('<p>&nbsp;a</p>')
        ])),
        Logger.t('Press space at end of block', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a&nbsp;</p>')
        ]))
      ])),
      Logger.t('Space key in text', GeneralSteps.sequence([
        Logger.t('Press space in middle of text', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>ab</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a b</p>')
        ])),
        Logger.t('Press space after letter preceded by space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a bc</p>'),
          tinyApis.sSetCursor([0, 0], 3),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 4, [0, 0], 4),
          tinyApis.sAssertContent('<p>a b c</p>')
        ])),
        Logger.t('Press space before letter followed by space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>ab c</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a b c</p>')
        ])),
        Logger.t('Press space after letter followed by space in inline element', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<em> c</em></p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a&nbsp;<em> c</em></p>')
        ])),
        Logger.t('Press space before letter preceded by space in inline element', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<em>b </em>c</p>'),
          tinyApis.sSetCursor([0, 2], 0),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 2], 1, [0, 2], 1),
          tinyApis.sAssertContent('<p>a<em>b </em>&nbsp;c</p>')
        ])),
        Logger.t('Press space after letter followed by nbsp in inline element', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<em>&nbsp;c</em></p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a <em>&nbsp;c</em></p>')
        ])),
        Logger.t('Press space before letter preceded by nbsp in inline element', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<em>b&nbsp;</em>c</p>'),
          tinyApis.sSetCursor([0, 2], 0),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 2], 1, [0, 2], 1),
          tinyApis.sAssertContent('<p>a<em>b&nbsp;</em> c</p>')
        ])),
        Logger.t('Press space before nbsp in text', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a&nbsp;b</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a &nbsp;b</p>')
        ])),
        Logger.t('Press space after nbsp in text', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a&nbsp;b</p>'),
          tinyApis.sSetCursor([0, 0], 2),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3),
          tinyApis.sAssertContent('<p>a&nbsp; b</p>')
        ])),
        Logger.t('Press space between two nbsp in text', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a&nbsp;&nbsp;b</p>'),
          tinyApis.sSetCursor([0, 0], 2),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3),
          tinyApis.sAssertContent('<p>a&nbsp; &nbsp;b</p>')
        ])),
        Logger.t('Press space before two nbsp in text', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a&nbsp;&nbsp;b</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a &nbsp;&nbsp;b</p>')
        ])),
        Logger.t('Press space after two nbsp in text', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a&nbsp;&nbsp;b</p>'),
          tinyApis.sSetCursor([0, 0], 3),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 4, [0, 0], 4),
          tinyApis.sAssertContent('<p>a&nbsp;&nbsp; b</p>')
        ])),
        Logger.t('Press space before letter followed by space in inline element', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>ab<em> c</em></p>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>a b<em> c</em></p>')
        ])),
        Logger.t('Press space after letter preceded by space in inline element', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<em>b </em>cd</p>'),
          tinyApis.sSetCursor([0, 2], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 2], 2, [0, 2], 2),
          tinyApis.sAssertContent('<p>a<em>b </em>c d</p>')
        ]))
      ])),
      Logger.t('Space key in preformatted text', GeneralSteps.sequence([
        Logger.t('Press space at start of pre', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<pre>ab</pre>'),
          tinyApis.sSetCursor([0, 0], 0),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1),
          tinyApis.sAssertContent('<pre> ab</pre>')
        ])),
        Logger.t('Press space in middle of text', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<pre>ab</pre>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<pre>a b</pre>')
        ])),
        Logger.t('Press space at end of pre', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<pre>ab</pre>'),
          tinyApis.sSetCursor([0, 0], 2),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3),
          tinyApis.sAssertContent('<pre>ab </pre>')
        ])),
        Logger.t('Press space in after space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<pre>a b</pre>'),
          tinyApis.sSetCursor([0, 0], 2),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3),
          tinyApis.sAssertContent('<pre>a  b</pre>')
        ])),
        Logger.t('Press space in before space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<pre>a b</pre>'),
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<pre>a  b</pre>')
        ]))
      ])),
      Logger.t('Space key at br', GeneralSteps.sequence([
        Logger.t('Press space between two br:s in block', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetRawContent('<p><br><br></p>'),
          tinyApis.sSetCursor([0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
          tinyApis.sAssertContent('<p><br />&nbsp;</p>')
        ])),
        Logger.t('Press space after br in beginning of text node', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetRawContent('<p>a<br />b</p>'),
          tinyApis.sSetCursor([0, 2], 0),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 2], 1, [0, 2], 1),
          tinyApis.sAssertContent('<p>a<br />&nbsp;b</p>')
        ])),
        Logger.t('Press space before br in beginning of text node', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetRawContent('<p><br />b</p>'),
          tinyApis.sSetCursor([0], 0),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1),
          tinyApis.sAssertContent('<p>&nbsp;<br />b</p>')
        ]))
      ])),
      Logger.t('Space key at node indexes', GeneralSteps.sequence([
        Logger.t('Press space before image element in block', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetRawContent(`<p>${img}</p>`),
          tinyApis.sSetCursor([0], 0),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1),
          tinyApis.sAssertContent(`<p>&nbsp;${img}</p>`)
        ])),
        Logger.t('Press space between two image elements in block', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetRawContent(`<p>${img}${img}</p>`),
          tinyApis.sSetCursor([0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
          tinyApis.sAssertContent(`<p>${img} ${img}</p>`)
        ])),
        Logger.t('Press space after image element in block', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetRawContent(`<p>${img}</p>`),
          tinyApis.sSetCursor([0], 1),
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
          tinyApis.sAssertContent(`<p>${img}&nbsp;</p>`)
        ]))
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
