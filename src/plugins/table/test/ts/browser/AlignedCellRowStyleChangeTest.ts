import { GeneralSteps, Logger, Pipeline, Chain, UiFinder, Mouse, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { Editor } from 'tinymce/core/api/Editor';
import TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.AlignedCellRowStyleChangeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('set background color on selected table row with text-align: center', GeneralSteps.sequence([
        tinyApis.sSetContent('<table style="border-collapse: collapse; width: 100%;" border="1"><tbody><tr style="height: 18px;"><td style="width: 50%; height: 18px; text-align: center;" data-mce-selected="1">a</td><td style="width: 50%; height: 18px; text-align: center;" data-mce-selected="1">b</td></tr><tr style="height: 18px;"><td style="width: 50%; height: 18px;">c</td><td style="width: 50%; height: 18px;">d</td></tr></tbody></table>'),
        tinyApis.sSetSelection([0, 0, 0, 1, 0], 1, [0, 0, 0, 1, 0], 1),
        tinyApis.sExecCommand('mceTableRowProps'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('row prop popup', 'div[aria-label="Row properties"]'),
          tinyUi.cFillDialogWith({ backgroundColor: 'red'}),
          UiFinder.cFindIn('button:contains("Ok")'),
          Mouse.cClick
        ]),
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
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
