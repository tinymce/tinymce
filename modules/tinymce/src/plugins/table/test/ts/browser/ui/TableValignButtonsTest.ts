import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { pAssertStyleCanBeToggledOnAndOff } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableValignButtonsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecellvalign',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin, Theme ], true);

  context('Test for a single cell selection', () => {
    it('TINY-7477: Check that valign works for Top value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Vertical align', 'Top', 4, 1, 1, 'vertical-align: top')
    );

    it('TINY-7477: Check that valign works for Middle value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Vertical align', 'Middle', 4, 1, 1, 'vertical-align: middle')
    );

    it('TINY-7477: Check that valign works for Bottom value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Vertical align', 'Bottom', 4, 1, 1, 'vertical-align: bottom')
    );
  });

  context('Test for multiple cell selection', () => {
    it('TINY-7477: Check that valign works for Top value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Vertical align', 'Top', 4, 2, 2, 'vertical-align: top')
    );

    it('TINY-7477: Check that valign works for Middle value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Vertical align', 'Middle', 4, 2, 2, 'vertical-align: middle')
    );

    it('TINY-7477: Check that valign works for Bottom value', async () =>
      await pAssertStyleCanBeToggledOnAndOff(hook.editor(), 'Vertical align', 'Bottom', 4, 2, 2, 'vertical-align: bottom')
    );
  });
});
