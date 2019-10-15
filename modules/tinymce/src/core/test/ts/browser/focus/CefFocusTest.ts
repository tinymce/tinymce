import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { Element, Hierarchy } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.focus.CefFocusTest', function (success, failure) {
  Theme();

  const sCreateInlineEditor = function (html) {
    return Chain.asStep({}, [
      McEditor.cFromHtml(html, {
        inline: true,
        base_url: '/project/tinymce/js/tinymce'
      })
    ]);
  };

  const sAssertSelection = function (editorIndex, startPath, startOffset, endPath, endOffset) {
    return Step.sync(function () {
      const editor = EditorManager.get(editorIndex);
      const startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();
      const rng = editor.selection.getRng();

      Assertions.assertDomEq('Should be expected from start container', startContainer, Element.fromDom(rng.startContainer));
      Assertions.assertEq('Should be expected from start offset', startOffset, rng.startOffset);
      Assertions.assertDomEq('Should be expected end container', endContainer, Element.fromDom(rng.endContainer));
      Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
    });
  };

  const sRemoveEditors = Chain.asStep({}, [
    Chain.injectThunked(() => EditorManager.get(1)),
    McEditor.cRemove,
    Chain.injectThunked(() => EditorManager.get(0)),
    McEditor.cRemove
  ]);

  Pipeline.async({}, [
    Logger.t('Focus editors', GeneralSteps.sequence([
      sCreateInlineEditor('<div class="tinymce"><p contenteditable="false">a</p></div>'),
      sCreateInlineEditor('<div class="tinymce"><p contenteditable="false">b</p></div>'),
      Step.sync(function () {
        EditorManager.get(0).getBody().focus();
        EditorManager.get(1).getBody().focus();
      }),
      Waiter.sTryUntil('Wait for selection to move', sAssertSelection(1, [0], 0, [0], 0), 10, 3000),
      Step.sync(function () {
        const caretElm0 = EditorManager.get(0).getBody().querySelector('[data-mce-caret]');
        const caretElm1 = EditorManager.get(1).getBody().querySelector('[data-mce-caret]');

        Assertions.assertEq('Should not be a caret element present editor 0', false, !!caretElm0);
        Assertions.assertEq('Should be a caret element present editor 1', true, !!caretElm1);
      }),
      sRemoveEditors
    ]))
  ], function () {
    success();
  }, failure);
});
