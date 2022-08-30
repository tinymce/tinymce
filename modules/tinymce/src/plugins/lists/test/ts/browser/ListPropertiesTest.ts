import { FocusTools, Keys, Mouse, UiControls, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument, Value } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ListPropertiesTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'lists',
    contextmenu: 'lists bold',
    menu: {
      custom: { title: 'Custom', items: 'listprops' }
    },
    menubar: 'custom',
    toolbar: false,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const contentMenuSelector = '.tox-tinymce-aux .tox-menu .tox-collection__item:contains("List properties...")';
  const inputSelector = 'label:contains(Start list at number) + input.tox-textfield';

  const openContextMenu = async (editor: Editor, selector: string) => {
    Mouse.contextMenuOn(TinyDom.body(editor), selector);
    await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink [role="menuitem"]');
  };

  const openDialog = async (editor: Editor, contextMenuSelector: string) => {
    await openContextMenu(editor, contextMenuSelector);
    TinyUiActions.keydown(editor, Keys.enter());
    await TinyUiActions.pWaitForUi(editor, '[role=dialog]');
  };

  const updateDialog = (editor: Editor, currentValue: string, newValue: string) => {
    const doc = SugarDocument.getDocument();
    FocusTools.isOnSelector('Check focus is on the input field', doc, inputSelector);
    const input = FocusTools.getFocused<HTMLInputElement>(doc).getOrDie();
    assert.equal(Value.get(input), currentValue, 'Initial input value matches');
    UiControls.setValue(input, newValue);
    TinyUiActions.keydown(editor, Keys.enter());
    assert.equal(Value.get(input), newValue, 'Updated input value matches');
  };

  it('TINY-3915: List properties context menu not shown for DL', async () => {
    const editor = hook.editor();
    editor.setContent('<dl><dt>Item 1</dt><dt>Item 2</dt></dl>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await openContextMenu(editor, 'dl > dt');
    UiFinder.notExists(SugarBody.body(), contentMenuSelector);
  });

  it('TINY-3915: List properties context menu not shown for UL', async () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await openContextMenu(editor, 'ul > li');
    UiFinder.notExists(SugarBody.body(), contentMenuSelector);
  });

  it('TINY-3915: List properties context menu not shown for UL in OL', async () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>Root Item<ul><li>Item 1</li><li>Item 2</li></ul></li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
    await openContextMenu(editor, 'ul > li');
    UiFinder.notExists(SugarBody.body(), contentMenuSelector);
  });

  it('TINY-3915: List properties shown for OL and can change start value', async () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>Item 1</li><li>Item 2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await openDialog(editor, 'ol > li');
    updateDialog(editor, '1', '5');
    TinyAssertions.assertContent(editor, '<ol start="5"><li>Item 1</li><li>Item 2</li></ol>');
    await openDialog(editor, 'ol > li');
    updateDialog(editor, '5', '1');
    TinyAssertions.assertContent(editor, '<ol><li>Item 1</li><li>Item 2</li></ol>');
  });

  it('TINY-3915: List properties shown for OL in UL and can change start value', async () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
    await openDialog(editor, 'ol > li');
    updateDialog(editor, '1', '5');
    TinyAssertions.assertContent(editor, '<ul><li>Root Item<ol start="5"><li>Item 1</li><li>Item 2</li></ol></li></ul>');
    await openDialog(editor, 'ol > li');
    updateDialog(editor, '5', '1');
    TinyAssertions.assertContent(editor, '<ul><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ul>');
  });

  it('TINY-3915: List properties shown for nested OL and can change start value', async () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
    await openDialog(editor, 'ol > li');
    updateDialog(editor, '1', '5');
    TinyAssertions.assertContent(editor, '<ol><li>Root Item<ol start="5"><li>Item 1</li><li>Item 2</li></ol></li></ol>');
    await openDialog(editor, 'ol ol > li');
    updateDialog(editor, '5', '1');
    TinyAssertions.assertContent(editor, '<ol><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>');
  });

  it('TINY-3915: List properties command', () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('mceListProps');
    updateDialog(editor, '1', '10');
    TinyAssertions.assertContent(editor, '<ol start="10"><li>Root Item<ol><li>Item 1</li><li>Item 2</li></ol></li></ol>');
  });

  it('TINY-6286: List properties menu item disabled for UL', async () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("Custom")');
    await TinyUiActions.pWaitForUi(editor, '.tox-collection__item--state-disabled:contains("List properties")');
    await TinyUiActions.pWaitForUi(editor, '.tox-collection__item--state-disabled:contains("List properties")');
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("Custom")');
  });

  it('TINY-6286: List properties menu item enabled for OL', async () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>Item 1</li><li>Item 2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("Custom")');
    await TinyUiActions.pWaitForUi(editor, '.tox-collection__item:contains("List properties"):not(.tox-collection__item--state-disabled)');
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("Custom")');
  });

  it('TINY-6907: List properties dialog uses mceListUpdate command internally to update the DOM', async () => {
    const editor = hook.editor();

    const blockCommand = (event: EditorEvent<ExecCommandEvent>) => {
      if (event.command.toLowerCase() === 'mcelistupdate') {
        event.preventDefault();
      }
    };

    // block the command to ensure dialog changes don't work without it
    editor.on('BeforeExecCommand', blockCommand);
    editor.setContent('<ol><li>Item 1</li><li>Item 2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await openDialog(editor, 'ol > li');
    updateDialog(editor, '1', '5');
    TinyAssertions.assertContent(editor, '<ol><li>Item 1</li><li>Item 2</li></ol>');

    // restore the command after the test
    editor.off('BeforeExecCommand', blockCommand);
  });

  it('TINY-6907: mceListUpdate command sets the start attribute', () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>Item 1</li><li>Item 2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

    editor.execCommand('mceListUpdate', false, { attrs: { start: 5 }});
    TinyAssertions.assertContent(editor, '<ol start="5"><li>Item 1</li><li>Item 2</li></ol>');
  });

  it('TINY-6907: mceListUpdate command can remove the start attribute', () => {
    const editor = hook.editor();
    editor.setContent('<ol start="5"><li>Item 1</li><li>Item 2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

    editor.execCommand('mceListUpdate', false, { attrs: { start: '' }});
    TinyAssertions.assertContent(editor, '<ol><li>Item 1</li><li>Item 2</li></ol>');
  });

  it('TINY-6907: mceListUpdate command sets styles', () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>Item 1</li><li>Item 2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

    editor.execCommand('mceListUpdate', false, { styles: { 'list-style-type': 'upper-alpha' }});
    TinyAssertions.assertContent(editor, '<ol style="list-style-type: upper-alpha;"><li>Item 1</li><li>Item 2</li></ol>');
  });

  it('TINY-6907: mceListUpdate command does not break when used on a paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>some text</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);

    editor.execCommand('mceListUpdate', false, { attrs: { start: 5 }});
    TinyAssertions.assertContent(editor, '<p>some text</p>');
  });

  it('TINY-6907: mceListUpdate command does not break when passed null', () => {
    const editor = hook.editor();
    editor.setContent('<p>some text</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);

    editor.execCommand('mceListUpdate', false, null);
    TinyAssertions.assertContent(editor, '<p>some text</p>');
  });

  it('TINY-6891: List properties command with lower-alpha list', () => {
    const editor = hook.editor();

    // Convert to lower-alpha list
    editor.setContent('<ol><li>1</li><li>2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('mceListProps');
    updateDialog(editor, '1', 'ab');
    TinyAssertions.assertContent(editor, '<ol style="list-style-type: lower-alpha;" start="28"><li>1</li><li>2</li></ol>');

    // Convert back to numerical list
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('mceListProps');
    updateDialog(editor, 'ab', '1');
    TinyAssertions.assertContent(editor, '<ol><li>1</li><li>2</li></ol>');
  });

  it('TINY-6891: List properties command with upper-alpha list', () => {
    const editor = hook.editor();

    // Convert to upper-alpha list
    editor.setContent('<ol><li>1</li><li>2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('mceListProps');
    updateDialog(editor, '1', 'AB');
    TinyAssertions.assertContent(editor, '<ol style="list-style-type: upper-alpha;" start="28"><li>1</li><li>2</li></ol>');

    // Convert back to numerical list
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('mceListProps');
    updateDialog(editor, 'AB', '1');
    TinyAssertions.assertContent(editor, '<ol><li>1</li><li>2</li></ol>');
  });

  it('TINY-6891: List properties command with invalid value should not update the list', () => {
    const editor = hook.editor();
    editor.setContent('<ol style="list-style-type: lower-alpha;" start="1"><li>1</li><li>2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('mceListProps');
    updateDialog(editor, 'a', 'abc123');
    TinyAssertions.assertContent(editor, '<ol style="list-style-type: lower-alpha;" start="1"><li>1</li><li>2</li></ol>');
  });

  it('TINY-6891: Empty string results in numerical list', () => {
    const editor = hook.editor();
    editor.setContent('<ol style="list-style-type: lower-alpha;" start="2"><li>1</li><li>2</li></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('mceListProps');
    updateDialog(editor, 'b', '');
    TinyAssertions.assertContent(editor, '<ol><li>1</li><li>2</li></ol>');
  });
});
