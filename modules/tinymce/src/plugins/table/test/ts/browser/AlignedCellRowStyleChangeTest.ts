import { ApproxStructure, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.AlignedCellRowStyleChangeTest', (success, failure) => {
  SilverTheme();
  Plugin();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, Log.steps('TBA', 'Table: Set background color on selected table row with text-align: center', [
      UiFinder.sWaitForVisible('waiting for editor', Element.fromDom(document.body), 'div.tox-tinymce'),
      tinyApis.sFocus,
      tinyApis.sSetContent('<table style="border-collapse: collapse; width: 100%;" border="1"><tbody><tr style="height: 18px;"><td style="width: 50%; height: 18px; text-align: center;" data-mce-selected="1">a</td><td style="width: 50%; height: 18px; text-align: center;" data-mce-selected="1">b</td></tr><tr style="height: 18px;"><td style="width: 50%; height: 18px;">c</td><td style="width: 50%; height: 18px;">d</td></tr></tbody></table>'),
      tinyApis.sSetSelection([0, 0, 0, 1, 0], 1, [0, 0, 0, 1, 0], 1),
      tinyApis.sExecCommand('mceTableRowProps'),
      UiFinder.sWaitForVisible('wait for dialog', TinyDom.fromDom(document.body), '.tox-dialog[role="dialog"]'),
      TableTestUtils.sGotoAdvancedTab,
      TableTestUtils.sSetInputValue('Background color', 'label.tox-label:contains(Background color) + div>input.tox-textfield', 'red'),
      TableTestUtils.sClickDialogButton('close dialog', true),
      TableTestUtils.sAssertTableStructure(editor, ApproxStructure.build((s, str, arr) => {
        return s.element('table', {
          children: [
            s.element('tbody', {
              children: [
                s.element('tr', {
                  styles: { 'background-color': str.is('red') },
                  children: [
                    s.element('td', {
                      styles: { 'text-align': str.is('center') },
                      children: [s.text(str.is('a'))]
                    }),
                    s.element('td', {
                      styles: { 'text-align': str.is('center') },
                      children: [s.text(str.is('b'))]
                    })
                  ]
                }),
                s.element('tr', {
                  children: [
                    s.element('td', { children: [s.text(str.is('c'))] }),
                    s.element('td', { children: [s.text(str.is('d'))] })
                  ]
                })
              ]
            })
          ]
        });
      }))
    ]), onSuccess, onFailure);
  }, {
    plugins: 'table',
    toolbar: 'tableRowProps',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
