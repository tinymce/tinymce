import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
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
    table_border_styles: [
      {
        title: 'Solid',
        value: 'solid'
      },
      {
        title: 'None',
        value: ''
      },
    ]
  }, [ Plugin, Theme ], true);

  it('TINY-7478: Ensure the table border style adds and removes it as expected for a single cell', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Border style', 'Solid', 2, 1, 1, 'border-style: solid')
  );

  it('TINY-7478: Ensure the table border style adds and removes it as expected for multiple cells', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Border style', 'Solid', 2, 2, 2, 'border-style: solid')
  );
});
