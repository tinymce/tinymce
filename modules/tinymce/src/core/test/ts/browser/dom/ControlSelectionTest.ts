import { Assertions, FocusTools, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Cell, Obj, Strings } from '@ephox/katamari';
import { Attribute, Css, Hierarchy, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

describe('browser.tinymce.core.dom.ControlSelectionTest', () => {
  const imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAGUlEQVR4nGK5aLGTATdgwiM3gqUBAQAA//8ukgHZvWHlnwAAAABJRU5ErkJggg==';
  const eventCounter = Cell<Record<string, number>>({});
  const hook = TinyHooks.bddSetup<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body  { margin: 0 }',
    width: 800,
    table_sizing_mode: 'fixed',
    setup: (editor: Editor) => {
      editor.on('ObjectResizeStart ObjectResized', (e) => {
        const counter = eventCounter.get();
        counter[e.type] = (counter[e.type] || 0) + 1;
      });
    }
  }, [], true);

  const contextMenuClickInMiddleOf = (editor: Editor, elementPath: number[]) => {
    const element = Hierarchy.follow(TinyDom.body(editor), elementPath).getOrDie().dom as HTMLElement;
    const target = element as EventTarget;
    const rect = element.getBoundingClientRect();
    const clientX = (rect.left + rect.width / 2), clientY = (rect.top + rect.height / 2);
    editor.dispatch('mousedown', { target, clientX, clientY, button: 2 } as MouseEvent);
    editor.dispatch('mouseup', { target, clientX, clientY, button: 2 } as MouseEvent);
    editor.dispatch('contextmenu', { target, clientX, clientY, button: 2 } as PointerEvent);
  };

  const resetEventCounter = () => eventCounter.set({});

  const assertEventCount = (type: string, count: number) => {
    assert.equal(Obj.get(eventCounter.get(), type.toLowerCase()).getOr(0), count, `Check ${type} event count is ${count}`);
  };

  const pResizeAndAssertEventCount = async (editor: Editor, resizeSelector: string, delta: number, expectedCount: number) => {
    const handle = await UiFinder.pWaitForVisible('Wait for resize handlers to show', TinyDom.body(editor), resizeSelector);
    Mouse.mouseDown(handle);
    assertEventCount('ObjectResizeStart', expectedCount - 1);
    assertEventCount('ObjectResized', expectedCount - 1);
    Mouse.mouseMoveTo(handle, delta, delta);
    Mouse.mouseUp(handle);
    assertEventCount('ObjectResizeStart', expectedCount);
    assertEventCount('ObjectResized', expectedCount);
  };

  const assertElementDimension = (label: string, element: SugarElement<Element>, name: string, expectedDimension: number) => {
    const dimension = Css.getRaw(element, name).orThunk(() => Attribute.getOpt(element, name))
      .map((v) => parseInt(v, 10))
      .getOr(0);
    assert.approximately(dimension, expectedDimension, 3, `${label} ${dimension}px ~= ${expectedDimension}px`);
  };

  const getAndAssertDimensions = (element: SugarElement<Element>, width: number, height: number) => {
    assertElementDimension('Assert element width', element, 'width', width);
    assertElementDimension('Assert element height', element, 'height', height);
  };

  const pWaitForDragHandles = (container: SugarElement<Element>, resizeSelector: string) =>
    UiFinder.pWaitForVisible('Wait for resize handlers to show', container, resizeSelector);

  const pResizeAndAssertDimensions = async (editor: Editor, targetSelector: string, resizeSelector: string, deltaX: number, deltaY: number, width: number, height: number) => {
    const expectedWidth = Strings.endsWith(resizeSelector, 'sw') || Strings.endsWith(resizeSelector, 'nw') ? width - deltaX : width + deltaX;
    const expectedHeight = Strings.endsWith(resizeSelector, 'nw') || Strings.endsWith(resizeSelector, 'ne') ? height - deltaY : height + deltaY;

    const editorBody = TinyDom.body(editor);
    const resizeHandle = await UiFinder.pWaitForVisible('Wait for resize handlers to show', editorBody, resizeSelector);
    const target = UiFinder.findIn(editorBody, targetSelector).getOrDie();
    Mouse.mouseDown(resizeHandle);
    await Waiter.pWaitBetweenUserActions();
    const ghost = UiFinder.findIn(editorBody, '.mce-clonedresizable').getOrDie();
    getAndAssertDimensions(ghost, width, height);
    Mouse.mouseMoveTo(resizeHandle, deltaX, deltaY);
    getAndAssertDimensions(ghost, expectedWidth, expectedHeight);
    Mouse.mouseUp(resizeHandle);
    await Waiter.pWaitBetweenUserActions();
    getAndAssertDimensions(target, expectedWidth, expectedHeight);
  };

  const pAssertInitialGhostElement = async (editor: Editor, resizeSelector: string, assertGhostElem: (ghostElm: SugarElement<Element>) => void) => {
    const editorBody = TinyDom.body(editor);
    const resizeHandle = await UiFinder.pWaitForVisible('Wait for resize handlers to show', editorBody, resizeSelector);
    Mouse.mouseDown(resizeHandle);
    await Waiter.pWaitBetweenUserActions();
    const ghost = UiFinder.findIn(editorBody, '.mce-clonedresizable').getOrDie();
    assertGhostElem(ghost);
    Mouse.mouseUp(resizeHandle);
    await Waiter.pTryUntil('ghost element should be removed from DOM', () => {
      UiFinder.notExists(editorBody, '.mce-clonedresizable');
    });
  };

  beforeEach(() => resetEventCounter());

  it('TBA: Select image by context menu clicking on it', () => {
    const editor = hook.editor();
    editor.setContent(`<p><img src="${imgSrc}" width="100" height="100"></p>`);
    contextMenuClickInMiddleOf(editor, [ 0, 0 ]);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
  });

  it('TINY-4161: Resize events should not be called if the object isn\'t resized', async () => {
    const editor = hook.editor();
    const editorBody = TinyDom.body(editor);
    editor.setContent('<p><table><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>');
    TinySelections.select(editor, 'td', [ 0 ]);
    await UiFinder.pWaitForVisible('Wait for resize handlers to show', editorBody, '#mceResizeHandlese');
    Mouse.trueClickOn(editorBody, '#mceResizeHandlese');
    assertEventCount('ObjectResizeStart', 0);
    assertEventCount('ObjectResized', 0);
  });

  it('TINY-4161: Resize events should be called if the object is resized', async () => {
    const editor = hook.editor();
    editor.setContent('<p><table><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>');
    TinySelections.select(editor, 'td', [ 0 ]);
    await pResizeAndAssertEventCount(editor, '#mceResizeHandlese', 10, 1);
    await pResizeAndAssertEventCount(editor, '#mceResizeHandlese', 20, 2);
  });

  it('TINY-4161: Resize ghost element dimensions match target element when using fixed width', () => {
    const editor = hook.editor();
    editor.setContent('<p><table style="width: 600px; height: 100px"><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>');
    TinySelections.select(editor, 'td', [ 0 ]);
    return pResizeAndAssertDimensions(editor, 'table', '#mceResizeHandlesw', 10, 10, 600, 100);
  });

  it('TINY-4161: Resize ghost element dimensions match target element when using relative width', () => {
    const editor = hook.editor();
    editor.setContent('<p><table style="width: 100%; height: 50px"><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>');
    TinySelections.select(editor, 'td', [ 0 ]);
    return pResizeAndAssertDimensions(editor, 'table', '#mceResizeHandlese', -10, -10, 798, 50);
  });

  it('TINY-6229: Resize video element', () => {
    const editor = hook.editor();
    editor.setContent('<p><video controls width="300" height="150"></video></p>');
    TinySelections.select(editor, 'video', []);
    return pResizeAndAssertDimensions(editor, 'video', '#mceResizeHandlese', 300, 150, 300, 150);
  });

  it('TINY-6229: Resize video media element', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false" class="mce-preview-object mce-object-video"><video controls width="300" height="150"></video></span></p>');
    TinySelections.select(editor, 'span', []);
    return pResizeAndAssertDimensions(editor, 'video', '#mceResizeHandlese', -150, -75, 300, 150);
  });

  it('TINY-6229: Resize iframe media element', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false" class="mce-preview-object mce-object-iframe"><iframe style="border: 1px solid black" width="400" height="200" src="' + Env.transparentSrc + '" allowfullscreen></iframe></span></p>');
    TinySelections.select(editor, 'span', []);
    return pResizeAndAssertDimensions(editor, 'iframe', '#mceResizeHandlese', 100, 50, 402, 202);
  });

  it('TINY-6229: data-mce-selected attribute value retained when selecting the same element', async () => {
    const editor = hook.editor();
    const editorBody = TinyDom.body(editor);
    editor.setContent(
      '<p><span contenteditable="false" class="mce-preview-object mce-object-video"><video controls width="300" height="150"></video></span></p>' +
      '<p><span contenteditable="false" class="mce-preview-object mce-object-audio"><audio controls></audio></span></p>'
    );
    // Select to set the initial selected element in ControlSelection, change and then come back
    TinySelections.select(editor, 'span.mce-object-video', []);
    await pWaitForDragHandles(editorBody, '#mceResizeHandlenw');
    TinyAssertions.assertContentPresence(editor, {
      'span[data-mce-selected="1"] video': 1,
      'span[data-mce-selected] audio': 0
    });

    const audioPreviewSpan = editor.dom.select('span')[1];
    editor.dom.setAttrib(audioPreviewSpan, 'data-mce-selected', '3');
    TinySelections.select(editor, 'span.mce-object-audio', []);
    await Waiter.pTryUntil('Wait for resize handles to disappear', () => UiFinder.notExists(editorBody, '#mceResizeHandlenw'));
    TinyAssertions.assertContentPresence(editor, {
      'span[data-mce-selected] video': 0,
      'span[data-mce-selected="3"] audio': 1
    });

    const videoPreviewSpan = editor.dom.select('span')[0];
    editor.dom.setAttrib(videoPreviewSpan, 'data-mce-selected', '2');
    TinySelections.select(editor, 'span.mce-object-video', []);
    await pWaitForDragHandles(editorBody, '#mceResizeHandlenw');
    TinyAssertions.assertContentPresence(editor, {
      'span[data-mce-selected="2"] video': 1,
      'span[data-mce-selected] audio': 0
    });
  });

  it('TINY-7074: Resizing a media element should update both the root and wrapper element dimensions', async () => {
    const editor = hook.editor();
    editor.setContent(`<p><span contenteditable="false" class="mce-preview-object mce-object-iframe"><iframe style="border: 1px solid black; width: 400px; height: 200px" src="${Env.transparentSrc}"></iframe></span></p>`);
    TinySelections.select(editor, 'span', []);
    await pResizeAndAssertDimensions(editor, 'iframe', '#mceResizeHandlese', 100, 50, 402, 202);
    const wrapper = UiFinder.findIn(TinyDom.body(editor), 'span.mce-preview-object').getOrDie();
    getAndAssertDimensions(wrapper, 402 + 100, 202 + 50);
  });

  it('TINY-5947: data-mce-selected should be set synchronously when selecting control elements', async () => {
    const editor = hook.editor();
    editor.setContent(`<p><img src="${imgSrc}" width="100" height="100"></p>`);
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    TinyAssertions.assertContentPresence(editor, {
      'img[data-mce-selected="1"]': 1
    });
    await UiFinder.pWaitForVisible('Wait for resize handlers to show', TinyDom.body(editor), '#mceResizeHandlese');
  });

  it('TINY-10118: data-mce-selected should be set synchronously when selecting control elements', async () => {
    const editor = hook.editor();
    editor.setContent(`<p contenteditable="false"><img contenteditable="false" src="${imgSrc}" width="100" height="100"></p>`);
    Mouse.trueClickOn(TinyDom.body(editor), 'img');
    TinySelections.setRawSelection(editor, [ 0 ], 0, [ 0 ], 1); // Triggers a `selectionchange` on Firefox
    await Waiter.pTryUntil('correct selection', () =>
      TinyAssertions.assertContentPresence(editor, {
        'img[data-mce-selected="1"]': 0
      })
    );

    editor.setContent(`<p contenteditable="false"><img contenteditable="true" src="${imgSrc}" width="100" height="100"></p>`);
    Mouse.trueClickOn(TinyDom.body(editor), 'img');
    TinySelections.setRawSelection(editor, [ 0 ], 0, [ 0 ], 1); // Triggers a `selectionchange` on Firefox
    await Waiter.pTryUntil('correct selection', () =>
      TinyAssertions.assertContentPresence(editor, {
        'img[data-mce-selected="1"]': 1
      })
    );
    await UiFinder.pWaitForVisible('Wait for resize handlers to show', TinyDom.body(editor), '#mceResizeHandlese');
  });

  it('TINY-9731: data-mce-selected should appear on selected details element', () => {
    const editor = hook.editor();
    editor.setContent(`<details><summary>hoy</summary><p>tiny</p></details>`);
    TinyAssertions.assertContentPresence(editor, { 'details[data-mce-selected="1"]': 0 });
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    TinyAssertions.assertContentPresence(editor, { 'details[data-mce-selected="1"]': 1 });
  });

  it('TINY-11437: Node change while editor UI has focus should not hide control selection', async () => {
    const editor = hook.editor();

    editor.setContent(`<p><img src="${imgSrc}" width="100" height="100"></p>`);
    TinySelections.select(editor, 'img', []);
    TinyContentActions.keystroke(editor, 121, { altKey: true });
    await FocusTools.pTryOnSelector('Assert toolbar is focused', SugarDocument.getDocument(), 'div[role=toolbar] .tox-tbtn');
    editor.nodeChanged();
    TinyAssertions.assertContentPresence(editor, { 'img[data-mce-selected="1"]': 1 });
  });

  Arr.each([ 'nw', 'ne', 'se', 'sw' ], (origin) => {
    it(`TINY-10589 & TINY-10707: Resize ghost table element does not have heights on correct row to allow proper resizing (origin: ${origin})`, async () => {
      const editor = hook.editor();
      editor.setContent(
        '<table style="width: 100px; height: 50px"><tbody>' +
        '<tr style="height: 25px;"><td style="height: 11px;">Cell1</td><td style="height: 12px;">Cell2</td></tr>' +
        '<tr style="height: 25px;"><td style="height: 10px;">Cell3</td><td style="height: 10px;">Cell4</td></tr>' +
        '</tbody></table>'
      );
      TinySelections.select(editor, 'td', [ 0 ]);
      const childSelector = Strings.startsWith(origin, 'n') ? ':first-child' : ':last-child';
      await pAssertInitialGhostElement(
        editor,
        `#mceResizeHandle${origin}`,
        (ghostElm) => {
          Assertions.assertPresence(
            'correct number of height styles',
            {
              'tr': 2,
              'td': 4,
              'tr[style*="height"]': 1,
              'td[style*="height"]': 2,
              [`tr${childSelector} > td[style*="height"]`]: 0,
              [`tr${childSelector}[style*="height"]`]: 0,
            },
            ghostElm
          );
        }
      );
    });
  });
});
