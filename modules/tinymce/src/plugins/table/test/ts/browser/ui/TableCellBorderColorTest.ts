import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import { pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableCellBorderColorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellbordercolor',
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      table: { title: 'Table', items: 'tablecellbordercolor' },
    },
    menubar: 'table',
    table_border_color_map: [
      {
        title: 'Color',
        value: '#159a15',
      }
    ],
  }, [ Plugin ], true);

  it('TINY-7476: The color should be changed for a single cell', async () => {
    await pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks(hook.editor(), {
      menuTitle: 'Border color',
      subMenuTitle: 'Color',
      subMenuRemoveTitle: 'Remove color',
      rows: 1,
      columns: 1,
      customStyle: 'border-color: rgb(21, 154, 21)'

    });
  });

  it('TINY-7476: The color should be changed for many cells', async () => {
    await pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks(hook.editor(), {
      menuTitle: 'Border color',
      subMenuTitle: 'Color',
      subMenuRemoveTitle: 'Remove color',
      rows: 2,
      columns: 2,
      customStyle: 'border-color: rgb(21, 154, 21)'

    });
  });
});
