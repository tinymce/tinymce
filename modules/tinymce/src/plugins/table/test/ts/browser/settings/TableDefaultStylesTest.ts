import { GeneralSteps, Logger, Pipeline, ApproxStructure, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

/* This requires a menubar. Cannot migrate yet. */
UnitTest.asynctest('browser.tinymce.plugins.table.TableDefaultStylesTest', (success, failure) => {
  TablePlugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('no styles without setting', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        Waiter.sTryUntil('click table menu', tinyUi.sClickOnUi('click table menu', 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")'), 10, 1000),
        Waiter.sTryUntil('click table grid', tinyUi.sClickOnUi('click table grid', 'div.tox-insert-table-picker div[role="button"]:nth(0)'), 10, 1000), // button for 1x1 table
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
        Waiter.sTryUntil('click table menu', tinyUi.sClickOnUi('click table menu', 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")'), 10, 1000),
        Waiter.sTryUntil('click table grid', tinyUi.sClickOnUi('click table grid', 'div.tox-insert-table-picker div[role="button"]:nth(0)'), 10, 1000), // button for 1x1 table
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
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
