import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { Focus, Hierarchy, Element } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';
import EditorFocus from 'tinymce/core/focus/EditorFocus';
import ViewBlock from '../../module/test/ViewBlock';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.focus.EditorFocusTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const viewBlock = ViewBlock();

  Theme();

  const cCreateInlineEditor = function (html) {
    return Chain.async(function (viewBlock: any, next, die) {
      viewBlock.update(html);

      EditorManager.init({
        selector: '.tinymce-editor',
        inline: true,
        skin_url: '/project/js/tinymce/skins/lightgray',
        setup (editor) {
          editor.on('SkinLoaded', function () {
            next(editor);
          });
        }
      });
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

  const cRemoveEditor = Chain.op(function (editor: any) {
    editor.remove();
  });

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Focus editor', GeneralSteps.sequence([
      Logger.t('Focus editor initialized on a table', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<table class="tinymce-editor"><tbody><tr><td>a</td></tr></tbody></table>'),
        cFocusEditor,
        cAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
        cRemoveEditor
      ])),
      Logger.t('Focus editor initialized on a div with p', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>'),
        cFocusEditor,
        cAssertSelection([0, 0], 0, [0, 0], 0),
        cRemoveEditor
      ])),
      Logger.t('Focus editor initialized on a list', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<ul class="tinymce-editor"><li>a</li></ul>'),
        cFocusEditor,
        cAssertSelection([0, 0], 0, [0, 0], 0),
        cRemoveEditor
      ]))
    ])),
    Logger.t('hasFocus', GeneralSteps.sequence([
      Logger.t('Focus on normal paragraph', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>'),
        cFocusEditor,
        cAssertHasFocus([]),
        cRemoveEditor
      ])),
      Logger.t('Focus on cE=true inside a cE=false', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<div class="tinymce-editor"><div contenteditable="false">a<div contenteditable="true">b</div></div></div>'),
        cSetSelection([0, 1, 0], 0, [0, 1, 0], 0),
        cFocusElement([0, 1]),
        cAssertHasFocus([0, 1]),
        cRemoveEditor
      ]))
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
