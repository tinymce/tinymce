import { GeneralSteps, Logger, Pipeline, ApproxStructure, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

/* This requires a menubar. Cannot migrate yet. */
UnitTest.asynctest('browser.tinymce.plugins.table.TableDefaultAttributesTest', (success, failure) => {
  TablePlugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const tableBody2By2 = (s, str, arr) => s.element('tbody', {
      children: [
        s.element('tr', {
          children: [
            s.element('td', {
              styles: {
                width: str.is('50%')
              },
              children: [
                s.element('br', {})
              ]
            }),
            s.element('td', {
              styles: {
                width: str.is('50%')
              },
              children: [
                s.element('br', {})
              ]
            })
          ]
        }),
        s.element('tr', {
          children: [
            s.element('td', {
              styles: {
                width: str.is('50%')
              },
              children: [
                s.element('br', {})
              ]
            }),
            s.element('td', {
              styles: {
                width: str.is('50%')
              },
              children: [
                s.element('br', {})
              ]
            })
          ]
        })
      ]
    });

    Pipeline.async({}, [
      Logger.t('no attributes without setting', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        Waiter.sTryUntil('click table menu', tinyUi.sClickOnUi('click table menu', 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")')),
        Waiter.sTryUntil('click table grid', tinyUi.sClickOnUi('click table grid', 'div.tox-insert-table-picker div[role="button"]:nth(11)')), // button for 2x2 table
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
              tableBody2By2(s, str, arr)
            ]
          });
        })),
        tinyApis.sSetContent('')
      ])),

      Logger.t('test default title attribute', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyApis.sSetSetting('table_default_attributes', { title: 'x' }),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        Waiter.sTryUntil('click table menu', tinyUi.sClickOnUi('click table menu', 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")'), 10, 1000),
        Waiter.sTryUntil('click table grid', tinyUi.sClickOnUi('click table grid', 'div.tox-insert-table-picker div[role="button"]:nth(11)'), 10, 1000), // button for 2x2 table
        TableTestUtils.sAssertTableStructure(editor, ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              'width': str.is('100%'),
              'border-collapse': str.is('collapse')
            },
            attrs: {
              border: str.none('Should not have the default border'),
              title: str.is('x')
            },
            children: [
              tableBody2By2(s, str, arr)
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
    statusbar: false
  }, success, failure);
});
