asynctest(
  'browser.tinymce.core.focus.CefFocusTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'global!document',
    'tinymce.core.EditorManager',
    'tinymce.core.test.ViewBlock',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, Waiter, Hierarchy, Element, document, EditorManager, ViewBlock, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = new ViewBlock();

    Theme();

    var sCreateInlineEditors = function (html, ranges) {
      return Step.async(function (done) {
        viewBlock.update(html);

        EditorManager.init({
          selector: '.tinymce',
          inline: true,
          skin_url: '/project/src/skins/lightgray/dist/lightgray'
        }).then(function () {
          done();
        });
      });
    };

    var sAssertSelection = function (editorIndex, startPath, startOffset, endPath, endOffset) {
      return Step.sync(function () {
        var editor = EditorManager.get(editorIndex);
        var startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
        var endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();
        var rng = editor.selection.getRng();

        Assertions.assertDomEq('Should be expected from start container', startContainer, Element.fromDom(rng.startContainer));
        Assertions.assertEq('Should be expected from start offset', startOffset, rng.startOffset);
        Assertions.assertDomEq('Should be expected end container', endContainer, Element.fromDom(rng.endContainer));
        Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
      });
    };

    var sRemoveEditors = Step.sync(function () {
      EditorManager.remove();
    });

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('Focus editors', GeneralSteps.sequence([
        sCreateInlineEditors('<div class="tinymce"><p contenteditable="false">a</p></div><div class="tinymce"><p contenteditable="false">b</p></div>'),
        Step.sync(function () {
          EditorManager.get(0).getBody().focus();
          EditorManager.get(1).getBody().focus();
        }),
        Waiter.sTryUntil('Wait for selection to move', sAssertSelection(1, [0], 0, [0], 0), 10, 3000),
        Step.sync(function () {
          var caretElm0 = EditorManager.get(0).getBody().querySelector('[data-mce-caret]');
          var caretElm1 = EditorManager.get(1).getBody().querySelector('[data-mce-caret]');

          Assertions.assertEq('Should not be a caret element present editor 0', false, !!caretElm0);
          Assertions.assertEq('Should be a caret element present editor 1', true, !!caretElm1);
        }),
        sRemoveEditors
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);