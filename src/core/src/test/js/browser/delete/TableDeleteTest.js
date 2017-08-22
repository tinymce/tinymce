asynctest(
  'browser.tinymce.core.delete.TableDeleteTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.TableDelete',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, Arr, TinyApis, TinyLoader, Hierarchy, Element, TableDelete, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    var sDelete = function (editor) {
      return Step.sync(function () {
        var returnVal = TableDelete.backspaceDelete(editor);
        Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
      });
    };

    var sDeleteNoop = function (editor) {
      return Step.sync(function () {
        var returnVal = TableDelete.backspaceDelete(editor, true);
        Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,

        Logger.t('Collapsed range should be noop', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([0, 0, 0, 0, 0], 0),
          sDeleteNoop(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0)
        ])),

        Logger.t('Range in only one cell should be noop', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
          sDeleteNoop(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1)
        ])),

        Logger.t('Select all content in all cells removes table', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('')
        ])),

        Logger.t('Select some cells should empty cells', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>'),
          tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>c</td></tr></tbody></table>')
        ])),

        Logger.t('Select some cells between rows should empty cells', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sSetSelection([0, 0, 0, 1, 0], 0, [0, 0, 1, 0, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><th>a</th><th>&nbsp;</th><th>&nbsp;</th></tr><tr><td>&nbsp;</td><td>e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([0, 0, 0, 1], 0, [0, 0, 0, 1], 0)
        ])),

        Logger.t('delete weird selection with only tds', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td data-mce-selected="1">b</td><td>c</td></tr><tr><td>d</td><td data-mce-selected="1">e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sSetSelection([0, 0, 0, 1, 0], 0, [0, 0, 0, 1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>&nbsp;</td><td>c</td></tr><tr><td>d</td><td>&nbsp;</td><td>f</td></tr></tbody></table>')
        ])),

        Logger.t('delete weird selection with th', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><th>a</th><th data-mce-selected="1">b</th><th>c</th></tr><tr><td>d</td><td data-mce-selected="1">e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sSetSelection([0, 0, 0, 1, 0], 0, [0, 0, 0, 1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><th>a</th><th>&nbsp;</th><th>c</th></tr><tr><td>d</td><td>&nbsp;</td><td>f</td></tr></tbody></table>')
        ]))
      ], onSuccess, onFailure);
    }, {
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);