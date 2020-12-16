import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { Focus, Hierarchy, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as EditorFocus from 'tinymce/core/focus/EditorFocus';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.focus.EditorFocusTest', (success, failure) => {
  Theme();

  const cCreateInlineEditor = (html) => {
    return McEditor.cFromHtml(html, {
      inline: true,
      base_url: '/project/tinymce/js/tinymce'
    });
  };

  const cCreateEditor = (html) => {
    return McEditor.cFromHtml(html, {
      base_url: '/project/tinymce/js/tinymce'
    });
  };

  const cFocusEditor = Chain.op((editor: Editor) => {
    EditorFocus.focus(editor, false);
  });

  const cFocusElement = (elementPath) => {
    return Chain.op((editor: Editor) => {
      const element = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), elementPath).filter(SugarNode.isHTMLElement).getOrDie();
      Focus.focus(element);
    });
  };

  const cSelectBody = Chain.op(() => {
    const sel = document.getSelection();
    sel.removeAllRanges();
    const rng = document.createRange();
    rng.selectNode(document.body);
    sel.addRange(rng);
    Focus.focus(SugarBody.body());
  });

  const cSetSelection = (startPath, startOffset, endPath, endOffset) => {
    return Chain.op((editor: Editor) => {
      const startContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), endPath).getOrDie();
      const rng = editor.dom.createRng();

      rng.setStart(startContainer.dom, startOffset);
      rng.setEnd(endContainer.dom, endOffset);

      editor.selection.setRng(rng);
    });
  };

  const cAssertSelection = (startPath, startOffset, endPath, endOffset) => {
    return Chain.op((editor: Editor) => {
      const startContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), endPath).getOrDie();
      const rng = editor.selection.getRng();

      Assertions.assertDomEq('Should be expected from start container', startContainer, SugarElement.fromDom(rng.startContainer));
      Assertions.assertEq('Should be expected from start offset', startOffset, rng.startOffset);
      Assertions.assertDomEq('Should be expected end container', endContainer, SugarElement.fromDom(rng.endContainer));
      Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
    });
  };

  const cAssertHasFocus = (elementPath) => {
    return Chain.op((editor: Editor) => {
      const element = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), elementPath).getOrDie();
      Assertions.assertEq('Should have focus on the editor', true, EditorFocus.hasFocus(editor));
      Assertions.assertDomEq('Should be the expected activeElement', element, Focus.active(SugarElement.fromDom(editor.getDoc())).getOrDie());
    });
  };

  Pipeline.async({}, [
    Logger.t('Focus editor', GeneralSteps.sequence([
      Logger.t('Focus editor initialized on a div with p', Chain.asStep({}, [
        cCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>'),
        cFocusEditor,
        cAssertSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
        McEditor.cRemove
      ])),
      Logger.t('Focus editor initialized on a list', Chain.asStep({}, [
        cCreateInlineEditor('<ul class="tinymce-editor"><li>a</li></ul>'),
        cFocusEditor,
        cAssertSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
        McEditor.cRemove
      ])),
      Logger.t('Selection restored on focus with table cE=true', Chain.asStep({}, [
        cCreateEditor('<div class="tinymce-editor"><p>a</p><div>b<table contenteditable="true"><tbody><tr><td>c</td><td></td></tr></tbody></table></div></div>'),
        cSetSelection([ 1, 1, 0, 0, 0, 0 ], 0, [ 1, 1, 0, 0, 0, 0 ], 0),
        cSelectBody,
        cFocusEditor,
        cAssertSelection([ 1, 1, 0, 0, 0, 0 ], 0, [ 1, 1, 0, 0, 0, 0 ], 0),
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
        cSetSelection([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0),
        cFocusElement([ 0, 1 ]),
        cAssertHasFocus([ 0, 1 ]),
        McEditor.cRemove
      ]))
    ]))
  ], success, failure);
});
