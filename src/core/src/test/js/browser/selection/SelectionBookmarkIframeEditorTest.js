asynctest(
  'browser.tinymce.core.selection.SelectionBookmarkIframeEditorTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Cursors',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'global!document',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Cursors, Logger, Pipeline, Step, TinyLoader, PlatformDetection, Hierarchy, Element, Html, document, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    var testDivId = 'testDiv1234';

    var sRemoveTestDiv = Step.sync(function () {
      var input = document.querySelector('#' + testDivId);
      input.parentNode.removeChild(input);
    });

    var sAddTestDiv = Step.sync(function () {
      var div = document.createElement('div');
      div.innerHTML = 'xxx';
      div.contentEditable = true;
      div.id = testDivId;
      document.body.appendChild(div);
    });

    var focusDiv = function () {
      var input = document.querySelector('#' + testDivId);
      input.focus();
    };

    var setSelection = function (editor, start, soffset, finish, foffset) {
      var sc = Hierarchy.follow(Element.fromDom(editor.getBody()), start).getOrDie();
      var fc = Hierarchy.follow(Element.fromDom(editor.getBody()), start).getOrDie();

      var rng = document.createRange();
      rng.setStart(sc.dom(), soffset);
      rng.setEnd(fc.dom(), foffset);

      editor.selection.setRng(rng);
    };

    var assertPath = function (label, root, expPath, expOffset, actElement, actOffset) {
      var expected = Cursors.calculateOne(root, expPath);
      var message = function () {
        var actual = Element.fromDom(actElement);
        var actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
        return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
      };
      Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
      Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
    };

    var assertSelection = function (editor, startPath, soffset, finishPath, foffset) {
      var actual = editor.selection.getRng();
      var root = Element.fromDom(editor.getBody());
      assertPath('start', root, startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', root, finishPath, foffset, actual.endContainer, actual.endOffset);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var browser = PlatformDetection.detect().browser;
      Pipeline.async({}, browser.isIE() ? [ // Only run on IE
        sAddTestDiv,
        Logger.t('assert selection after no nodechanged, should not restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0, 0], 0, [0, 0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          focusDiv();

          assertSelection(editor, [0, 0], 0, [0, 0], 0);
        })),
        Logger.t('assert selection after nodechanged, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0], 0, [0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.nodeChanged();
          focusDiv();

          assertSelection(editor, [1, 0], 1, [1, 0], 1);
        })),
        Logger.t('assert selection after keyup, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0], 0, [0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.fire('keyup', { });
          focusDiv();

          assertSelection(editor, [1, 0], 1, [1, 0], 1);
        })),
        Logger.t('assert selection after mouseup, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0], 0, [0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.fire('mouseup', { });
          focusDiv();

          assertSelection(editor, [1, 0], 1, [1, 0], 1);
        })),
        sRemoveTestDiv
      ] : [], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, function () {
      success();
    }, failure);
  }
);