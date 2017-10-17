asynctest(
  'browser.tinymce.core.keyboard.InsertBrTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.keyboard.InsertBr',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, InsertBr, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sInsertBr = function (editor) {
      return Step.sync(function () {
        InsertBr.insertBr(editor);
      });
    };

    var sSetRawContent = function (editor, html) {
      return Step.sync(function () {
        editor.getBody().innerHTML = html;
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Enter inside inline boundary link', GeneralSteps.sequence([
          Logger.t('Insert br at beginning of inline boundary link', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
            tinyApis.sSetCursor([0, 1, 0], 0),
            tinyApis.sNodeChanged,
            sInsertBr(editor),
            tinyApis.sAssertSelection([0, 2, 0], 1, [0, 2, 0], 1),
            tinyApis.sAssertContent('<p>a<br /><a href="#">b</a>c</p>')
          ])),
          Logger.t('Insert br in middle inline boundary link', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<a href="#">bc</a>d</p>'),
            tinyApis.sSetCursor([0, 1, 0], 1),
            tinyApis.sNodeChanged,
            sInsertBr(editor),
            tinyApis.sAssertSelection([0, 1], 2, [0, 1], 2),
            tinyApis.sAssertContent('<p>a<a href="#">b<br />c</a>d</p>')
          ])),
          Logger.t('Insert br at end of inline boundary link', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
            tinyApis.sSetCursor([0, 1, 0], 1),
            tinyApis.sNodeChanged,
            sInsertBr(editor),
            tinyApis.sAssertSelection([0], 3, [0], 3),
            tinyApis.sAssertContent('<p>a<a href="#">b</a><br /><br />c</p>')
          ])),
          Logger.t('Insert br at end of inline boundary link with trailing br', GeneralSteps.sequence([
            tinyApis.sFocus,
            sSetRawContent(editor, '<p>a<a href="#">b</a><br /></p>'),
            tinyApis.sSetCursor([0, 1, 0], 1),
            tinyApis.sNodeChanged,
            sInsertBr(editor),
            tinyApis.sAssertSelection([0], 3, [0], 3),
            tinyApis.sAssertContent('<p>a<a href="#">b</a><br /><br /></p>')
          ]))
        ])),
        Logger.t('Enter inside inline boundary code', GeneralSteps.sequence([
          Logger.t('Insert br at beginning of boundary code', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<code>b</code>c</p>'),
            tinyApis.sSetCursor([0, 1, 0], 0),
            tinyApis.sNodeChanged,
            sInsertBr(editor),
            tinyApis.sAssertSelection([0, 1], 2, [0, 1], 2),
            tinyApis.sAssertContent('<p>a<code><br />b</code>c</p>')
          ])),
          Logger.t('Insert br at middle of boundary code', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<code>bc</code>d</p>'),
            tinyApis.sSetCursor([0, 1, 0], 1),
            tinyApis.sNodeChanged,
            sInsertBr(editor),
            tinyApis.sAssertSelection([0, 1], 2, [0, 1], 2),
            tinyApis.sAssertContent('<p>a<code>b<br />c</code>d</p>')
          ])),
          Logger.t('Insert br at end of boundary code', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<code>b</code>c</p>'),
            tinyApis.sSetCursor([0, 1, 0], 1),
            tinyApis.sNodeChanged,
            sInsertBr(editor),
            tinyApis.sAssertSelection([0, 1, 2], 0, [0, 1, 2], 0),
            tinyApis.sAssertContent('<p>a<code>b<br /></code>c</p>')
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);