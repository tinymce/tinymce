import { UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarBody, SugarDocument, SugarElement, TextContent } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogAriaLabelTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-dialog { background: white; border: 2px solid black; padding: 1em; margin: 1em; }'
  ]);

  const dialogSpec: Dialog.DialogSpec<{}> = {
    title: 'Silver Test Inline (Toolbar) Dialog',
    body: {
      type: 'panel',
      items: []
    },
    buttons: [],
    initialData: {}
  };

  const os = PlatformDetection.detect().os;

  const getDialogLabelId = (dialog: SugarElement<HTMLElement>) => {
    if (Attribute.has(dialog, 'aria-labelledby')) {
      return Attribute.getOpt(dialog, 'aria-labelledby')
        .filter((labelId) => labelId.length > 0)
        .getOrDie('Dialog has zero length aria-labelledby attribute');
    } else {
      throw new Error('Dialog has no aria-labelledby attribute');
    }
  };

  const getAndAssertDialogAriaLabel = (dialog: SugarElement<HTMLElement>) => {
    if (Attribute.has(dialog, 'aria-label')) {
      return Attribute.getOpt(dialog, 'aria-label')
        .filter((labelId) => labelId.length > 0)
        .getOrDie('Dialog has zero length aria-label attribute');
    } else {
      throw new Error('Dialog has no aria-label attribute');
    }
  };

  const assertDialogLabelledBy = () => {
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '[role="dialog"]').getOrDie();
    const labelId = getDialogLabelId(dialog);
    UiFinder.exists(dialog, `#${labelId}`);
  };

  const assertDialogAriaLabel = () => {
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '[role="dialog"]').getOrDie();
    const ariaLabelAttribute = getAndAssertDialogAriaLabel(dialog);
    const dialogTitle = TextContent.get(UiFinder.findIn<HTMLElement>(dialog, 'h1').getOrDie());
    assert.equal(ariaLabelAttribute, dialogTitle, 'Dialog aria-label should match the dialog title');
  };

  Arr.each([
    { label: 'Modal', params: { }},
    { label: 'Inline', params: { inline: 'toolbar' as 'toolbar' }}
  ], (test) => {
    context(test.label, () => {
      it(`Dialog should have "aria-label" or "aria-labelledby" for config "${JSON.stringify(test.params)}"`, () => {
        const editor = hook.editor();
        DialogUtils.open(editor, dialogSpec, test.params);
        os.isMacOS() ? assertDialogAriaLabel() : assertDialogLabelledBy();
        DialogUtils.close(editor);
      });
    });
  });
});
