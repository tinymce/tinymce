import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { pAssertStyleCanBeToggledOnAndOff } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableBorderWidthTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellborderwidth',
    base_url: '/project/tinymce/js/tinymce',
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
  }, [ Plugin, Theme ], true);

  it('TINY-7478: Ensure the table border width adds and removes it as expected with a single cell', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Border width', '1PX', 2, 1, 1, 'border-width: 1px')
  );

  it('TINY-7478: Ensure the table border width adds and removes it as expected with multiple cells', async () =>
    await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Border width', '1PX', 2, 2, 2, 'border-width: 1px')
  );
});
