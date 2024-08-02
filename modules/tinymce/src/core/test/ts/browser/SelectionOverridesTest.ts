import { Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Scroll, SugarElement, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { isCaretContainerBlock } from 'tinymce/core/caret/CaretContainer';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.SelectionOverridesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    content_style: 'body { margin: 16px; }',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const getScrollTop = (editor: Editor) => Scroll.get(TinyDom.document(editor)).top;

  const assertSelectionIsCaretBlock = (editor: Editor, caretValue: 'before' | 'after') => {
    const selectedNode = editor.selection.getNode();
    assert.isTrue(isCaretContainerBlock(selectedNode), 'Selected node should be a fake caret node');
    assert.equal(selectedNode.getAttribute('data-mce-caret'), caretValue);
  };

  const selectBesideContentEditable = (editor: Editor, contentEditableElm: HTMLElement, clickPoint: 'before' | 'after', offset: number) => {
    editor.selection.scrollIntoView(contentEditableElm);

    const scrollTop = getScrollTop(editor);
    const rect = contentEditableElm.getBoundingClientRect();
    const clientX = clickPoint === 'before' ? rect.left - offset : rect.right + offset;
    const clientY = rect.top + (rect.height / 2);

    const target = Traverse.parentElement(SugarElement.fromDom(contentEditableElm)).getOrThunk(() => TinyDom.documentElement(editor));
    Mouse.point('mousedown', 0, target, clientX, clientY);
    // Check the scroll position has not changed
    assert.equal(getScrollTop(editor), scrollTop);
    // Check fake caret has been added
    assertSelectionIsCaretBlock(editor, clickPoint);
  };

  it('click on link in cE=false', () => {
    const editor = hook.editor();
    editor.setContent('<p contentEditable="false"><a href="#"><strong>link</strong></a></p>');
    const evt = editor.dispatch('click', { target: editor.dom.select('strong')[0] } as any);

    assert.equal(evt.isDefaultPrevented(), true);
  });

  it('TINY-9470: click on link in cE=false editor root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<p><a href="#"><strong>link</strong></a></p>');
      const evt = editor.dispatch('click', { target: editor.dom.select('strong')[0] } as any);

      assert.equal(evt.isDefaultPrevented(), true);
    });
  });

  it('click in non-empty cell next to cell with cE=false block', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="width: 100%">' +
      '<tr>' +
      '<td style="vertical-align: top">1</td>' +
      '<td><div contentEditable="false" style="width: 100px; height: 100px">2</div></td>' +
      '</tr>' +
      '</table>'
    );

    const firstTd = editor.dom.select('td')[0];
    const rect = firstTd.getBoundingClientRect();
    Mouse.mouseDown(SugarElement.fromDom(firstTd), { dx: 10, dy: rect.height / 2 });

    const selectedNode = editor.selection.getNode();
    assert.isFalse(isCaretContainerBlock(selectedNode));
  });

  it('TINY-7736: click in empty cell next to cell with cE=false block', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="width: 100%">' +
      '<tr><th>Header 1</th><th>Header 2</th></tr>' +
      '<tr>' +
      '<td><div contentEditable="false" style="height: 100px">1</div><p>&nbsp;</p></td>' +
      '<td>&nbsp;</td>' +
      '</tr>' +
      '</table>'
    );

    const secondTd = editor.dom.select('td')[1];
    const rect = secondTd.getBoundingClientRect();
    Mouse.mouseDown(SugarElement.fromDom(secondTd), { dx: 10, dy: rect.height / 2 });

    const selectedNode = editor.selection.getNode();
    assert.isFalse(isCaretContainerBlock(selectedNode));
  });

  it('TINY-7736: click next to cE=false block in table cell', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="width: 100%">' +
      '<tr>' +
      '<td><p>&nbsp;</p><div contentEditable="false" style="width: 100px; height: 100px">2</div><p>&nbsp;</p></td>' +
      '</tr>' +
      '</table>'
    );

    const noneditableDiv = editor.dom.select('div')[0];
    selectBesideContentEditable(editor, noneditableDiv, 'before', 2);
  });

  it('offscreen copy of cE=false block remains offscreen', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table contenteditable="false" style="width: 100%; table-layout: fixed">' +
        '<tbody><tr><td>1</td><td>2</td></tr></tbody>' +
        '</table>'
    );

    editor.selection.select(editor.dom.select('table')[0]);
    const offscreenSelection = editor.dom.select('.mce-offscreen-selection')[0];

    assert.ok(offscreenSelection.offsetLeft !== undefined, `The offscreen selection's left border is undefined`);
    assert.isBelow(offscreenSelection.offsetLeft, 0, `The offscreen selection's left border is onscreen`);
    assert.isBelow(offscreenSelection.offsetWidth + offscreenSelection.offsetLeft, 0,
      'The cE=false offscreen selection is visible on-screen. Right edge: ' +
        offscreenSelection.offsetLeft + '+' + offscreenSelection.offsetWidth + '=' +
        (offscreenSelection.offsetLeft + offscreenSelection.offsetWidth) + 'px'
    );
  });

  it('TINY-6555: click on ce=false body should not show offscreen selection', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const body = editor.getBody();
      editor.setContent(
        '<table contenteditable="true" style="width: 100%; table-layout: fixed">' +
        '<tbody><tr><td>1</td><td>2</td></tr></tbody>' +
        '</table>'
      );

      const rect = editor.dom.getRect(body);
      editor.dispatch('mousedown', {
        target: body as EventTarget,
        clientX: rect.x,
        clientY: rect.y
      } as MouseEvent);

      const offscreenElements = editor.dom.select('.mce-offscreen-selection');
      assert.lengthOf(offscreenElements, 0, 'No offscreen element shown');
    });
  });

  it('set range after ce=false element but lean backwards', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">1</p><p contenteditable="false">2</p>');

    const rng = document.createRange();
    rng.setStartBefore(editor.dom.select('p[contenteditable=false]')[1]);
    rng.setEndBefore(editor.dom.select('p[contenteditable=false]')[1]);

    editor.selection.setRng(rng, false);
    assert.equal(editor.selection.getNode().getAttribute('data-mce-caret'), 'after');
  });

  it('set range after ce=false element but lean backwards 2', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">Noneditable1</span><span contenteditable="false">Noneditable2</span></p>', { format: 'raw' });

    const rng = document.createRange();
    const firstSpan = editor.dom.select('span[contenteditable=false]')[0];
    const secondSpan = editor.dom.select('span[contenteditable=false]')[1];
    const p = secondSpan.parentNode as HTMLParagraphElement;
    if (firstSpan.previousSibling) {
      p.removeChild(firstSpan.previousSibling);
    }
    p.appendChild(document.createTextNode(Zwsp.ZWSP));

    rng.setEnd(secondSpan.nextSibling as Text, 1);
    rng.setStartBefore(firstSpan);

    editor.selection.setRng(rng, false);
    const newRng = editor.selection.getRng();

    // We want to ensure the selection hasn't jumped to any one of the cef spans, with offset to the left and right of it
    const passCondition = !(newRng.startContainer === newRng.endContainer && (newRng.startOffset + 1) === newRng.endOffset);
    assert.equal(passCondition, true);
  });

  it('set range after ce=false element but lean forwards', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">1</p><p contenteditable="false">2</p>');

    const rng = document.createRange();
    rng.setStartBefore(editor.dom.select('p[contenteditable=false]')[1]);
    rng.setEndBefore(editor.dom.select('p[contenteditable=false]')[1]);

    editor.selection.setRng(rng, true);
    assert.equal(editor.selection.getNode().getAttribute('data-mce-caret'), 'before');
  });

  it('showCaret at TD', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td contenteditable="false">x</td></tr></table>');
    const rng = editor._selectionOverrides.showCaret(1, editor.dom.select('td')[0], true);
    assert.isNull(rng, 'Should be null since TD is not a valid caret target');
  });

  it('showCaret at TH', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><th contenteditable="false">x</th></tr></table>');
    const rng = editor._selectionOverrides.showCaret(1, editor.dom.select('th')[0], true);
    assert.isNull(rng, 'Should be null since TH is not a valid caret target');
  });

  it('showCaret block on specific element', () => {
    const editor = hook.editor();
    let rng;

    editor.on('ShowCaret', (e) => {
      if (e.target.getAttribute('data-no-cef') === 'true') {
        e.preventDefault();
      }
    });

    editor.setContent('<p contenteditable="false">a</p><p contenteditable="false" data-no-cef="true">b</p>');

    rng = editor._selectionOverrides.showCaret(1, editor.dom.select('p[contenteditable=false]')[0], true);
    assert.isNotNull(rng, 'Should return a range');
    editor._selectionOverrides.hideFakeCaret();

    rng = editor._selectionOverrides.showCaret(1, editor.dom.select('p[contenteditable=false]')[1], false);
    assert.isNull(rng, 'Should not return a range excluded by ShowCaret event');
    editor._selectionOverrides.hideFakeCaret();
  });

  it('showBlockCaretContainer before ce=false element', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p>');
    const para = editor.dom.select('p[contenteditable=false]')[0];

    // Place the selection at the end of the ce=false element
    const rng = editor.dom.createRng();
    rng.setStartBefore(para);
    rng.setEndBefore(para);
    editor.selection.setRng(rng);

    const caretContainer = editor.dom.select('p[data-mce-caret=before]')[0];
    editor._selectionOverrides.showBlockCaretContainer(caretContainer);

    assert.isFalse(caretContainer.hasAttribute('data-mce-bogus'), 'Bogus attribute should have been removed');
    assert.isFalse(caretContainer.hasAttribute('data-mce-caret'), 'Caret attribute should have been removed');
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p contenteditable="false">a</p>');
  });

  it('showBlockCaretContainer after ce=false element', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p>');
    const para = editor.dom.select('p[contenteditable=false]')[0];

    // Place the selection at the end of the ce=false element
    const rng = editor.dom.createRng();
    rng.setStartAfter(para);
    rng.setEndAfter(para);
    editor.selection.setRng(rng);

    const caretContainer = editor.dom.select('p[data-mce-caret=after]')[0];
    editor._selectionOverrides.showBlockCaretContainer(caretContainer);

    assert.isFalse(caretContainer.hasAttribute('data-mce-bogus'), 'Bogus attribute should have been removed');
    assert.isFalse(caretContainer.hasAttribute('data-mce-caret'), 'Caret attribute should have been removed');
    TinyAssertions.assertContent(editor, '<p contenteditable="false">a</p><p>\u00a0</p>');
  });

  it('set range in short ended element', () => {
    const editor = hook.editor();
    Arr.each([ 'br', 'img', 'input' ], (elmName) => {
      editor.setContent('<p><' + elmName + '/></p>');
      const paraElem = editor.dom.select('p')[0];
      const elem = editor.dom.select(elmName)[0];

      const rng = document.createRange();
      rng.setStart(elem, 0);
      rng.setEnd(elem, 0);
      editor.selection.setRng(rng);

      const newRng = editor.selection.getRng();
      assert.equal(newRng.startContainer, paraElem, `Start container should be before ${elmName}`);
      assert.equal(newRng.startOffset, 0, `Start offset should be before ${elmName}`);
      assert.equal(newRng.endContainer, paraElem, `End container should be before ${elmName}`);
      assert.equal(newRng.endOffset, 0, `End offset should be before ${elmName}`);
    });
  });

  it('TINY-7062: place cursor in ce=true element, click to left of ce=false parent element', () => {
    const editor = hook.editor();
    const content = '<p style="padding-bottom: 2000px;">Normal paragraph with padding</p><div contenteditable="false"><p contenteditable="true">abc</p></div>';

    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 1);
    // Click to the left of the ce=false element
    const noneditableDiv = editor.dom.select('div[contenteditable=false]')[0];
    // The default body margin is 16 so divide by 2 for the offset to get 8
    selectBesideContentEditable(editor, noneditableDiv, 'before', 8);

    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-7062: place cursor in ce=true element, click to right of ce=false parent element', () => {
    const editor = hook.editor();
    const content = '<p style="padding-bottom: 2000px;">Normal paragraph with padding</p><div contenteditable="false"><p contenteditable="true">abc</p></div>';

    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 1);

    // Click to the right of the ce=false element
    const noneditableDiv = editor.dom.select('div[contenteditable=false]')[0];
    // The default body margin is 16 so divide by 2 for the offset to get 8
    selectBesideContentEditable(editor, noneditableDiv, 'after', 8);

    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-9194: set the caret after ce=false inline element and zwnbsp but lean backwards into zwnbsp', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">CEF</span></p>');
    TinySelections.setCursor(editor, [ 0 ], 2);
    // actual content <p><span contenteditable="false">a</span>&#xFEFF;</p>
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    TinySelections.setCursor(editor, [ 0 ], 2);
    // actual content <p><span contenteditable="false">a</span>&#xFEFF;</p>
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
  });
});
