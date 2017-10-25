asynctest(
  'browser.tinymce.core.dom.SelectionQuirksTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Keys, Keyboard, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, Element, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      // hijack editor.selection.normalize() to count how many times it will be invoked
      var backupNormalize = editor.selection.normalize;
      var normalize = function () {
        normalize.count = normalize.count === undefined ? 1 : normalize.count + 1;
        backupNormalize.apply(this, arguments);
      };
      editor.selection.normalize = normalize;

      var sResetNormalizeCounter = function () {
        return Step.sync(function () {
          normalize.count = 0;
        });
      };

      var sAssertNormalizeCounter = function (expected) {
        return Step.sync(function () {
          Assertions.assertEq('checking normalization counter', expected, normalize.count);
        });
      };

      var sClickBody = function (editor) {
        return Step.sync(function () {
          var target = editor.getBody();

          editor.fire('mousedown', { target: target });
          editor.fire('mouseup', { target: target });
          editor.fire('click', { target: target });
        });
      };

      Pipeline.async({}, [
        tinyApis.sFocus,

        Logger.t('Test normalization for floated images', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<img src="about:blank" style="float: right"></p>'),
          tinyApis.sSetSelection([0], 1, [0], 2),
          Step.sync(function () {
            var selection = editor.selection.getSel();
            Assertions.assertEq('Anchor node should be the paragraph not the text node', 'P', selection.anchorNode.nodeName);
            Assertions.assertEq('Anchor offset should be the element index', 1, selection.anchorOffset);
          })
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
        ])),

        Logger.t("Normalization during operations with modifier keys, should run only once in the end when user releases modifier key.", GeneralSteps.sequence([
          sResetNormalizeCounter(),
          tinyApis.sSetContent('<p><b>a</b><i>a</i></p>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0], 0),
          Keyboard.sKeyup(Element.fromDom(editor.getDoc()), Keys.left(), { shift: true }),
          sAssertNormalizeCounter(0),
          Keyboard.sKeyup(Element.fromDom(editor.getDoc()), 17, {}), // single ctrl
          sAssertNormalizeCounter(1),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
        ]))
      ], onSuccess, onFailure);
    }, {
      theme: 'modern',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
