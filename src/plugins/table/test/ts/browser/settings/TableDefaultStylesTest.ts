import { GeneralSteps, Logger, Pipeline, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableDefaultStylesTest', (success, failure) => {
  ModernTheme();
  TablePlugin();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('no styles without setting', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
        tinyUi.sClickOnUi('click table grid', 'td[role="gridcell"]:first a'),
        TableTestUtils.sAssertTableStructure(editor, ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              'width': str.is('100%'),
              'border-collapse': str.is('collapse')
            },
            attrs: {
              border: str.is('1')
            },
            children: [
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        styles: {
                          width: str.is('100%')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        })),
        tinyApis.sSetContent('')
      ])),

      Logger.t('test default style border attribute', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('table_default_styles', { border: '3px solid blue' }),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
        tinyUi.sClickOnUi('click table grid', 'td[role="gridcell"]:first a'),
        TableTestUtils.sAssertTableStructure(editor, ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              'width': str.none('Should not have default width'),
              'border-collapse': str.none('Should not have default border-collapse'),
              'border': str.is('3px solid blue')
            },
            attrs: {
              border: str.is('1')
            },
            children: [
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        styles: {
                          width: str.none('Should not have default width')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        })),
        tinyApis.sSetContent('')
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'table',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
