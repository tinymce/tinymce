import { ApproxStructure, UiFinder, Waiter, Keys, RealKeys } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Css, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import CodeSamplePlugin from 'tinymce/plugins/codesample/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import MediaPlugin from 'tinymce/plugins/media/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.core.SelectionEnabledDeleteContentTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'table image codesample media code',
    statusbar: false,
  }, [ CodeSamplePlugin, ImagePlugin, MediaPlugin, TablePlugin ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const assertFakeSelection = (editor: Editor, expectedState: boolean) => {
    assert.equal(editor.selection.getNode().hasAttribute('data-mce-selected'), expectedState, 'Selected element should have expected state');
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

  it('TINY-10981: Deleting text should not be permitted', async () => {
    const editor = hook.editor();
    editor.setContent('<p>test</p>');

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, '<p>tes</p>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, '<p>tes</p>');

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, '<p>te</p>');
  });

  context('Deleting block elements', () => {
    it('TINY-10981: Deleting media element should not be permitted', async () => {
      const editor = hook.editor();
      editor.setContent(`<span class="mce-preview-object mce-object-iframe" contenteditable="false" data-mce-object="iframe" data-mce-p-allowfullscreen="allowfullscreen" data-mce-p-src="https://www.youtube.com/embed/8aGhZQkoFbQ">`
      + `<iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" frameborder="0" allowfullscreen="allowfullscreen" data-mce-src="https://www.youtube.com/embed/8aGhZQkoFbQ"></iframe><span class="mce-shim"></span></span>`);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'span.mce-preview-object', []);
      assertFakeSelection(editor, true);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertContent(editor, '<p><iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>');

      setMode(editor, 'design');
      TinySelections.select(editor, 'span.mce-preview-object', []);
      assertFakeSelection(editor, true);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertContent(editor, '');
    });

    it('TINY-10981: Deleting mediaembed element should not be permitted', async () => {
      const editor = hook.editor();
      editor.setContent(iframeMediaEmbedHtml);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
      assertFakeSelection(editor, true);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertContent(editor, iframeMediaEmbedHtml);

      setMode(editor, 'design');
      TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
      assertFakeSelection(editor, true);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertContent(editor, '');
    });

    it('TINY-10981: Deleting pre block should not be permitted', async () => {
      const editor = hook.editor();
      editor.setContent(preCodeSampleHtml);

      setMode(editor, 'readonly');
      TinySelections.select(editor, 'pre', []);
      assertFakeSelection(editor, true);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertContent(editor, preCodeSampleHtml);

      setMode(editor, 'design');
      TinySelections.select(editor, 'pre', []);
      assertFakeSelection(editor, true);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertContent(editor, '');
    });

  });

  it('TINY-10981: Deleting div element (tableofcontents) block should not be permitted', async () => {
    const editor = hook.editor();
    editor.setContent(tableOfContentHtml);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'div', []);
    assertFakeSelection(editor, true);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, [ '<div class="mce-toc" contenteditable="false">',
      '<h2 contenteditable="true">Table of Contents</h2>',
      '<ul>',
      '<li><a href="#mcetoc_">Heading</a></li>',
      '</ul>',
      '</div>' ].join('\n'));

    setMode(editor, 'design');
    TinySelections.select(editor, 'div', []);
    assertFakeSelection(editor, true);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-10981: Deleting table content should not be permitted in selectionEnabled mode', async () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);

    const expectedContent = [
      '<table style="width: 100%;">',
      '<tbody>',
      '<tr>',
      '<td>&nbsp;</td>',
      '<td>2</td>',
      '</tr>',
      '<tr>',
      '<td>3</td>',
      '<td>4</td>',
      '</tr>',
      '</tbody>',
      '</table>'
    ].join('\n');
    TinyAssertions.assertContent(editor, expectedContent);

    setMode(editor, 'readonly');
    TinySelections.setSelection(editor, [ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 1);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, expectedContent);

    setMode(editor, 'design');
    TinySelections.setSelection(editor, [ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 1);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, [ '<table style="width: 100%;">',
      '<tbody>',
      '<tr>',
      '<td>&nbsp;</td>',
      '<td>&nbsp;</td>',
      '</tr>',
      '<tr>',
      '<td>3</td>',
      '<td>4</td>',
      '</tr>',
      '</tbody>',
      '</table>' ].join('\n'));
  });

  it('TINY-10981: Deleting table element should not be permitted in cusorEnabled mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(tableHtml);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'table', []);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, [ '<table style="width: 100%;">',
      '<tbody>',
      '<tr>',
      '<td>1</td>',
      '<td>2</td>',
      '</tr>',
      '<tr>',
      '<td>3</td>',
      '<td>4</td>',
      '</tr>',
      '</tbody>',
      '</table>' ].join('\n'));

    setMode(editor, 'design');
    TinySelections.select(editor, 'table', []);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-10981: Deleting image element should not be permitted in selectionEnabled mode', async () => {
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
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="600" height="400"></p>');
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'img', []);
    assertFakeSelection(editor, true);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    TinyAssertions.assertContent(editor, '');
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
});
