import { ApproxStructure } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableDefaultAttributesWithColGroupsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false,
    table_use_colgroups: true
  }, [ Plugin ], true);

  beforeEach(() => {
    hook.editor().setContent('');
  });

  it('TBA: no attributes without setting', async () => {
    const editor = hook.editor();
    await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str) => s.element('table', {
      styles: {
        'width': str.is('100%'),
        'border-collapse': str.is('collapse')
      },
      attrs: {
        border: str.is('1')
      },
      children: TableTestUtils.createTableChildren(s, str, true)
    })));
  });

  it('TBA: test default title attribute', async () => {
    const editor = hook.editor();
    editor.options.set('table_default_attributes', { title: 'x' });
    await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str) => s.element('table', {
      styles: {
        'width': str.is('100%'),
        'border-collapse': str.is('collapse')
      },
      attrs: {
        border: str.none('Should not have the default border'),
        title: str.is('x')
      },
      children: TableTestUtils.createTableChildren(s, str, true)
    })));
  });
});
