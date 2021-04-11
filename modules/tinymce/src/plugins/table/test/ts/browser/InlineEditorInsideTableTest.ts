import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Attribute, Html, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import * as EditorFocus from 'tinymce/core/focus/EditorFocus';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.InlineEditorInsideTableTest', () => {
  const setupElement = () => {
    const containerHtml = '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td>' +
      '<div class="tinymce" style="border: 1px gray solid">a</div>' +
      '</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>';

    const container = SugarElement.fromTag('div');
    Attribute.set(container, 'id', 'test-container-div');
    Html.set(container, containerHtml);
    Insert.append(SugarBody.body(), container);

    const editorDiv = SelectorFind.descendant<HTMLDivElement>(container, 'div.tinymce').getOrDie('Cannot find TinyMCE div');
    return {
      element: editorDiv,
      teardown: () => Remove.remove(container)
    };
  };

  const hook = TinyHooks.bddSetupFromElement<Editor>({
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'table',
    menubar: 'table',
    statusbar: false
  }, setupElement, [ Plugin, Theme ]);

  const focusEditor = (editor: Editor) => {
    EditorFocus.focus(editor, false);
  };

  const pWaitForMenuBar = (editor: Editor) => TinyUiActions.pWaitForUi(editor, '.tox-menubar');

  const pAssertMenuButtonDisabled = (editor: Editor, selector: string, disabled: boolean) =>
    TinyUiActions.pWaitForUi(editor, `div.tox-collection__item[title="${selector}"][aria-disabled="${disabled}"]`);

  it('TBA: Table outside of inline editor should not become resizable', () => {
    const editor = hook.editor();
    Mouse.mouseOver(TinyDom.targetElement(editor));
    UiFinder.notExists(SugarBody.body(), 'div[data-row="0"]');
  });

  it('TINY-6625: Table outside of inline editor should not be accessible for deleting', async () => {
    const editor = hook.editor();
    focusEditor(editor);
    await pWaitForMenuBar(editor);
    TinyUiActions.clickOnMenu(editor, 'span:contains("Table")');
    // Expect "Delete table" menu button to be disabled
    await pAssertMenuButtonDisabled(editor, 'Delete table', true);
  });
});
