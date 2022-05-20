import { ApproxStructure, Mouse, UiFinder, Clipboard } from '@ephox/agar';
import { Assert, describe, it } from '@ephox/bedrock-client';
import { Optional, OptionalInstances } from '@ephox/katamari';
import { Class, Css, Scroll, SelectorFind, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Readonly from 'tinymce/core/mode/Readonly';
import TablePlugin from 'tinymce/plugins/table/Plugin';

const tOptional = OptionalInstances.tOptional;

describe('browser.tinymce.core.ReadOnlyModeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'table',
    statusbar: false
  }, [ TablePlugin ]);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const assertNestedContentEditableTrueDisabled = (editor: Editor, state: boolean, offscreen: boolean) => TinyAssertions.assertContentStructure(editor,
    ApproxStructure.build((s, str, _arr) => {
      const attrs = state ? {
        'contenteditable': str.is('false'),
        'data-mce-contenteditable': str.is('true')
      } : {
        'contenteditable': str.is('true'),
        'data-mce-contenteditable': str.none()
      };

      return s.element('body', {
        children: [
          s.element('div', {
            attrs: {
              contenteditable: str.is('false')
            },
            children: [
              s.text(str.is('a')),
              s.element('span', {
                attrs
              }),
              s.text(str.is('c'))
            ]
          }),
          ...offscreen ? [ s.element('div', {}) ] : [] // Offscreen cef clone
        ]
      });
    })
  );

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

  const assertToolbarDisabled = (expectedState: boolean) => {
    const elm = UiFinder.findIn(SugarBody.body(), 'button[title="Bold"]').getOrDie();
    assert.equal(Class.has(elm, 'tox-tbtn--disabled'), expectedState, 'Button should have expected disabled state');
  };

  const assertHrefOpt = (editor: Editor, selector: string, expectedHref: Optional<string>) => {
    const elm = SugarElement.fromDom(editor.dom.select(selector)[0]);
    const hrefOpt = Readonly.getAnchorHrefOpt(editor, elm);
    Assert.eq('href options match', expectedHref, hrefOpt, tOptional());
  };

  it('TBA: Switching to readonly mode while having cef selection should remove fake selection', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.setContent('<div contenteditable="false">CEF</div>');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, true);
    setMode(editor, 'readonly');
    assertFakeSelection(editor, false);
    setMode(editor, 'design');
    assertFakeSelection(editor, true);
  });

  it('TBA: Selecting cef element while in readonly mode should not add fake selection', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.setContent('<div contenteditable="false">CEF</div>');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, true);
    setMode(editor, 'readonly');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, false);
    setMode(editor, 'design');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, true);
  });

  it('TBA: Setting caret before cef in editor while in readonly mode should not render fake caret', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.setContent('<div contenteditable="false">CEF</div>');
    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [], 0);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('div', {
              attrs: {
                contenteditable: str.is('false')
              },
              children: [
                s.text(str.is('CEF'))
              ]
            })
          ]
        });
      })
    );
    setMode(editor, 'design');
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, arr) => {
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
      })
    );
  });

  it('TBA: Switching to readonly mode on content with nested contenteditable=true should toggle them to contenteditable=false', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.setContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, true);
    setMode(editor, 'readonly');
    assertNestedContentEditableTrueDisabled(editor, true, true);
    TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
    assertFakeSelection(editor, false);
    setMode(editor, 'design');
    TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
    assertNestedContentEditableTrueDisabled(editor, false, true);
  });

  it('TBA: Setting contents with contenteditable=true should switch them to contenteditable=false while in readonly mode', () => {
    const editor = hook.editor();
    setMode(editor, 'readonly');
    editor.setContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
    assertNestedContentEditableTrueDisabled(editor, true, false);
    TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
    setMode(editor, 'design');
    TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertNestedContentEditableTrueDisabled(editor, false, true);
    editor.setContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertNestedContentEditableTrueDisabled(editor, false, true);
  });

  it('TBA: Resize bars for tables should be hidden while in readonly mode', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    mouseOverTable(editor);
    assertResizeBars(editor, true);
    setMode(editor, 'readonly');
    assertResizeBars(editor, false);
    mouseOverTable(editor);
    assertResizeBars(editor, false);
    setMode(editor, 'design');
    mouseOverTable(editor);
    assertResizeBars(editor, true);
  });

  it('TBA: Context toolbar should hide in readonly mode', async () => {
    const editor = hook.editor();
    editor.focus();
    setMode(editor, 'design');
    editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    await UiFinder.pWaitFor('Waited for context toolbar', SugarBody.body(), '.tox-pop');
    setMode(editor, 'readonly');
    UiFinder.notExists(SugarBody.body(), '.tox-pop');
    setMode(editor, 'design');
    editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    UiFinder.sWaitFor('Waited for context toolbar', SugarBody.body(), '.tox-pop');
  });

  it('TBA: Main toolbar should disable when switching to readonly mode', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    assertToolbarDisabled(false);
    setMode(editor, 'readonly');
    assertToolbarDisabled(true);
    setMode(editor, 'design');
    assertToolbarDisabled(false);
  });

  it('TBA: Menus should close when switching to readonly mode', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    const fileMenu = UiFinder.findIn(SugarBody.body(), '.tox-mbtn:contains("File")').getOrDie();
    Mouse.click(fileMenu);
    UiFinder.sWaitFor('Waited for menu', SugarBody.body(), '.tox-menu');
    setMode(editor, 'readonly');
    UiFinder.sNotExists(SugarBody.body(), '.tox-menu');
  });

  it('TINY-6248: getAnchorHrefOpt should return an Optional of the href of the closest anchor tag', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="https://tiny.cloud">external link</a></p>');
    assertHrefOpt(editor, 'a', Optional.some('https://tiny.cloud'));
    editor.setContent('<p><a>external link with no href</a></p>');
    assertHrefOpt(editor, 'a', Optional.none());
    editor.setContent('<p><a href="https://tiny.cloud"><img src="">nested image </img>inside anchor</a></p>');
    assertHrefOpt(editor, 'img', Optional.some('https://tiny.cloud'));
  });

  it('TINY-6248: processReadonlyEvents should scroll to bookmark with id', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.resetContent();
    setMode(editor, 'readonly');
    editor.setContent('<p><a href="#someBookmark">internal bookmark</a></p><div style="padding-top: 2000px;"></div><p><a id="someBookmark"></a></p>');

    const body = TinyDom.body(editor);
    const doc = TinyDom.document(editor);
    const yPos = Scroll.get(doc).top;
    const anchor = UiFinder.findIn(body, 'a[href="#someBookmark"]').getOrDie();
    Mouse.click(anchor);
    const newPos = Scroll.get(doc).top;
    assert.notEqual(newPos, yPos, 'assert yPos has changed i.e. has scrolled');
  });

  it('TINY-6248: processReadonlyEvents should scroll to bookmark with name', () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.resetContent();
    setMode(editor, 'readonly');
    editor.setContent('<p><a href="#someBookmark">internal bookmark</a></p><div style="padding-top: 2000px;"></div><p><a name="someBookmark"></a></p>');

    const body = TinyDom.body(editor);
    const doc = TinyDom.document(editor);
    const yPos = Scroll.get(doc).top;
    const anchor = UiFinder.findIn(body, 'a[href="#someBookmark"]').getOrDie();
    Mouse.click(anchor);
    const newPos = Scroll.get(doc).top;
    assert.notEqual(newPos, yPos, 'assert yPos has changed i.e. has scrolled');
  });

  it('TINY-6800: even in readonly mode copy event should be dispatched', () => {
    const editor = hook.editor();

    let copyEventCount = 0;
    const copyHandler = () => copyEventCount++;
    editor.on('copy', copyHandler);

    Clipboard.copy(TinyDom.body(editor));
    assert.equal(copyEventCount, 1, 'copy event should be fired');
    editor.off('copy', copyHandler);
  });
});
