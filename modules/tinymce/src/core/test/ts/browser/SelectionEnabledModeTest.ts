import { ApproxStructure, Mouse, UiFinder, Clipboard, Waiter, Keys } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { Attribute, Css, SelectorExists, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import AccordionPlugin from 'tinymce/plugins/accordion/Plugin';
import AdvancedListPlugin from 'tinymce/plugins/advlist/Plugin';
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';
import CodeSamplePlugin from 'tinymce/plugins/codesample/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ListPlugin from 'tinymce/plugins/lists/Plugin';
import MediaPlugin from 'tinymce/plugins/media/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.core.SelectionEnabledModeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'autolink table image codesample media code lists accordion advlist',
    indent: false,
    statusbar: false,
  },
  [
    AccordionPlugin,
    AdvancedListPlugin,
    AutoLinkPlugin,
    CodeSamplePlugin,
    ImagePlugin,
    MediaPlugin,
    TablePlugin,
    ListPlugin
  ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const assertFakeSelection = (editor: Editor, expectedState: boolean) => {
    assert.equal(editor.selection.getNode().hasAttribute('data-mce-selected'), expectedState, 'Selected element should have expected state');
  };

  const assertResizeBars = (editor: Editor, expectedState: boolean) => {
    SelectorFind.descendant(Traverse.documentElement(TinyDom.document(editor)), '.ephox-snooker-resizer-bar').fold(
      () => {
        assert.isFalse(expectedState, 'Was expecting to find resize bars');
      },
      (bar) => {
        const actualDisplay = Css.get(bar, 'display');
        const expectedDisplay = expectedState ? 'block' : 'none';
        assert.equal(actualDisplay, expectedDisplay, 'Should be expected display state on resize bar');
      }
    );
  };

  const mouseOverTable = (editor: Editor) => {
    const table = UiFinder.findIn(TinyDom.body(editor), 'table').getOrDie();
    Mouse.mouseOver(table);
  };

  const pAssertOutlineStyle = async (elm: SugarElement<Element>, expectedOutlineStyle: { color: string; width: string; style: string }) => {
    const getOutline = (elm: SugarElement<Element>) => {
      const color = Css.get(elm, 'outline-color');
      const width = Css.get(elm, 'outline-width');
      const style = Css.get(elm, 'outline-style');
      return {
        color,
        width,
        style
      };
    };
    await Waiter.pTryUntil('Should have correct styling', () => {
      assert.deepEqual(getOutline(elm), expectedOutlineStyle);
    });
  };

  const pAssertResizeHandle = async (editor: Editor) => {
    await Waiter.pTryUntil('Wait for resizehandle to show', () => assert.isTrue(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Should not give the handles at init'));
  };

  const pAssertNoResizeHandle = async (editor: Editor) => {
    await Waiter.pTryUntil('Wait for resizehandle to not show', () => assert.isFalse(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Should not give the handles at init'));
  };

  const imageSelectedOutline = {
    color: 'rgb(180, 215, 255)', // #b4d7ff
    width: '3px',
    style: 'solid'
  };

  const tableHtml = `<table style="width: 100%;">
    <tbody>
      <tr>
        <td>1</td>
        <td>2</td>
      </tr>
      <tr>
        <td>3</td>
        <td>4</td>
      </tr>
    </tbody>
    </table>`;
  const preCodeSampleHtml = `<pre class="language-javascript"><code>console.log("test");</code></pre>`;
  const tableOfContentHtml = `<div class="mce-toc" contenteditable="false">
      <h2 contenteditable="true">Table of Contents</h2>
      <ul>
      <li><a href="#mcetoc_">Heading</a></li>
      </ul>
      </div>`;
  const mediaElementHtml = `<span class="mce-preview-object mce-object-iframe" contenteditable="false" data-mce-object="iframe" data-mce-p-allowfullscreen="allowfullscreen" data-mce-p-src="https://www.youtube.com/embed/8aGhZQkoFbQ">`
      + `<iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" frameborder="0" allowfullscreen="allowfullscreen" data-mce-src="https://www.youtube.com/embed/8aGhZQkoFbQ"></iframe><span class="mce-shim"></span></span>`;
  const iframeMediaEmbedHtml = `<div style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.25%; max-width: 650px;" contenteditable="false" data-ephox-embed-iri="https://www.youtube.com/watch?v=8aGhZQkoFbQ">` +
  `<iframe style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" src="https://www.youtube.com/embed/8aGhZQkoFbQ?rel=0" scrolling="no" allowfullscreen="allowfullscreen"></iframe>` +
  `</div>`;

  const copy = (editor: Editor, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    TinySelections.setSelection(editor, spath, soffset, fpath, foffset);
    Clipboard.copy(TinyDom.body(editor));
  };

  const paste = (editor: Editor, pasteData: Record<string, string>, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    TinySelections.setSelection(editor, spath, soffset, fpath, foffset);
    editor.undoManager.add(); // Undo level would not always be properly created in some situations, so we create it manually to prevent tests from failing when they shouldn't.
    pasteDataTransferEvent(editor, pasteData);
  };

  const pasteDataTransferEvent = (editor: Editor, data: Record<string, string>) =>
    Clipboard.pasteItems(TinyDom.body(editor), data);

  context('Selection and blocks selection', () => {
    it('TINY-10981: Allow selection of contenteditable="false" elements in selectionEnabled mode', () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent('<div contenteditable="false">CEF</div>');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, true);
    });

    it('TINY-10981: Allow selection of image elements in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent('<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="600" height="400">');
      await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
      TinySelections.select(editor, 'img', []);
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0 ], 0);
      TinySelections.select(editor, 'img', []);
      // Dispatching nodeChanged to update the selection
      editor.nodeChanged();
      assertFakeSelection(editor, true);
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      TinySelections.select(editor, 'img', []);
      assertFakeSelection(editor, true);
    });

    it('TINY-10981: Allow selection of image elements in selectionEnabled mode but resizing is prohibited', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent('<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="600" height="400">');
      await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
      TinySelections.select(editor, 'img', []);
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);
      await pAssertResizeHandle(editor);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0 ], 0);
      TinySelections.select(editor, 'img', []);
      editor.nodeChanged();
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);
      await pAssertNoResizeHandle(editor);

      setMode(editor, 'design');
      TinySelections.select(editor, 'img', []);
      assertFakeSelection(editor, true);
      await Waiter.pTryUntil('Wait for resizehandle to show', () => assert.isTrue(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Should not give the handles at init'));
    });

    it('TINY-10981: Allow selection of figure elements in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent('<figure class="image"><img src="https://www.google.com/logos/google.jpg"><figcaption>Image caption</figcaption></figure>');
      await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
      TinySelections.select(editor, 'figure', []);
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'figure').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0 ], 0);
      TinySelections.select(editor, 'figure', []);
      // Dispatching nodeChanged to update the selection
      editor.nodeChanged();
      assertFakeSelection(editor, true);
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'figure').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      TinySelections.select(editor, 'figure', []);
      assertFakeSelection(editor, true);
    });

    it('TINY-10981: Allow selection of pre elements (codesample) in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent(preCodeSampleHtml);
      TinySelections.select(editor, 'pre', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'pre', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      TinySelections.select(editor, 'pre', []);
      assertFakeSelection(editor, true);
    });

    it('TINY-10981: Allow selection of div element (tableofcontents) in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent(tableOfContentHtml);
      TinySelections.select(editor, 'div', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'div', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      TinySelections.select(editor, 'div', []);
      assertFakeSelection(editor, true);
    });

    it('TINY-10981: Allow selection of media element in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent(mediaElementHtml);
      TinySelections.select(editor, 'span.mce-preview-object', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'span.mce-preview-object', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      TinySelections.select(editor, 'span.mce-preview-object', []);
      assertFakeSelection(editor, true);
    });

    it('TINY-10981: Allow selection of mediaembed element in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent(iframeMediaEmbedHtml);
      TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
      assertFakeSelection(editor, true);
    });

    it('TINY-10981: Table resize should not be shown in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent(tableHtml);
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
      await pAssertResizeHandle(editor);

      setMode(editor, 'readonly');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
      await pAssertNoResizeHandle(editor);

      setMode(editor, 'design');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
      await pAssertResizeHandle(editor);
    });

    it('TINY-10981: Resize bars for tables should be hidden while in readonly mode', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      mouseOverTable(editor);
      assertResizeBars(editor, false);
      mouseOverTable(editor);
      assertResizeBars(editor, false);

      setMode(editor, 'design');
      mouseOverTable(editor);
      assertResizeBars(editor, true);
    });

    it('TINY-10981: Pressing tab at the last cell should not create new row', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr></tbody></table>');

      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.tab());
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>&nbsp;</td></tr></tbody></table>');

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.tab());
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>&nbsp;</td></tr></tbody></table>');

      setMode(editor, 'design');
      TinyContentActions.keystroke(editor, Keys.tab());
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></tbody></table>');
    });

    it('TINY-10981: Pressing tab/shift+tab on list item should not indent list item', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li>a</li><li>b</li><li>c</li></ul>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.tab());
      TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.tab());
      TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');

      TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });
      TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');

      setMode(editor, 'design');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.tab());
      TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>');
    });

    it('TINY-10981: Toggling accordion should be permitted', () => {
      const editor = hook.editor();
      editor.setContent(`<details class="mce-accordion"><summary>Accordion summary...</summary><p>Accordion Body</p></details>`);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      TinyContentActions.keystroke(editor, Keys.enter());
      TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      TinyContentActions.keystroke(editor, Keys.enter());
      TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 0 });
      TinyContentActions.keystroke(editor, Keys.enter());
      TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });

      setMode(editor, 'design');
    });

    it('TINY-10981: Toggling accordion should be permitted with execCommand', () => {
      const editor = hook.editor();
      editor.setContent(`<details class="mce-accordion"><summary>Accordion summary...</summary><p>Accordion Body</p></details>`);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      editor.execCommand('ToggleAccordion', false, true);
      TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      editor.execCommand('ToggleAccordion', false, false);
      TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 0 });
      editor.execCommand('ToggleAccordion', false, true);
      TinyAssertions.assertContentPresence(editor, { 'details[open="open"]': 1 });

      setMode(editor, 'design');
    });

    it('TINY-10981: Executing RemoveAccordion should not permitted when in selectionEnabled mode', () => {
      const editor = hook.editor();
      editor.setContent(`<details class="mce-accordion"><summary>Accordion summary...</summary><p>Accordion Body</p></details><details class="mce-accordion"><summary>Accordion summary...</summary><p>Accordion Body</p></details>`);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      editor.execCommand('RemoveAccordion');
      TinyAssertions.assertContent(editor, '<details class="mce-accordion"><summary>Accordion summary...</summary><p>Accordion Body</p></details>');

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      editor.execCommand('RemoveAccordion');
      TinyAssertions.assertContent(editor, '<details class="mce-accordion"><summary>Accordion summary...</summary><p>Accordion Body</p></details>');

      setMode(editor, 'design');
    });

    it('TINY-10981: Coverting paragraph to link with autolink should not be permitted', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>https://google.com</p>`);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0 ], 'https://google.com'.length);
      TinyContentActions.keystroke(editor, Keys.enter());
      await Waiter.pTryUntil('Wait for content to change', () => TinyAssertions.assertContent(editor, '<p>https://google.com</p>'));

      setMode(editor, 'design');
      TinySelections.setCursor(editor, [ 0, 0 ], 'https://google.com'.length);
      TinyContentActions.keystroke(editor, Keys.enter());
      await Waiter.pTryUntil('Wait for content to change', () => TinyAssertions.assertContent(editor, '<p><a href="https://google.com">https://google.com</a></p><p>&nbsp;</p>'));
    });

    it('TINY-10981: mceListUpdate command should not be permitted in selectionEnabled mode', () => {
      const editor = hook.editor();
      editor.setContent(`<ol><li>test</li></ol><ol><li>test2</li></ol>`);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: false }});
      TinyAssertions.assertContent(editor, '<ol contenteditable="false"><li>test</li></ol><ol><li>test2</li></ol>');

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 4);
      editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: false }});
      TinyAssertions.assertContent(editor, '<ol contenteditable="false"><li>test</li></ol><ol><li>test2</li></ol>');

      setMode(editor, 'design');
    });

    it('TINY-10981: RemoveList command should not be permitted in selectionEnabled mode', () => {
      const editor = hook.editor();
      editor.setContent(`<ol><li>test</li></ol><ol><li>test2</li></ol>`);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      editor.execCommand('RemoveList');
      TinyAssertions.assertContent(editor, '<p>test</p><ol><li>test2</li></ol>');

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 4);
      editor.execCommand('RemoveList');
      TinyAssertions.assertContent(editor, '<p>test</p><ol><li>test2</li></ol>');

      setMode(editor, 'design');
    });
  });

  it('TINY-10981: Allow cursor to be placed into the editor', () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<p>test test</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);
  });

  it('TINY-10981: Allow expanding text selection', () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<p>hello there</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);

    setMode(editor, 'readonly');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);

    setMode(editor, 'design');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
  });

  it('TINY-10981: Keydown events should be blocked when the cursor is in the editor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>hello there</p>');

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    editor.insertContent('A');
    editor.dispatch('input');
    await Waiter.pWait(50);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    editor.insertContent('A');
    editor.dispatch('input');
    await Waiter.pWait(50);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    editor.insertContent('A');
    editor.dispatch('input');
    await Waiter.pWait(50);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 6);
    TinyAssertions.assertContent(editor, '<p>helloAA there</p>');
  });

  it('TINY-10981: Pasting should be blocked when the cursor is in the editor', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<p>test</p>');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 4, [ 0, 0 ], 4);
    TinyAssertions.assertContent(editor, '<p>testX</p>');

    setMode(editor, 'readonly');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 5, [ 0, 0 ], 5);
    TinyAssertions.assertContent(editor, '<p>testX</p>');

    setMode(editor, 'design');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 5, [ 0, 0 ], 5);
    TinyAssertions.assertContent(editor, '<p>testXX</p>');
  });

  it('TINY-10981: Copying should be permitted when the cursor is in the editor', async () => {
    const editor = hook.editor();
    const assertClipboardData = (expectedHtml: string, expectedText: string) => {
      assert.isTrue(dataTransfer.isSet(), 'dataTransfer should be set');
      dataTransfer.on((transfer) => {
        assert.equal(transfer.getData('text/html'), expectedHtml, 'text/html data should match');
        assert.equal(transfer.getData('text/plain'), expectedText, 'text/plain data should match');
      });
    };

    const dataTransfer = Singleton.value<DataTransfer>();
    const copyHandler = (e: EditorEvent<ClipboardEvent>) => {
      if (e.clipboardData) {
        dataTransfer.set(e.clipboardData);
      }
    };
    editor.on('copy', copyHandler);

    editor.setContent('<p>test</p>');
    setMode(editor, 'readonly');
    copy(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    assertClipboardData('<!-- x-tinymce/html -->test', 'test');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 4, [ 0, 0 ], 4);
    TinyAssertions.assertContent(editor, '<p>test</p>');
    editor.off('copy', copyHandler);
    setMode(editor, 'design');
  });

  it('TINY-10981: Setting caret before cef in editor while in readonly mode should render fake caret', () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<div contenteditable="false">CEF</div>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [], 0);
    const expectedStructure = ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              'data-mce-caret': str.is('before'),
              'data-mce-bogus': str.is('all')
            },
            children: [
              s.element('br', {})
            ]
          }),
          s.element('div', {
            attrs: {
              contenteditable: str.is('false')
            },
            children: [
              s.text(str.is('CEF'))
            ]
          }),
          s.element('div', {
            attrs: {
              'data-mce-bogus': str.is('all')
            },
            classes: [ arr.has('mce-visual-caret'), arr.has('mce-visual-caret-before') ]
          })
        ]
      });
    });
    TinyAssertions.assertContentStructure(editor, expectedStructure);

    setMode(editor, 'design');
    TinyAssertions.assertContentStructure(editor, expectedStructure);
  });

  context('Moving cursor', () => {
    const assertRangeInCaretContainerBlock = (editor: Editor) =>
      assert.isTrue(CaretContainer.isRangeInCaretContainerBlock(editor.selection.getRng()));

    afterEach(() => setMode(hook.editor(), 'design'));

    it('TINY-10981: Moving cursor around pre elements (codesample) block', () => {
      const editor = hook.editor();
      editor.setContent(`<p>test</p>${preCodeSampleHtml}`);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);

      TinyContentActions.keystroke(editor, Keys.right());
      assertFakeSelection(editor, true);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);
    });

    it('TINY-10981: Moving cursor around div element (tableofcontents) block', () => {
      const editor = hook.editor();
      editor.setContent(`<p>test</p>${tableOfContentHtml}`);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);

      TinyContentActions.keystroke(editor, Keys.right());
      assertFakeSelection(editor, true);

      TinyContentActions.keystroke(editor, Keys.right());
      assertRangeInCaretContainerBlock(editor);
    });

    it('TINY-10981: Moving cursor around media element block', () => {
      const editor = hook.editor();
      editor.setContent(`<p>test</p>${mediaElementHtml}`);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);

      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);

      TinyContentActions.keystroke(editor, Keys.right());
      assertFakeSelection(editor, true);

      TinyContentActions.keystroke(editor, Keys.right());
      TinyAssertions.assertCursor(editor, [ 1, 1 ], 1);
    });
  });

  context('contenteditable attribute editor body', () => {
    it('TINY-10981: Checking content editable attribute of editor body', () => {
      const editor = hook.editor();
      const body = TinyDom.body(editor);
      assert.equal(Attribute.get(body, 'contenteditable'), 'true');
      setMode(editor, 'readonly');
      assert.equal(Attribute.get(body, 'contenteditable'), 'true');
      setMode(editor, 'design');
      assert.equal(Attribute.get(body, 'contenteditable'), 'true');
    });
  });
});
