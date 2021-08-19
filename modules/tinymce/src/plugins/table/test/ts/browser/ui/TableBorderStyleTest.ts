import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { pAssertStyleCanBeToggledOnAndOff } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableBorderStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellborderstyle',
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      table: { title: 'Table', items: 'tablecellborderstyle' },
    },
    menubar: 'table',
    table_border_styles: [
      {
        text: 'Solid',
        value: 'solid'
      },
      {
        text: 'None',
        value: ''
      },
    ]
  }, [ Plugin, Theme ], true);

  it('TINY-7478: Ensure the table border style adds and removes it as expected for a single cell', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
      menuTitle: 'Border style',
      subMenuTitle: 'Solid',
      subMenuRemoveTitle: 'None',
      checkMarkEntries: 2,
      rows: 1,
      columns: 1,
      customStyle: 'border-style: solid'
    })
  );

  it('TINY-7478: Ensure the table border style adds and removes it as expected for multiple cells', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
      menuTitle: 'Border style',
      subMenuTitle: 'Solid',
      subMenuRemoveTitle: 'None',
      checkMarkEntries: 2,
      rows: 2,
      columns: 2,
      customStyle: 'border-style: solid'
    })
  );
});
