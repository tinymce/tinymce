import { Assertions, FocusTools, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Html, Remove, Replication, SelectorFilter, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.ContextToolbarTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const toolbarSelector = '.tox-toolbar button[aria-label="Table properties"]:not(.tox-tbtn--disabled)';
  const tableHtml = '<table style = "width: 5%;">' +
  '<tbody>' +
    '<tr>' +
      '<td></td>' +
    '</tr>' +
  '</tbody>' +
  '</table>';

  const pAddTableAndOpenContextToolbar = async (editor: Editor, html: string) => {
    editor.setContent(html);
    await TinyUiActions.pWaitForUi(editor, toolbarSelector);
  };

  // Use keyboard shortcut ctrl+F9 to navigate to the context toolbar
  const pressKeyboardShortcutKey = (editor: Editor) => TinyContentActions.keydown(editor, 120, { ctrl: true });
  const pressRightArrowKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.right());
  const pressTabKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.tab());

  // Assert focus is on the expected toolbar button
  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  const pAssertButtonDisabled = (editor: Editor, selector: string) =>
    TinyUiActions.pWaitForUi(editor, `.tox-pop__dialog ${selector}.tox-tbtn--disabled`);

  const pClickOnContextToolbarButton = async (editor: Editor, selector: string) => {
    await TinyUiActions.pWaitForPopup(editor, '.tox-pop__dialog .tox-toolbar');
    const button = UiFinder.findIn(SugarBody.body(), `.tox-pop__dialog ${selector}`).getOrDie();
    Mouse.click(button);
  };

  const assertHtmlStructure = (label: string, editor: Editor, expectedHtml: string) => {
    const elm = Replication.deep(TinyDom.body(editor));
    Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus="all"]'), Remove.remove);
    const actualHtml = Html.get(elm);
    Assertions.assertHtmlStructure(label, `<body>${expectedHtml}</body>`, `<body>${actualHtml}</body>`);
  };

  const pOpenAndCloseDialog = async (editor: Editor) => {
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.closeDialog(editor);
    await Waiter.pTryUntil(
      'Wait for dialog to close',
      () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]')
    );
  };

  it('TBA: context toolbar keyboard navigation test', async () => {
    const editor = hook.editor();
    await pAddTableAndOpenContextToolbar(editor, tableHtml);
    pressKeyboardShortcutKey(editor);
    await pAssertFocusOnItem('Table properties button', 'button[aria-label="Table properties"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Delete table button', 'button[aria-label="Delete table"]');
    pressTabKey(editor);
    await pAssertFocusOnItem('Insert row above button', 'button[aria-label="Insert row before"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Insert row below button', 'button[aria-label="Insert row after"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Delete row button', 'button[aria-label="Delete row"]');
    pressTabKey(editor);
    await pAssertFocusOnItem('Insert column before button', 'button[aria-label="Insert column before"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Insert column after button', 'button[aria-label="Insert column after"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Delete column button', 'button[aria-label="Delete column"]');
    pressTabKey(editor);
    await pAssertFocusOnItem('Table properties button', 'button[aria-label="Table properties"]');
    await pClickOnContextToolbarButton(editor, 'button[aria-label="Delete table"]');
    assertHtmlStructure('Assert delete table', editor, '<p><br></p>');
  });

  it('TBA: context toolbar functionality test', async () => {
    const editor = hook.editor();
    await pAddTableAndOpenContextToolbar(editor, tableHtml);

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Table properties"]');
    await pOpenAndCloseDialog(editor);

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Insert row before"]');
    assertHtmlStructure('Assert insert row before', editor, '<table><tbody><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>');

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Insert row after"]');
    assertHtmlStructure('Assert insert row after', editor, '<table><tbody><tr><td><br></td></tr><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>');

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Delete row"]');
    assertHtmlStructure('Assert delete row', editor, '<table><tbody><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>');

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Insert column before"]');
    assertHtmlStructure('Assert insert column before', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Insert column after"]');
    assertHtmlStructure('Assert insert column after', editor, '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>');

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Delete column"]');
    assertHtmlStructure('Assert delete column', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Delete table"]');
    assertHtmlStructure('Assert remove table', editor, '<p><br></p>');
  });

  it('TBA: context toolbar functionality test with focus in caption', async () => {
    const editor = hook.editor();
    await pAddTableAndOpenContextToolbar(editor, '<table style = "width: 5%;"><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Table properties"]');
    await pOpenAndCloseDialog(editor);

    await pAssertButtonDisabled(editor, 'button[aria-label="Insert row before"]');
    await pAssertButtonDisabled(editor, 'button[aria-label="Insert row after"]');
    await pAssertButtonDisabled(editor, 'button[aria-label="Delete row"]');
    await pAssertButtonDisabled(editor, 'button[aria-label="Insert column before"]');
    await pAssertButtonDisabled(editor, 'button[aria-label="Insert column after"]');
    await pAssertButtonDisabled(editor, 'button[aria-label="Delete column"]');

    await pClickOnContextToolbarButton(editor, 'button[aria-label="Delete table"]');
    assertHtmlStructure('Assert remove table', editor, '<p><br></p>');
  });

  it('TINY-9664: toolbars should not render if table is in a noneditable host', async () => {
    const editor = hook.editor();
    const setupTableSelection = () => {
      editor.setContent('<table><tbody><tr><td>x</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      editor.nodeChanged();
    };

    setupTableSelection();
    await TinyUiActions.pWaitForUi(editor, toolbarSelector);

    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async () => {
      setupTableSelection();
      await Waiter.pTryUntil('Wait for the toolbar to disappear', () => UiFinder.notExists(SugarBody.body(), toolbarSelector));
    });
  });
});
