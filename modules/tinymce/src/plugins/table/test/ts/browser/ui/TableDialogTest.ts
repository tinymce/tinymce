import { ApproxStructure, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
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

  const htmlEmptyTable = '<table><tr><td>X</td></tr></table>';

  const setTable = (editor: Editor) => editor.setContent(htmlEmptyTable);
  const setCursor = (editor: Editor) => TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

  const emptyStandardData = {
    width: '',
    height: '',
    cellspacing: '',
    cellpadding: '',
    border: '',
    caption: false,
    align: ''
  };

  it('TBA: Table properties dialog standard ok', async () => {
    const editor = hook.editor();
    setTable(editor);
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(emptyStandardData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertElementStructure(editor, 'table', htmlEmptyTable);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(emptyStandardData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TBA: Table properties dialog standard fill ok', async () => {
    const htmlFilledEmptyTable = ApproxStructure.build((s, str/* , arr*/) => {
      return s.element('table', {
        attrs: {
          border: str.is('1'),
        },
        styles: {
          'height': str.is('500px'),
          'width': str.is('500px'),
          'margin-left': str.is('0px'),
          'margin-right': str.is('auto'),
          'border-spacing': str.is('5px')
        },
        children: [
          s.element('caption', { }),
          s.element('tbody', {
            children: [
              s.element('tr', {
                children: [
                  s.element('td', {
                    styles: {
                      'border-width': str.is('1px'),
                      'padding': str.is('5px')
                    },
                    children: [
                      s.text(str.is('X'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    });

    const fullStandardData = {
      width: '500px',
      height: '500px',
      cellspacing: '5px',
      cellpadding: '5px',
      border: '1px',
      caption: true,
      align: 'left'
    };

    const editor = hook.editor();
    setTable(editor);
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(emptyStandardData, false, generalSelectors);
    TableTestUtils.setDialogValues(fullStandardData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertApproxElementStructure(editor, 'table', htmlFilledEmptyTable);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(fullStandardData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TBA: Table properties dialog all ui off fill ok', async () => {
    const htmlFilledAllOffTable = '<table style="height: 500px; width: 500px; margin-left: auto; margin-right: 0px;"><tbody><tr><td>X</td></tr></tbody></table>';

    const emptyAllOffData = {
      width: '',
      height: '',
      align: ''
    };

    const fullAllOffData = {
      width: '500px',
      height: '500px',
      align: 'right'
    };

    const editor = hook.editor();
    editor.options.set('table_appearance_options', false);
    setTable(editor);
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(emptyAllOffData, false, generalSelectors);
    TableTestUtils.setDialogValues(fullAllOffData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertElementStructure(editor, 'table', htmlFilledAllOffTable);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(fullAllOffData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    editor.options.unset('table_appearance_options');
  });

  it('TBA: Table properties dialog all ui on fill ok', async () => {
    const htmlFilledAllOnTable = ApproxStructure.build((s, str/* , arr*/) => {
      return s.element('table', {
        styles: {
          'height': str.is('500px'),
          'width': str.is('500px'),
          'margin-left': str.is('0px'),
          'margin-right': str.is('auto'),
          'border-width': str.is('1px'),
          'border-spacing': str.is('5px'),
          'background-color': str.startsWith(''), // need to check presence but it can be #ff0000 or rgb(255, 0, 0)
          'border-color': str.startsWith('') // need to check presence but it can be #ff0000 or rgb(255, 0, 0)
        },
        children: [
          s.element('caption', { }),
          s.element('tbody', {
            children: [
              s.element('tr', {
                children: [
                  s.element('td', {
                    children: [
                      s.text(str.is('X'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });
    });

    const emptyAllOnData = {
      width: '',
      height: '',
      cellspacing: '',
      cellpadding: '',
      border: '',
      caption: false,
      align: '',
      class: '',
      borderstyle: '',
      bordercolor: '',
      backgroundcolor: ''
    };

    const fullAllOnData = {
      width: '500px',
      height: '500px',
      cellspacing: '5px',
      cellpadding: '5px',
      border: '1px',
      caption: true,
      align: 'left',
      class: 'dog',
      borderstyle: 'dotted',
      bordercolor: '#FF0000',
      backgroundcolor: '#0000FF'
    };

    const editor = hook.editor();
    editor.options.set('table_class_list', [
      { title: 'None', value: '' },
      { title: 'Dog', value: 'dog' },
      { title: 'Cat', value: 'cat' }
    ]);
    editor.options.set('table_advtab', true);
    setTable(editor);
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(emptyAllOnData, true, generalSelectors);
    TableTestUtils.setDialogValues(fullAllOnData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertApproxElementStructure(editor, 'table', htmlFilledAllOnTable);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(fullAllOnData, true, generalSelectors);
    TableTestUtils.setDialogValues(emptyAllOnData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertElementStructure(editor, 'table', htmlEmptyTable);

    editor.options.unset('table_class_list');
    editor.options.unset('table_advtab');
  });

  it('TBA: Open dialog via execCommand', async () => {
    const baseHtml =
    '<table style="height: 500px; width: 500px; border-width: 1px; ' +
    'border-spacing: 5px; background-color: rgb(0, 0, 255); ' +
    'border-color: rgb(255, 0, 0); border-style: dotted; ' +
    'margin-left: 0px; margin-right: auto;">' +
    '<caption><br></caption>' +
    '<tbody><tr><td>X</td></tr></tbody>' +
    '</table>';

    const baseData = {
      width: '500px',
      height: '500px',
      cellspacing: '5px',
      cellpadding: '',
      border: '1px',
      caption: true,
      align: 'left',
      borderstyle: 'dotted',
      bordercolor: '#FF0000',
      backgroundcolor: '#0000FF'
    };

    const editor = hook.editor();
    editor.options.set('table_advtab', true);
    editor.setContent(baseHtml);
    setCursor(editor);
    editor.execCommand('mceTableProps');
    TableTestUtils.assertDialogValues(baseData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);

    editor.options.unset('table_advtab');
  });

  it('TBA: Test cancel changes nothing and save does', async () => {
    const baseHtml = '<table><tbody><tr><td>X</td></tr></tbody></table>';

    const baseData = {
      width: '',
      height: '',
      cellspacing: '',
      cellpadding: '',
      border: '',
      caption: false,
      align: '',
      class: '',
      borderstyle: '',
      bordercolor: '',
      backgroundcolor: ''
    };

    const newHtml =
    '<table class="dog" style="width: 500px; height: 500px; margin-left: 0px; margin-right: auto; ' +
    'background-color: rgb(0, 0, 255); border: 1px dotted rgb(255, 0, 0); ' +
    'border-spacing: 5px; border-collapse: collapse;" border="1">' +
    '<caption>Caption</caption>' +
    '<tbody>' +
    '<tr><td style="border-color: rgb(255, 0, 0); border-width: 1px; padding: 5px;">X</td></tr>' +

    '</tbody>' +
    '</table>';

    const newData = {
      width: '500px',
      height: '500px',
      cellspacing: '5px',
      cellpadding: '5px',
      border: '1px',
      caption: true,
      align: 'left',
      class: 'dog',
      borderstyle: 'dotted',
      bordercolor: '#FF0000',
      backgroundcolor: '#0000FF'
    };

    const editor = hook.editor();
    editor.options.set('table_class_list', [
      { title: 'None', value: '' },
      { title: 'Dog', value: 'dog' },
      { title: 'Cat', value: 'cat' }
    ]);
    editor.options.set('table_advtab', true);
    editor.setContent(baseHtml);
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(baseData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    TinyAssertions.assertContent(editor, baseHtml);

    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(baseData, true, generalSelectors);
    TableTestUtils.setDialogValues(newData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, newHtml);

    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(newData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);

    editor.options.unset('table_class_list');
    editor.options.unset('table_advtab');
  });

  it('TINY-6558: float style should not be recognised as a valid table alignment and is cleared when setting an alignment', async () => {
    const floatTableHtml = '<table style="height: 500px; width: 500px; float: right;"><tbody><tr><td>X</td></tr></tbody></table>';
    const marginTableHtml = '<table style="height: 500px; width: 500px; margin-left: auto; margin-right: 0px;"><tbody><tr><td>X</td></tr></tbody></table>';

    const initialData = {
      width: '500px',
      height: '500px',
      align: ''
    };

    const newData = {
      width: '500px',
      height: '500px',
      align: 'right'
    };

    const editor = hook.editor();
    editor.options.set('table_appearance_options', false);
    editor.setContent(floatTableHtml);
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(initialData, false, generalSelectors);
    TableTestUtils.setDialogValues(newData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertElementStructure(editor, 'table', marginTableHtml);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(newData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    editor.options.unset('table_appearance_options');
  });

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

    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse;" border="1px" width="60%"><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(1), false, generalSelectors);
    TableTestUtils.setDialogValues({ border: '2px' }, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, '<table style="border-collapse: collapse; width: 60%; border-width: 2px;" border="1" width="60%"><tbody><tr><td style="border-width: 2px;">&nbsp;</td></tr></tbody></table>');
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(2), false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TINY-8758: Default width should be added as style', async () => {
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
    TinyAssertions.assertContent(editor, '<table style="border-collapse: collapse; border-width: 2px;" border="1"><tbody><tr><td style="border-width: 2px;">&nbsp;</td></tr></tbody></table>');
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(2, ''), false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TINY-9459: Should not open table properties dialog on noneditable table', () => {
    const editor = hook.editor();
    editor.setContent('<table contenteditable="false"><tbody><tr><td>x</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 1, 0, 0, 0, 0 ], 0); // Index offset off by one due to cef fake caret
    editor.execCommand('mceTableProps');
    UiFinder.notExists(SugarBody.body(), '.tox-dialog');
  });

  it('TINY-9459: Should not open table properties dialog on noneditable root', () => {
    TableTestUtils.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<table><tbody><tr><td>x</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      editor.execCommand('mceTableProps');
      UiFinder.notExists(SugarBody.body(), '.tox-dialog');
    });
  });

  it('TINY-9459: Should not open table insert dialog on noneditable root', () => {
    TableTestUtils.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<table><tbody><tr><td>x</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      editor.execCommand('mceInsertTableDialog');
      UiFinder.notExists(SugarBody.body(), '.tox-dialog');
    });
  });
});
