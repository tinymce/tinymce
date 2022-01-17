import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import { pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableCellBackgroundColorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellbackgroundcolor',
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      table: { title: 'Table', items: 'tablecellbackgroundcolor' },
    },
    menubar: 'table',
    table_background_color_map: [
      {
        title: 'Color',
        value: '#51a951',
      }
    ],
  }, [ Plugin ], true);

  it('TINY-7476: The color should be changed for a single cell', async () => {
    await pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks(hook.editor(), {
      menuTitle: 'Background color',
      subMenuTitle: 'Color',
      subMenuRemoveTitle: 'Remove color',
      rows: 1,
      columns: 1,
      customStyle: 'background-color: rgb(81, 169, 81)'
    });
  });

  it('TINY-7476: The color should be changed for many cells', async () => {
    await pAssertStyleCanBeToggledOnAndOffWithoutCheckmarks(hook.editor(), {
      menuTitle: 'Background color',
      subMenuTitle: 'Color',
      subMenuRemoveTitle: 'Remove color',
      rows: 2,
      columns: 2,
      customStyle: 'background-color: rgb(81, 169, 81)'
    });
  });
});
