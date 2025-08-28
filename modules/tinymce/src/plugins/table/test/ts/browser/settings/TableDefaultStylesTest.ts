import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableDefaultStylesTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false,
  }, [ Plugin ], true);

  it('no styles without setting (no colgroup)', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('table_use_colgroups', false);
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
    editor.options.unset('table_use_colgroups');
  });

  it('no styles without setting (colgroup)', async () => {
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
        s.element('colgroup', {
          children: [
            s.element('col', {
              styles: {
                width: str.contains('%')
              },
            })
          ]
        }),
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

  it('test default style border attribute', async () => {
    const editor = hook.editor();
    editor.options.set('table_default_styles', { border: '3px solid blue' });
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
        s.element('colgroup', {
          children: [
            s.element('col', {
              styles: {
                width: str.none('Should not have default width')
              },
            })
          ]
        }),
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
    editor.options.unset('table_default_styles');
  });
});
