import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import { pAssertStyleCanBeToggledOnAndOff } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableBorderWidthTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellborderwidth',
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      table: { title: 'Table', items: 'tablecellborderwidth' },
    },
    menubar: 'table',
    table_border_widths: [
      {
        title: '1PX',
        value: '1px'
      },
      {
        title: 'None',
        value: ''
      },
    ]
  }, [ Plugin ], true);

  it('TINY-7478: Ensure the table border width adds and removes it as expected with a single cell', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
      menuTitle: 'Border width',
      subMenuTitle: '1PX',
      subMenuRemoveTitle: 'None',
      checkMarkEntries: 2,
      rows: 1,
      columns: 1,
      customStyle: 'border-width: 1px'
    })
  );

  it('TINY-7478: Ensure the table border width adds and removes it as expected with multiple cells', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), {
      menuTitle: 'Border width',
      subMenuTitle: '1PX',
      subMenuRemoveTitle: 'None',
      checkMarkEntries: 2,
      rows: 2,
      columns: 2,
      customStyle: 'border-width: 1px'
    })
  );
});
