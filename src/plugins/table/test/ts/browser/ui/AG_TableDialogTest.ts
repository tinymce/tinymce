import { Pipeline, ApproxStructure, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from '../../../../../../themes/silver/main/ts/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableDialogGeneralTest', (success, failure) => {

  Plugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const htmlEmptyTable = '<table><tr><td>X</td></tr></table>';

    const sSetTable = tinyApis.sSetContent(htmlEmptyTable);
    const sSetCursor = tinyApis.sSetCursor([0, 0, 0], 0);

    const emptyStandardData = {
      width: '',
      height: '',
      cellspacing: '',
      cellpadding: '',
      border: '',
      caption: 'unchecked',
      align: ''
    };

    const standardOkTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Table properties dialog standard ok', [
        sSetTable,
        sSetCursor,
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, emptyStandardData),
        TableTestUtils.sClickDialogButton('empty dialog with empty details', true),
        TableTestUtils.sAssertElementStructure(editor, 'table', htmlEmptyTable),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, emptyStandardData),
        TableTestUtils.sClickDialogButton('cancelling dialog', false)
      ]);
    };

    const standardFillOkTest = () => {
      const htmlFilledEmptyTable = ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('table', {
          attrs: {
            border: str.is('1'),
            cellpadding: str.is('5'),
            cellspacing: str.is('5')
          },
          styles: {
            height: str.is('500px'),
            width: str.is('500px'),
            float: str.is('left')
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
                    }),
                  ]
                })
              ]
            }),
          ]
        });
      });

      const fullStandardData = {
        width: '500px',
        height: '500px',
        cellspacing: '5',
        cellpadding: '5',
        border: '1',
        caption: 'checked',
        align: 'left'
      };

      return Log.stepsAsStep('TBA', 'Table: Table properties dialog standard fill ok', [
        sSetTable,
        sSetCursor,
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, emptyStandardData),
        TableTestUtils.sSetDialogContents(editor, fullStandardData),
        TableTestUtils.sClickDialogButton('filled dialog with full details', true),
        TableTestUtils.sAssertApproxElementStructure(editor, 'table', htmlFilledEmptyTable),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, fullStandardData),
        TableTestUtils.sClickDialogButton('cancelling dialog', false)
      ]);
    };

    const allOffOkTest = () => {
      const htmlFilledAllOffTable = '<table style="height: 500px; width: 500px; float: left;"><tbody><tr><td>X</td></tr></tbody></table>';

      const emptyAllOffData = {
        width: '',
        height: '',
        align: ''
      };

      const fullAllOffData = {
        width: '500px',
        height: '500px',
        align: 'left'
      };

      return Log.stepsAsStep('TBA', 'Table: Table properties dialog all ui off fill ok', [
        tinyApis.sSetSetting('table_appearance_options', false),
        sSetTable,
        sSetCursor,
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, emptyAllOffData),
        TableTestUtils.sSetDialogContents(editor, fullAllOffData),
        TableTestUtils.sClickDialogButton('filled dialog with full details', true),
        TableTestUtils.sAssertElementStructure(editor, 'table', htmlFilledAllOffTable),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, fullAllOffData),
        TableTestUtils.sClickDialogButton('cancelling dialog', false),
        tinyApis.sDeleteSetting('table_appearance_options')
      ]);
    };

    const allOnOkTest = () => {
      const htmlFilledAllOnTable = ApproxStructure.build(function (s, str/*, arr*/) {
        return s.element('table', {
          styles: {
            'height': str.is('500px'),
            'width': str.is('500px'),
            'float': str.is('left'),
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
        caption: 'unchecked',
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
        caption: 'checked',
        align: 'left',
        class: 'dog',
        borderstyle: 'dotted',
        bordercolor: '#ff0000',
        backgroundcolor: '#0000ff'
      };

      return Log.stepsAsStep('TBA', 'Table: Table properties dialog all ui on fill ok', [
        tinyApis.sSetSetting('table_class_list', [
          {title: 'None', value: ''},
          {title: 'Dog', value: 'dog'},
          {title: 'Cat', value: 'cat'}
        ]),
        tinyApis.sSetSetting('table_advtab', true),
        tinyApis.sSetSetting('table_style_by_css', true),
        sSetTable,
        sSetCursor,
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, emptyAllOnData),
        TableTestUtils.sSetDialogContents(editor, fullAllOnData),
        TableTestUtils.sClickDialogButton('filled dialog with full details', true),
        TableTestUtils.sAssertApproxElementStructure(editor, 'table', htmlFilledAllOnTable),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, fullAllOnData),
        TableTestUtils.sSetDialogContents(editor, emptyAllOnData),
        TableTestUtils.sClickDialogButton('cancelling dialog', true),
        TableTestUtils.sAssertElementStructure(editor, 'table', htmlEmptyTable),
        tinyApis.sDeleteSetting('table_class_list')
      ]);
    };

    const execCommandTest = () => {
      const baseHtml = '<table style="height: 500px; width: 500px; border-width: 1px; border-spacing: 5px; background-color: rgb(0, 0, 255); border-color: rgb(255, 0, 0); border-style: dotted; float: left;"><caption><br></caption><tbody><tr><td>X</td></tr></tbody></table>';

      const baseData = {
        width: '500px',
        height: '500px',
        cellspacing: '5px',
        cellpadding: '5px',
        border: '1px',
        caption: 'checked',
        align: 'left',
        class: 'dog',
        borderstyle: 'dotted',
        bordercolor: '#ff0000',
        backgroundcolor: '#0000ff'
      };

      return Log.stepsAsStep('TBA', 'Table: Open dialog via execCommand', [
        tinyApis.sSetContent(baseHtml),
        sSetCursor,
        tinyApis.sExecCommand('mceTableProps'),
        TableTestUtils.sAssertDialogContents(editor, baseData),
        TableTestUtils.sClickDialogButton('submit dialog', false),
      ]);
    };

    const okCancelTest = () => {

      const baseHtml = '<table><tbody><tr><td>X</td></tr></tbody></table>';

      const baseData = {
        width: '',
        height: '',
        cellspacing: '',
        cellpadding: '',
        border: '',
        caption: 'unchecked',
        align: '',
        class: '',
        borderstyle: '',
        bordercolor: '',
        backgroundcolor: ''
      };

      const newHtml = '<table class="dog" style="width: 500px; height: 500px; float: left; background-color: #0000ff; border: 1px dotted #ff0000; border-spacing: 5px;"><caption>&nbsp;</caption><tbody><tr><td style="border-color: #ff0000; border-width: 1px; padding: 5px;">X</td></tr></tbody></table>';

      const newData = {
        width: '500px',
        height: '500px',
        cellspacing: '5px',
        cellpadding: '5px',
        border: '1px',
        caption: 'checked',
        align: 'left',
        class: 'dog',
        borderstyle: 'dotted',
        bordercolor: '#ff0000',
        backgroundcolor: '#0000ff'
      };

      return Log.stepsAsStep('TBA', 'Table: Test cancel changes nothing and ok does', [
        tinyApis.sSetSetting('table_class_list', [
          {title: 'None', value: ''},
          {title: 'Dog', value: 'dog'},
          {title: 'Cat', value: 'cat'}
        ]),
        tinyApis.sSetSetting('table_advtab', true),
        tinyApis.sSetSetting('table_style_by_css', true),
        tinyApis.sSetContent(baseHtml),
        sSetCursor,
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, baseData),
        TableTestUtils.sClickDialogButton('click cancel', false),
        tinyApis.sAssertContent(baseHtml),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, baseData),
        TableTestUtils.sSetDialogContents(editor, newData),
        TableTestUtils.sClickDialogButton('submit dialog', true),
        tinyApis.sAssertContent(newHtml),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogContents(editor, newData),
      ]);
    };

    Pipeline.async({}, [
      standardOkTest(),
      standardFillOkTest(),
      allOffOkTest(),
      allOnOkTest(),
      okCancelTest(),
      execCommandTest()
    ], onSuccess, onFailure);
  }, {
      plugins: 'table',
      toolbar: 'tableprops',
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide',
      indent: false,
      valid_styles: {
        '*': 'width,height,vertical-align,text-align,float,border-color,border-width,background-color,border,padding,border-spacing,border-collapse,border-style'
      },
      table_advtab: false
    }, success, failure);
});