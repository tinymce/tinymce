import { ApproxStructure, Mouse, UiFinder, Clipboard, TestStore } from '@ephox/agar';
import { afterEach, Assert, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, OptionalInstances } from '@ephox/katamari';
import { Class, Css, Scroll, SelectorFind, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Disabled from 'tinymce/core/mode/Disabled';
import TablePlugin from 'tinymce/plugins/table/Plugin';

const tOptional = OptionalInstances.tOptional;

interface TestButtonDisabledState {
  name: string;
  disabledAttribute: 'aria-disabled' | 'disabled';
}

describe('browser.tinymce.core.DisabledModeTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    statusbar: false
  };

  context('Disabled mode', () => {
    const hook = TinyHooks.bddSetup<Editor>({ ...settings, plugins: 'table' }, [ TablePlugin ]);

    const assertNestedContentEditableTrueDisabled = (editor: Editor, state: boolean, offscreen: boolean) => {
      TinyAssertions.assertContentStructure(editor,
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
                    attrs,
                  }),
                  s.text(str.is('c'))
                ]
              }),
              ...offscreen ? [ s.element('div', {}) ] : [] // Offscreen cef clone
            ]
          });
        })
      );
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

    const assertToolbarDisabled = (expectedState: boolean) => {
      const elm = UiFinder.findIn(SugarBody.body(), 'button[data-mce-name="bold"]').getOrDie();
      assert.equal(Class.has(elm, 'tox-tbtn--disabled'), expectedState, 'Button should have expected disabled state');
    };

    const assertHrefOpt = (editor: Editor, selector: string, expectedHref: Optional<string>) => {
      const elm = SugarElement.fromDom(editor.dom.select(selector)[0]);
      const hrefOpt = Disabled.getAnchorHrefOpt(editor, elm);
      Assert.eq('href options match', expectedHref, hrefOpt, tOptional());
    };

    it('TBA: Switching to disabled mode while having cef selection should remove fake selection', () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="false">CEF</div>');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, true);
      editor.options.set('disabled', true);
      assertFakeSelection(editor, false);
      editor.options.set('disabled', false);
      assertFakeSelection(editor, true);
    });

    it('TBA: Selecting cef element while in disabled mode should not add fake selection', () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="false">CEF</div>');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, true);
      editor.options.set('disabled', true);
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, false);
      editor.options.set('disabled', false);
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, true);
    });

    it('TBA: Setting caret before cef in editor while in disabled mode should not render fake caret', () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="false">CEF</div>');
      editor.options.set('disabled', true);
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
      editor.options.set('disabled', false);
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

    it('TBA: Switching to disabled mode on content with nested contenteditable=true should toggle them to contenteditable=false', async () => {
      const editor = hook.editor();
      editor.setContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertFakeSelection(editor, true);
      editor.options.set('disabled', true);
      assertNestedContentEditableTrueDisabled(editor, true, true);
      TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
      assertFakeSelection(editor, false);
      editor.options.set('disabled', false);
      TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
      assertNestedContentEditableTrueDisabled(editor, false, true);
    });

    it('TBA: Setting contents with contenteditable=true should switch them to contenteditable=false while in disabled mode', () => {
      const editor = hook.editor();
      editor.options.set('disabled', true);
      editor.setContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
      assertNestedContentEditableTrueDisabled(editor, true, false);
      TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
      editor.options.set('disabled', false);
      TinyAssertions.assertContent(editor, '<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertNestedContentEditableTrueDisabled(editor, false, true);
      editor.setContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>');
      TinySelections.select(editor, 'div[contenteditable="false"]', []);
      assertNestedContentEditableTrueDisabled(editor, false, true);
    });

    it('TBA: Resize bars for tables should be hidden while in disabled mode', async () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      mouseOverTable(editor);
      assertResizeBars(editor, true);
      editor.options.set('disabled', true);
      assertResizeBars(editor, false);
      mouseOverTable(editor);
      assertResizeBars(editor, false);
      editor.options.set('disabled', false);
      mouseOverTable(editor);
      assertResizeBars(editor, true);
    });

    it('TBA: Context toolbar should be hidden in disabled mode', async () => {
      const editor = hook.editor();
      editor.focus();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      await UiFinder.pWaitFor('Waited for context toolbar', SugarBody.body(), '.tox-pop');
      editor.options.set('disabled', true);
      UiFinder.notExists(SugarBody.body(), '.tox-pop');
      editor.options.set('disabled', false);
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      UiFinder.sWaitFor('Waited for context toolbar', SugarBody.body(), '.tox-pop');
    });

    it('TBA: Main toolbar should be disabled when switching to disabled mode', () => {
      const editor = hook.editor();
      assertToolbarDisabled(false);
      editor.options.set('disabled', true);
      assertToolbarDisabled(true);
      editor.options.set('disabled', false);
      assertToolbarDisabled(false);
    });

    it('TBA: Menus should close when switching to readonly mode', async () => {
      const editor = hook.editor();
      const fileMenu = UiFinder.findIn(SugarBody.body(), '.tox-mbtn:contains("File")').getOrDie();
      Mouse.click(fileMenu);
      await UiFinder.pWaitFor('Waited for menu', SugarBody.body(), '.tox-menu');
      editor.options.set('disabled', true);
      UiFinder.notExists(SugarBody.body(), '.tox-menu');
      editor.options.set('disabled', false);
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

    it('TINY-6248: processReadonlyEvents should scroll to bookmark with id in disabled mode', () => {
      const editor = hook.editor();
      editor.resetContent();
      editor.options.set('disabled', true);
      editor.setContent('<p><a href="#someBookmark">internal bookmark</a></p><div style="padding-top: 2000px;"></div><p><a id="someBookmark"></a></p>');

      const body = TinyDom.body(editor);
      const doc = TinyDom.document(editor);
      const yPos = Scroll.get(doc).top;
      const anchor = UiFinder.findIn(body, 'a[href="#someBookmark"]').getOrDie();
      Mouse.click(anchor);
      const newPos = Scroll.get(doc).top;
      assert.notEqual(newPos, yPos, 'assert yPos has changed i.e. has scrolled');
      editor.options.set('disabled', false);
    });

    it('TINY-6800: Copy events should be dispatched even in disabled mode', () => {
      const editor = hook.editor();
      editor.options.set('disabled', true);

      let copyEventCount = 0;
      const copyHandler = () => copyEventCount++;
      editor.on('copy', copyHandler);

      Clipboard.copy(TinyDom.body(editor));
      assert.equal(copyEventCount, 1, 'copy event should be fired');
      editor.off('copy', copyHandler);
      editor.options.set('disabled', false);
    });

    it('TINY-6248: processReadonlyEvents should scroll to bookmark with name in disabled mode', async () => {
      const editor = hook.editor();
      const body = TinyDom.body(editor);
      const doc = TinyDom.document(editor);
      editor.resetContent();
      editor.options.set('disabled', true);
      editor.setContent('<p><a href="#someBookmark">internal bookmark</a></p><div style="padding-top: 2000px;"></div><p><a name="someBookmark"></a></p>');

      const yPos = Scroll.get(doc).top;
      const anchor = UiFinder.findIn(body, 'a[href="#someBookmark"]').getOrDie();
      Mouse.click(anchor);
      const newPos = Scroll.get(doc).top;
      assert.notEqual(newPos, yPos, 'assert yPos has changed i.e. has scrolled');
      editor.options.set('disabled', false);
    });

    const assertBodyClass = (editor: Editor, cls: string, state: boolean) => {
      assert.equal(Class.has(TinyDom.body(editor), cls), state, 'Should be the expected class state');
    };

    it('TINY-11488: Assert body class when editor is disabled', () => {
      const editor = hook.editor();
      editor.options.set('disabled', true);
      assertBodyClass(editor, 'mce-content-readonly', true);

      editor.options.set('disabled', false);
      assertBodyClass(editor, 'mce-content-readonly', false);

      editor.options.set('disabled', true);
      assertBodyClass(editor, 'mce-content-readonly', true);
    });
  });

  const assertContentEditableBody = (editor: Editor) => (shouldBeEditable: boolean) => {
    assert.isTrue(editor.getBody().contentEditable === shouldBeEditable.toString(), 'Editor body contentEditable should be ' + shouldBeEditable);
  };

  const assertEditorContainerClass = (editor: Editor) => (shouldNotHaveClass: boolean) => {
    const hasClass = Class.has(TinyDom.container(editor), 'tox-tinymce--disabled');
    assert.equal(!hasClass, shouldNotHaveClass, 'Editor container should not have class: tox-tinymce--disabled');
  };

  const assertEditorState = (shouldBeEnabled: boolean) => (editor: Editor) => {
    assert.equal(editor.disabled, !shouldBeEnabled, `Editor.disabled should be ${!shouldBeEnabled}`);
    assertContentEditableBody(editor)(shouldBeEnabled);
    assertEditorContainerClass(editor)(shouldBeEnabled);
  };

  const assertEditorDisabled = assertEditorState(false);
  const assertEditorEnabled = assertEditorState(true);

  context('Switching editor mode', () => {
    const hook = TinyHooks.bddSetup<Editor>({ ...settings, disabled: true }, []);

    afterEach(() => hook.editor().options.set('disabled', true));

    // Basic checking of the UI and editor body contentEditable
    it('TINY-11488: Should be able to switch from disabled mode to enabled mode', () => {
      const editor = hook.editor();
      assertEditorDisabled(editor);
      editor.options.set('disabled', false);
      assertEditorEnabled(editor);
    });

    it('TINY-11488: Should not allow switching modes when the editor is disabled', () => {
      const editor = hook.editor();
      assertEditorDisabled(editor);
      editor.mode.set('readonly');
      assertEditorDisabled(editor);
      editor.options.set('disabled', false);
      assertEditorEnabled(editor);
      editor.mode.set('readonly');
      assertEditorEnabled(editor);
      editor.mode.set('design');
    });

    it('TINY-11488: UIs should still be disabled when switching to disable false in readonly mode', () => {
      const editor = hook.editor();
      editor.options.set('disabled', false);
      editor.mode.set('readonly');
      assertEditorEnabled(editor);
      editor.options.set('disabled', true);
      assertEditorDisabled(editor);
      editor.options.set('disabled', false);
      assertEditorEnabled(editor);
    });
  });

  context('Default disabled: false', () => {
    const hook = TinyHooks.bddSetup<Editor>({ ...settings, disabled: false }, []);

    afterEach(() => hook.editor().options.set('disabled', true));

    // Basic checking of the UI and editor body contentEditable
    it('TINY-11488: Should be able to switch from disabled mode to enabled mode', () => {
      const editor = hook.editor();
      assertEditorEnabled(editor);
      editor.options.set('disabled', true);
      assertEditorDisabled(editor);
      editor.options.set('disabled', false);
      assertEditorEnabled(editor);
    });
  });

  context('DisabledStateChange Event', () => {
    const store = TestStore<boolean>();
    const hook = TinyHooks.bddSetup<Editor>({
      ...settings,
      disabled: true,
      setup: (ed: Editor) => {
        ed.on('DisabledStateChange', (e) => store.add(e.state));
      }
    }, []);

    afterEach(() => {
      hook.editor().options.set('disabled', true);
      store.clear();
    });

    it('TINY-11488: DisabledStateChange event should be dispatched when state changes', () => {
      const editor = hook.editor();
      store.assertEq('InitialState', [ ]);
      editor.options.set('disabled', false);
      store.assertEq('Disable state change event setting to false', [ false ]);

      editor.options.set('disabled', false);
      store.assertEq('Setting the same value should not dispatch DisabledStateChange', [ false ]);

      editor.options.set('disabled', true);
      store.assertEq('Disable state change event setting to true', [ false, true ]);
    });
  });

  context('Toolbar button state with disable state and readonly mode/non editable root', () => {
    const assertButtonState = (button: TestButtonDisabledState, shouldBeDisabled: boolean) => {
      const { name, disabledAttribute } = button;
      const attributeValue = disabledAttribute === 'disabled' ? 'disabled' : 'true';
      const selector = `[data-mce-name="${name}"][${disabledAttribute}="${attributeValue}"]`;

      if (shouldBeDisabled) {
        UiFinder.exists(SugarBody.body(), selector);
      } else {
        UiFinder.notExists(SugarBody.body(), selector);
      }
    };

    const assertButtonsStateDisabled = (buttons: TestButtonDisabledState[]) => {
      Arr.each(buttons, (button) => assertButtonState(button, true));
    };

    const assertButtonsStateEnabled = (buttons: TestButtonDisabledState[]) => {
      Arr.each(buttons, (button) => assertButtonState(button, false));
    };

    const toolbarButtons: TestButtonDisabledState[] = [
      { name: 'bold', disabledAttribute: 'aria-disabled' },
      { name: 'print', disabledAttribute: 'aria-disabled' },
      { name: 'forecolor', disabledAttribute: 'aria-disabled' },
      { name: 'searchreplace', disabledAttribute: 'aria-disabled' },
    ];

    const nativeDisabledToolbarButtons: TestButtonDisabledState[] = [
      { name: 'lineheight', disabledAttribute: 'disabled' },
      { name: 'fontfamily', disabledAttribute: 'disabled' },
      { name: 'fontsize', disabledAttribute: 'disabled' },
      { name: 'blocks', disabledAttribute: 'disabled' },
      { name: 'styles', disabledAttribute: 'disabled' },
    ];

    const allButtons = [ ...toolbarButtons, ...nativeDisabledToolbarButtons ];

    const excludeReadOnlyEnabledButton = Arr.filter(toolbarButtons, (btn) => btn.name !== 'print');
    const excludeNonEditableRootButton = Arr.filter(toolbarButtons, (btn) => btn.name !== 'print' && btn.name !== 'searchreplace');

    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      disabled: true,
      plugins: 'searchreplace',
      toolbar: Arr.map(allButtons, (button) => button.name).join(' '),
    }, []);

    afterEach(() => hook.editor().options.set('disabled', true));

    it('TINY-11488: Toolbar buttons should reflect the editor disabled state in readonly', () => {
      const editor = hook.editor();
      assertButtonsStateDisabled(allButtons);

      editor.options.set('disabled', false);
      assertButtonsStateEnabled(allButtons);

      // Set the editor to readonly mode
      editor.mode.set('readonly');
      assertButtonsStateDisabled([ ...excludeReadOnlyEnabledButton, ...nativeDisabledToolbarButtons ]);
      assertButtonState({ name: 'print', disabledAttribute: 'aria-disabled' }, false);

      // Disable the editor again, all buttons should be disabled
      editor.options.set('disabled', true);
      assertButtonsStateDisabled(allButtons);

      // Re-enable the editor; only 'print' should be enabled in readonly mode
      editor.options.set('disabled', false);
      assertButtonsStateDisabled([ ...excludeReadOnlyEnabledButton, ...nativeDisabledToolbarButtons ]);
      assertButtonState({ name: 'print', disabledAttribute: 'aria-disabled' }, false);

      // Switch back to design mode; all buttons should be enabled
      editor.mode.set('design');
      assertButtonsStateEnabled(allButtons);
    });

    it('TINY-11488: Toolbar buttons should reflect the editor disabled state in noneditable root', () => {
      const editor = hook.editor();
      assertButtonsStateDisabled(allButtons);

      editor.options.set('disabled', false);
      assertButtonsStateEnabled(allButtons);

      // Set the editor to editableRoot false
      editor.setEditableRoot(false);
      assertButtonsStateDisabled([ ...excludeNonEditableRootButton, ...nativeDisabledToolbarButtons ]);
      assertButtonsStateEnabled([{ name: 'print', disabledAttribute: 'aria-disabled' }, { name: 'searchreplace', disabledAttribute: 'aria-disabled' }]);

      // Disable the editor again, all buttons should be disabled
      editor.options.set('disabled', true);
      assertButtonsStateDisabled(allButtons);

      editor.options.set('disabled', false);
      assertButtonsStateDisabled([ ...excludeNonEditableRootButton, ...nativeDisabledToolbarButtons ]);
      assertButtonsStateEnabled([{ name: 'print', disabledAttribute: 'aria-disabled' }, { name: 'searchreplace', disabledAttribute: 'aria-disabled' }]);

      editor.setEditableRoot(true);
      assertButtonsStateEnabled(allButtons);
    });
  });
});
