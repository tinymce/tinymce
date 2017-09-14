asynctest(
  'browser.tinymce.core.dom.SelectionQuirksTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      var sClickBody = function (editor) {
        return Step.sync(function () {
          var target = editor.getBody();

          editor.fire('mousedown', { target: target });
          editor.fire('mouseup', { target: target });
          editor.fire('click', { target: target });
        });
      };

      Pipeline.async({}, [
        Logger.t('Test normalization for floated images', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<img src="about:blank" style="float: right"></p>'),
          tinyApis.sSetSelection([0], 1, [0], 2),
          Step.sync(function () {
            var selection = editor.selection.getSel();
            Assertions.assertEq('Anchor node should be the paragraph not the text node', 'P', selection.anchorNode.nodeName);
            Assertions.assertEq('Anchor offset should be the element index', 1, selection.anchorOffset);
          })
        ])),
        Logger.t('Do not normalize on key events when range is expanded', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetSelection([], 0, [], 1),
          tinyActions.sContentKeystroke(Keys.escape(), {}),
          tinyApis.sAssertSelection([], 0, [], 1)
        ])),
        Logger.t('Normalize on key events when range is collapsed', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetSelection([], 1, [], 1),
          tinyActions.sContentKeystroke(Keys.escape(), {}),
          tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
        ])),
        Logger.t('Normalize on mouse events when range is expanded', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetSelection([], 0, [], 1),
          sClickBody(editor),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 1)
        ])),
        Logger.t('Normalize on mouse events when range is collapsed', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetSelection([], 1, [], 1),
          sClickBody(editor),
          tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
        ]))
      ], onSuccess, onFailure);
    }, {
      theme: 'modern',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
