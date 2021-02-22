import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableDefaultStylesTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, [ Plugin, Theme ], true);

  it('no styles without setting', async () => {
    const editor = hook.editor();
    editor.setContent('');
    await TableTestUtils.pInsertTableViaGrid(editor, 1, 1);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
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
                    width: str.contains('%')
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
    })));
  });

  it('test default style border attribute', async () => {
    const editor = hook.editor();
    editor.settings.table_default_styles = { border: '3px solid blue' };
    editor.setContent('');
    await TableTestUtils.pInsertTableViaGrid(editor, 1, 1);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
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
    })));
  });
});
