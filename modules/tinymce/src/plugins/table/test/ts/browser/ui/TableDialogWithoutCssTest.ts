import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableDialogTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    toolbar: 'tableprops',
    base_url: '/project/tinymce/js/tinymce',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,margin-left,margin-right,border-color,border-width,background-color,border,padding,border-spacing,border-collapse,border-style'
    },
    table_advtab: false,
    table_style_by_css: false,
    statusbar: false
  }, [ Plugin ], true);

  const generalSelectors = {
    width: 'label.tox-label:contains(Width) + input.tox-textfield',
    height: 'label.tox-label:contains(Height) + input.tox-textfield',
    cellspacing: 'label.tox-label:contains(Cell spacing) + input.tox-textfield',
    cellpadding: 'label.tox-label:contains(Cell padding) + input.tox-textfield',
    border: 'label.tox-label:contains(Border width) + input.tox-textfield',
    caption: 'label.tox-label:contains(Caption) + label.tox-checkbox > input',
    align: 'label.tox-label:contains(Alignment) + div.tox-listboxfield > .tox-listbox',
    class: 'label.tox-label:contains(Class) + div.tox-listboxfield > .tox-listbox'
  };

  const setCursor = (editor: Editor) => TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

  it('TINY-8758: width should be retained when changing the border width', async () => {
    const getExpectedData = (borderWidth: number) => ({
      width: '60%',
      height: '',
      cellspacing: '',
      cellpadding: '',
      border: borderWidth + 'px',
      caption: false,
      align: ''
    });

    const getTable = (borderWidth: number) => `<table style="border-collapse: collapse;" border="${borderWidth}px" width="60%"><tbody><tr><td>&nbsp;</td></tr></tbody></table>`;

    const editor = hook.editor();
    editor.setContent(getTable(1));
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(1), false, generalSelectors);
    TableTestUtils.setDialogValues({ border: '2px' }, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, getTable(2));
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(2), false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TINY-8758: Default width should be added as attribute, not style', async () => {
    const getExpectedData = (borderWidth: number, width: string) => ({
      width,
      height: '',
      cellspacing: '',
      cellpadding: '',
      border: borderWidth + 'px',
      caption: false,
      align: ''
    });

    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse;" border="1px"><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(1, ''), false, generalSelectors);
    TableTestUtils.setDialogValues({ border: '2px' }, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, '<table style="border-collapse: collapse;" border="2px" width="100%"><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(2, '100%'), false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
  });
});
