asynctest(
  'browser.tinymce.core.newline.InsertNewLine',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.newline.InsertNewLine',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, InsertNewLine, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sInsertNewline = function (editor, args) {
      return Step.sync(function () {
        InsertNewLine.insert(editor, args);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

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
        ]))
      ], onSuccess, onFailure);
    }, {
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);