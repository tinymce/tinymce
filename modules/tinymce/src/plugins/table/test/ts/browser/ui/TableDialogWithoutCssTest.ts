import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
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

  const generalLabels = {
    width: 'Width',
    height: 'Height',
    cellspacing: 'Cell spacing',
    cellpadding: 'Cell padding',
    border: 'Border width',
    caption: 'Show caption',
    align: 'Alignment',
    class: 'Class'
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
    TableTestUtils.assertDialogValues(getExpectedData(1), false, generalLabels);
    TableTestUtils.setDialogValues({ border: '2px' }, false, generalLabels);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, getTable(2));
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData(2), false, generalLabels);
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TINY-8758: Default width should be added as attribute, not style', async () => {
    const getExpectedData = (borderWidth: string, width: string) => ({
      width,
      height: '',
      cellspacing: '',
      cellpadding: '',
      border: borderWidth,
      caption: false,
      align: ''
    });

    const editor = hook.editor();
    editor.setContent('<p></p>');
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData('1', '100%'), false, generalLabels);
    TableTestUtils.setDialogValues({ border: '2px' }, false, generalLabels);
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
      styles: {
        'border-collapse': str.is('collapse')
      },
      attrs: {
        border: str.is('2px'),
        width: str.is('100%')
      }
    })));
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData('2px', '100%'), false, generalLabels);
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TINY-12797: Width attribute should be applied when updating table dialog', async () => {
    const getExpectedData = (width: string) => ({
      width,
      height: '',
      cellspacing: '',
      cellpadding: '',
      border: 1 + 'px',
      caption: false,
      align: ''
    });

    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse; width: 100%;" border="1px"><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
    setCursor(editor);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(getExpectedData('100%'), false, generalLabels);
    TableTestUtils.setDialogValues({ width: '50%' }, false, generalLabels);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, '<table style="border-collapse: collapse;" border="1px" width="50%"><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
  });
});
