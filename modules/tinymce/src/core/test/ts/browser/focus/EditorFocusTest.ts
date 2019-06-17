import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McEditor } from '@ephox/mcagar';
import { Focus, Hierarchy, Element } from '@ephox/sugar';
import EditorFocus from 'tinymce/core/focus/EditorFocus';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.focus.EditorFocusTest', function (success, failure) {
  Theme();

  const cCreateInlineEditor = function (html) {
    return McEditor.cFromHtml(html, {
      inline: true,
      base_url: '/project/tinymce/js/tinymce'
    });
  };

  const cFocusEditor = Chain.op(function (editor: any) {
    EditorFocus.focus(editor, false);
  });

  const cFocusElement = function (elementPath) {
    return Chain.op(function (editor: any) {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie();
      element.dom().focus();
    });
  };

  const cSetSelection = function (startPath, startOffset, endPath, endOffset) {
    return Chain.op(function (editor: any) {
      const startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();
      const rng = editor.dom.createRng();

      rng.setStart(startContainer.dom(), startOffset);
      rng.setEnd(endContainer.dom(), endOffset);

      editor.selection.setRng(rng);
    });
  };

  const cAssertSelection = function (startPath, startOffset, endPath, endOffset) {
    return Chain.op(function (editor: any) {
      const startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();
      const rng = editor.selection.getRng();

      Assertions.assertDomEq('Should be expected from start container', startContainer, Element.fromDom(rng.startContainer));
      Assertions.assertEq('Should be expected from start offset', startOffset, rng.startOffset);
      Assertions.assertDomEq('Should be expected end container', endContainer, Element.fromDom(rng.endContainer));
      Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
    });
  };

  const cAssertHasFocus = function (elementPath) {
    return Chain.op(function (editor: any) {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie();
      Assertions.assertEq('Should have focus on the editor', true, EditorFocus.hasFocus(editor));
      Assertions.assertDomEq('Should be the expected activeElement', element, Focus.active().getOrDie());
    });
  };

  Pipeline.async({}, [
    Logger.t('Focus editor', GeneralSteps.sequence([
      Logger.t('Focus editor initialized on a div with p', Chain.asStep({}, [
        cCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>'),
        cFocusEditor,
        cAssertSelection([0, 0], 0, [0, 0], 0),
        McEditor.cRemove
      ])),
      Logger.t('Focus editor initialized on a list', Chain.asStep({}, [
        cCreateInlineEditor('<ul class="tinymce-editor"><li>a</li></ul>'),
        cFocusEditor,
        cAssertSelection([0, 0], 0, [0, 0], 0),
        McEditor.cRemove
      ]))
    ])),
    Logger.t('hasFocus', GeneralSteps.sequence([
      Logger.t('Focus on normal paragraph', Chain.asStep({}, [
        cCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>'),
        cFocusEditor,
        cAssertHasFocus([]),
        McEditor.cRemove
      ])),
      Logger.t('Focus on cE=true inside a cE=false', Chain.asStep({}, [
        cCreateInlineEditor('<div class="tinymce-editor"><div contenteditable="false">a<div contenteditable="true">b</div></div></div>'),
        cSetSelection([0, 1, 0], 0, [0, 1, 0], 0),
        cFocusElement([0, 1]),
        cAssertHasFocus([0, 1]),
        McEditor.cRemove
      ]))
    ]))
  ], function () {
    success();
  }, failure);
});
