import { Cursors, RealClipboard, RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InsertNewLine from 'tinymce/core/newline/InsertNewLine';
import CodePlugin from 'tinymce/plugins/code/Plugin';

import * as PasteEventUtils from '../../module/test/PasteEventUtils';

describe('webdriver.tinymce.core.paste.CopyAndPasteTest', () => {
  const platform = PlatformDetection.detect();
  const os = platform.os;
  const browser = platform.browser;

  const lastBeforeInputEvent = Singleton.value<EditorEvent<InputEvent>>();
  const lastInputEvent = Singleton.value<EditorEvent<InputEvent>>();
  let inputEventTypes: string[] = [];
  const setInputEventSingleTonAndAddType = (singleton: Singleton.Value<EditorEvent<InputEvent>>, event: EditorEvent<InputEvent>): void => {
    singleton.set(event);
    inputEventTypes.push(event.type);
  };
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'code',
    toolbar: false,
    statusbar: false,
    custom_elements: 'custom-block',
    setup: (editor: Editor) => {
      editor.on('beforeinput input', (e) => {
        if (e.inputType === 'insertFromPaste') {
          setInputEventSingleTonAndAddType(e.type === 'beforeinput' ? lastBeforeInputEvent : lastInputEvent, e);
        }
      });
    }
  }, [ CodePlugin ], true);

  const pAssertInputEvents = async (clipboardHtml: string, isNative?: boolean): Promise<void> => {
    await PasteEventUtils.pWaitForAndAssertInputEvents(lastBeforeInputEvent, lastInputEvent, clipboardHtml, isNative);
    assert.deepEqual(inputEventTypes, [ 'beforeinput', 'input' ], 'Should have fired exactly 1 beforeinput event and 1 input event in order');
    lastBeforeInputEvent.clear();
    lastInputEvent.clear();
    inputEventTypes = [];
  };

  const pCopyAndPaste = async (editor: Editor, source: Cursors.CursorPath, target: Cursors.CursorPath): Promise<void> => {
    TinySelections.setSelection(editor, source.startPath, source.soffset, source.finishPath, source.foffset);
    await RealClipboard.pCopy('iframe => body');
    TinySelections.setSelection(editor, target.startPath, target.soffset, target.finishPath, target.foffset);
    await RealClipboard.pPaste('iframe => body');
  };

  it('TINY-7719: Wrapped elements are preserved in copy and paste (headings)', async () => {
    const editor = hook.editor();

    const pTestBlockTags = async (tagName: string) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 2, 0 ], soffset: 1, finishPath: [ 2, 0 ], foffset: 3 }
      );
      await pAssertInputEvents(`<${tagName}>abc</${tagName}>`);
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 1, 0 ], soffset: 1, finishPath: [ 1, 0 ], foffset: 4 }
      );
      await pAssertInputEvents(`<${tagName}>abc</${tagName}>`);
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>o</p>\n' +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>r kind of tag</p>\n' +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        `<${tagName}>e tag</${tagName}>`
      );
    };

    for (const tagName of [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]) {
      await pTestBlockTags(tagName);
    }
  });

  it('TINY-7719: Wrapped elements are preserved in copy and paste (pre)', async () => {
    const editor = hook.editor();

    const pTestPreTag = async (tagName: string) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 2, 0 ], soffset: 1, finishPath: [ 2, 0 ], foffset: 3 }
      );
      await pAssertInputEvents(`<${tagName}>abc</${tagName}>`);
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 1, 0 ], soffset: 1, finishPath: [ 1, 0 ], foffset: 4 }
      );
      await pAssertInputEvents(`<${tagName}>abc</${tagName}>`);
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>o</p>\n' +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>r kind of tag</p>\n' +
        `<${tagName}>sabce tag</${tagName}>`
      );
    };

    for (const tagName of [ 'pre' ]) {
      await pTestPreTag(tagName);
    }
  });

  it('TINY-7719: if the copy has multiple tags in it, it should be preserved (pre)', async () => {
    const editor = hook.editor();

    const pTestPreTag = async (tagName: string) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 1, 0 ], foffset: 5 },
        { startPath: [ 2, 0 ], soffset: 1, finishPath: [ 2, 0 ], foffset: 3 }
      );
      await pAssertInputEvents(`<${tagName}>abc</${tagName}><p>other</p>`);
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other kind of tag</p>\n' +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other</p>\n' +
        `<${tagName}>e tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 2, 0 ], soffset: 0, finishPath: [ 3, 0 ], foffset: 3 },
        { startPath: [ 5, 0 ], soffset: 1, finishPath: [ 5, 0 ], foffset: 3 }
      );
      await pAssertInputEvents(`<${tagName}>s</${tagName}><${tagName}>abc</${tagName}>`);
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other kind of tag</p>\n' +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other</p>\n' +
        `<${tagName}>e</${tagName}>\n` +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        `<${tagName}>ag</${tagName}>`
      );
    };

    for (const tagName of [ 'pre' ]) {
      await pTestPreTag(tagName);
    }
  });

  it('TINY-7719: Wrapped elements are preserved in copy and paste (inline elements)', async () => {
    const editor = hook.editor();

    const pTestInlineTags = async (tagName: string) => {
      editor.setContent(
        `<p><${tagName} class="someclass">abc</${tagName}></p>` +
        '<h1>something</h1>' +
        '<p>abc def</p>'
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
        { startPath: [ 1, 0 ], soffset: 1, finishPath: [ 1, 0 ], foffset: 4 }
      );
      await pAssertInputEvents(`<${tagName} class="someclass">abc</${tagName}>`);
      TinyAssertions.assertContent(editor,
        `<p><${tagName} class="someclass">abc</${tagName}></p>\n` +
        `<h1>s<${tagName} class="someclass">abc</${tagName}>thing</h1>\n` +
        '<p>abc def</p>'
      );
    };

    const inlineElements = [
      'big', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code',
      'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo',
      'map', 'q', 'span', 'sub', 'sup', 'button', 'label'
    ];

    for (const tagName of inlineElements) {
      await pTestInlineTags(tagName);
    }
  });

  it('TINY-9829: Paste external plain-text-only content should fire native input events', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');

    // Copy from code dialog for external plain-text-only content
    editor.execCommand('mceCodeEditor');
    await TinyUiActions.pWaitForDialog(editor);
    const textareaSelector = 'div[role="dialog"] textarea';
    await RealKeys.pSendKeysOn(textareaSelector, [ RealKeys.combo(os.isMacOS() ? { meta: true } : { ctrl: true }, 'A') ]);
    await RealClipboard.pCopy(textareaSelector);
    TinyUiActions.cancelDialog(editor);

    await RealClipboard.pPaste('iframe => body');
    await pAssertInputEvents(browser.isSafari() ? '&lt;p&gt;abc&lt;/p&gt;' : '', true);
    TinyAssertions.assertContent(editor, '<p>&lt;p&gt;abc&lt;/p&gt;abc</p>');
  });

  it('TINY-9829: Paste can be cancelled by beforeinput event', async () => {
    const editor = hook.editor();
    const cancelInputEvent = (e: EditorEvent<InputEvent>) => {
      e.preventDefault();
    };
    const inputEvent = Singleton.value<EditorEvent<InputEvent>>();
    const setInputEvent = (e: EditorEvent<InputEvent>) => inputEvent.set(e);

    editor.on('beforeinput', cancelInputEvent);
    editor.on('input', setInputEvent);

    const initialContent = '<p>abc</p>\n<p>def</p>';
    editor.setContent(initialContent);

    await pCopyAndPaste(
      editor,
      { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 'abc'.length },
      { startPath: [ 1, 0 ], soffset: 'd'.length, finishPath: [ 1, 0 ], foffset: 'def'.length }
    );
    await PasteEventUtils.pWaitForAndAssertEventsDoNotFire([ inputEvent ]);
    TinyAssertions.assertContent(editor, initialContent);

    editor.off('beforeinput', cancelInputEvent);
    editor.off('input', setInputEvent);
  });

  context('TINY-10139', () => {
    it('TINY-10139: copy an element inside a custom block insert a new line and then paste it should not create a new custom block', async () => {
      const editor = hook.editor();
      const initialContent = '<custom-block><p>to copy</p></custom-block>';
      editor.setContent(initialContent);

      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'to copy'.length);
      await RealClipboard.pCopy('iframe => body');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 'to copy'.length);
      InsertNewLine.insert(editor);
      await RealClipboard.pPaste('iframe => body');
      TinyAssertions.assertContent(editor, '<custom-block>\n<p>to copy</p>\n<p>to copy</p>\n</custom-block>');
    });
  });
});
