import { Assertions, GeneralSteps, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { Hierarchy, Element } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';
import ViewBlock from '../../module/test/ViewBlock';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.focus.CefFocusTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const viewBlock = ViewBlock();

  Theme();

  const sCreateInlineEditors = function (html) {
    return Step.async(function (done) {
      viewBlock.update(html);

      EditorManager.init({
        selector: '.tinymce',
        inline: true,
        skin_url: '/project/js/tinymce/skins/lightgray'
      }).then(function () {
        done();
      });
    });
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

  const sRemoveEditors = Step.sync(function () {
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
        const caretElm0 = EditorManager.get(0).getBody().querySelector('[data-mce-caret]');
        const caretElm1 = EditorManager.get(1).getBody().querySelector('[data-mce-caret]');

        Assertions.assertEq('Should not be a caret element present editor 0', false, !!caretElm0);
        Assertions.assertEq('Should be a caret element present editor 1', true, !!caretElm1);
      }),
      sRemoveEditors
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
