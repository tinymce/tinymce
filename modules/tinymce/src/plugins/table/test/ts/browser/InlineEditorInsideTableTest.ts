import { Mouse, UiFinder } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Attribute, Html, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

const findAll = (selector: string) => UiFinder.findAllIn(SugarBody.body(), selector);

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
  }, setupElement, [ Plugin ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.focus();
  });

  const pWaitForMenuBar = (editor: Editor) => TinyUiActions.pWaitForUi(editor, '.tox-menubar');

  const pAssertMenuButtonDisabled = (editor: Editor, selector: string, disabled: boolean) =>
    TinyUiActions.pWaitForUi(editor, `div.tox-collection__item[title="${selector}"][aria-disabled="${disabled}"]`);

  it('TBA: Table outside of inline editor should not become resizable', () => {
    const editor = hook.editor();
    Mouse.mouseOver(TinyDom.targetElement(editor));
    UiFinder.notExists(SugarBody.body(), 'div[data-row="0"]');
  });

  it('TINY-6625: Table menu items of inline editor shoud be disabled', async () => {
    const editor = hook.editor();
    await pWaitForMenuBar(editor);
    TinyUiActions.clickOnMenu(editor, 'span:contains("Table")');
    await pAssertMenuButtonDisabled(editor, 'Delete table', true);
    await pAssertMenuButtonDisabled(editor, 'Table properties', true);
  });

  context('TINY-6625: Table outside of inline editor should not be affected by table plugin commands', () => {
    it('TINY-6625: mceTableApplyCellStyle', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableApplyCellStyle', false, { 'background-color': 'pink' });
      const td = editor.getBody().parentElement as HTMLTableCellElement;
      assert.notEqual(td.style.backgroundColor, 'pink');
    });

    it('TINY-6625: mceTableInsertRowBefore', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableInsertRowBefore');
      assert.lengthOf(findAll('tr'), 1);
    });

    it('TINY-6625: mceTableInsertRowAfter', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableInsertRowAfter');
      assert.lengthOf(findAll('tr'), 1);
    });

    it('TINY-6625: mceTableInsertColBefore', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableInsertColBefore');
      assert.lengthOf(findAll('td'), 1);
    });

    it('TINY-6625: mceTableInsertColAfter', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableInsertColAfter');
      assert.lengthOf(findAll('td'), 1);
    });

    it('TINY-6625: mceTableDeleteCol', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableDeleteCol');
      assert.lengthOf(findAll('td'), 1);
    });

    it('TINY-6625: mceTableDeleteRow', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableDeleteRow');
      assert.lengthOf(findAll('tr'), 1);
    });

    it('TINY-6625: mceTableDelete', () => {
      const editor = hook.editor();
      editor.execCommand('mceTableDelete');
      assert.lengthOf(findAll('table'), 1);
    });
  });
});
