import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.TableNavigationTest', (success, failure) => {
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      Logger.t('Up navigation', GeneralSteps.sequence([
        Logger.t('Arrow up on first position in table cell', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 0, 0, 0], 0),
          tinyActions.sContentKeystroke(Keys.up(), {}),
          tinyApis.sAssertSelection([0], 0, [0], 0),
          tinyApis.sAssertContent('<p>&nbsp;</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>')
        ])),
        Logger.t('Arrow up on first position in table cell to caption', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><caption>a</caption><tbody><tr><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 1, 0, 0, 0], 0),
          tinyActions.sContentKeystroke(Keys.up(), {}),
          tinyApis.sAssertSelection([0, 0, 0], 0, [0, 0, 0], 0),
          tinyApis.sAssertContent('<table><caption>a</caption><tbody><tr><td>b</td></tr></tbody></table>')
        ])),
        Logger.t('Arrow up on second position in first table cell', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 0, 0, 0], 1),
          tinyActions.sContentKeystroke(Keys.up(), {}),
          tinyApis.sAssertSelection([0], 0, [0], 0),
          tinyApis.sAssertContent('<p>&nbsp;</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>')
        ])),
        Logger.t('Arrow up on first position in first table cell on the second row', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 1, 0, 0], 0),
          tinyActions.sContentKeystroke(Keys.up(), {}),
          tinyApis.sAssertSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>')
        ])),
      ])),
      Logger.t('Down navigation', GeneralSteps.sequence([
        Logger.t('Arrow down on last position in last table cell', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 0, 1, 0], 1),
          tinyActions.sContentKeystroke(Keys.down(), {}),
          tinyApis.sAssertSelection([1], 0, [1], 0),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>&nbsp;</p>')
        ])),
        Logger.t('Arrow down on last position in last table cell with br', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b<br></td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 0, 1, 0], 1),
          tinyActions.sContentKeystroke(Keys.down(), {}),
          tinyApis.sAssertSelection([1], 0, [1], 0),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>&nbsp;</p>')
        ])),
        Logger.t('Arrow down on second last position in last table cell', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 0, 1, 0], 0),
          tinyActions.sContentKeystroke(Keys.down(), {}),
          tinyApis.sAssertSelection([1], 0, [1], 0),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>&nbsp;</p>')
        ])),
        Logger.t('Arrow down on last position in last table cell on the first row', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 0, 1, 0], 1),
          tinyActions.sContentKeystroke(Keys.down(), {}),
          tinyApis.sAssertSelection([0, 0, 1, 1, 0], 1, [0, 0, 1, 1, 0], 1),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>')
        ])),
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
