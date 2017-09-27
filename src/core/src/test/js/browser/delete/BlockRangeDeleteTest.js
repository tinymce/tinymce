asynctest(
  'browser.tinymce.core.delete.BlockRangeDeleteTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.delete.BlockRangeDelete',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, BlockRangeDelete, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sDelete = function (editor) {
      return Step.sync(function () {
        var returnVal = BlockRangeDelete.backspaceDelete(editor, true);
        Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
      });
    };

    var sDeleteNoop = function (editor) {
      return Step.sync(function () {
        var returnVal = BlockRangeDelete.backspaceDelete(editor, true);
        Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
      });
    };

    var sBackspace = function (editor, forward) {
      return Step.sync(function () {
        var returnVal = BlockRangeDelete.backspaceDelete(editor, false);
        Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
      });
    };

    var sBackspaceNoop = function (editor, forward) {
      return Step.sync(function () {
        var returnVal = BlockRangeDelete.backspaceDelete(editor, false);
        Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Backspace on collapsed range should be a noop', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          sBackspaceNoop(editor),
          tinyApis.sAssertContent('<p>a</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Delete on collapsed range should be a noop', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          sDeleteNoop(editor),
          tinyApis.sAssertContent('<p>a</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Backspace on range between simple blocks should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetSelection([0, 0], 1, [1, 0], 0),
          sBackspace(editor),
          tinyApis.sAssertContent('<p>ab</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Delete on range between simple blocks should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetSelection([0, 0], 1, [1, 0], 0),
          sDelete(editor),
          tinyApis.sAssertContent('<p>ab</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Backspace from red span to h1 should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<h1>ab</h1><p><span style="color: red;">cd</span></p>'),
          tinyApis.sSetSelection([0, 0], 1, [1, 0, 0], 1),
          sBackspace(editor),
          tinyApis.sAssertContent('<h1>a<span style="color: red;">d</span></h1>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Delete from red span to h1 should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><span style="color: red;">ab</span></p><h1>cd</h1>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<p><span style="color: red;">a</span>d</p>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
        Logger.t('Delete from li to li should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li>ab</li><li>cd</li></ul>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [0, 1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<ul><li>ad</li></ul>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
        Logger.t('Delete from nested li to li should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li>ab<ul><li>cd</li></ul></li></ul>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [0, 0, 1, 0, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<ul><li>ad</li></ul>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
        Logger.t('Delete from li to nested li should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li>ab<ul><li>cd</li></ul></li><li>ef</li></ul>'),
          tinyApis.sSetSelection([0, 0, 1, 0, 0], 1, [0, 1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<ul><li>ab<ul><li>cf</li></ul></li></ul>'),
          tinyApis.sAssertSelection([0, 0, 1, 0, 0], 1, [0, 0, 1, 0, 0], 1)
        ])),
        Logger.t('Delete from deep nested li to li should merge', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li>ab<ul><li>cd<ul><li>ef</li></li></ul></li></ul>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [0, 0, 1, 0, 1, 0, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<ul><li>af</li></ul>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
        Logger.t('Delete on selection of everything should empty editor', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetSelection([0, 0], 0, [1, 0], 1),
          sDelete(editor),
          tinyApis.sAssertContent(''),
          tinyApis.sAssertSelection([0], 0, [0], 0),
          tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
            return s.element('body', {
              children: [
                s.element('p', { children: [ s.element('br', { attrs: { 'data-mce-bogus': str.is('1') } }) ] })
              ]
            });
          }))
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      indent: false
    }, success, failure);
  }
);