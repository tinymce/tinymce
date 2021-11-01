import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.AlignedCellRowStyleChangeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    toolbar: 'tableRowProps',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: Set background color on selected table row with text-align: center', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse; width: 100%;" border="1">' +
      '<tbody>' +
      '<tr style="height: 18px;">' +
      '<td style="width: 50%; height: 18px; text-align: center;" data-mce-selected="1">a</td>' +
      '<td style="width: 50%; height: 18px; text-align: center;" data-mce-selected="1">b</td>' +
      '</tr>' +
      '<tr style="height: 18px;">' +
      '<td style="width: 50%; height: 18px;">c</td>' +
      '<td style="width: 50%; height: 18px;">d</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );
    TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
    editor.execCommand('mceTableRowProps');
    await TinyUiActions.pWaitForDialog(editor);
    TableTestUtils.gotoAdvancedTab();
    TableTestUtils.setInputValue('label.tox-label:contains(Background color) + div>input.tox-textfield', 'red');
    await TableTestUtils.pClickDialogButton(editor, true);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
      children: [
        s.element('tbody', {
          children: [
            s.element('tr', {
              styles: { 'background-color': str.is('red') },
              children: [
                s.element('td', {
                  styles: { 'text-align': str.is('center') },
                  children: [ s.text(str.is('a')) ]
                }),
                s.element('td', {
                  styles: { 'text-align': str.is('center') },
                  children: [ s.text(str.is('b')) ]
                })
              ]
            }),
            s.element('tr', {
              children: [
                s.element('td', { children: [ s.text(str.is('c')) ] }),
                s.element('td', { children: [ s.text(str.is('d')) ] })
              ]
            })
          ]
        })
      ]
    })));
  });
});
