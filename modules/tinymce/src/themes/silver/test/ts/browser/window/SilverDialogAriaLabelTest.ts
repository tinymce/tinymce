import { Chain, GeneralSteps, Logger, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Attribute, SugarBody, SugarElement } from '@ephox/sugar';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import Theme from 'tinymce/themes/silver/Theme';
import * as DialogUtils from '../../module/DialogUtils';

UnitTest.asynctest('WindowManager:inline-dialog Test', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const cGetDialogLabelId = Chain.binder((dialogE: SugarElement) => {
      if (Attribute.has(dialogE, 'aria-labelledby')) {
        const labelId = Attribute.get(dialogE, 'aria-labelledby');
        return labelId.length > 0 ? Result.value(labelId) : Result.error('Dialog has zero length aria-labelledby attribute');
      } else {
        return Result.error('Dialog has no aria-labelledby attribute');
      }
    });

    const sAssertDialogLabelledBy = Chain.asStep(SugarBody.body(), [ NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn('[role="dialog"]'), 'dialog'),
      NamedChain.direct('dialog', cGetDialogLabelId, 'labelId'),
      NamedChain.bundle((obj) => UiFinder.findIn(obj.dialog, `#${obj.labelId}`))
    ]) ]);

    const dialogSpec: Dialog.DialogSpec<{}> = {
      title: 'Silver Test Inline (Toolbar) Dialog',
      body: {
        type: 'panel',
        items: []
      },
      buttons: [],
      initialData: {}
    };

    const sTestDialogLabelled = (params: { inline?: string }) =>
      Logger.t(
        `Dialog should have "aria-labelledby" for config "${JSON.stringify(params)}"`, GeneralSteps.sequence([
          DialogUtils.sOpen(editor, dialogSpec, params),
          sAssertDialogLabelledBy,
          DialogUtils.sClose
        ])
      );

    Pipeline.async({}, [
      TestHelpers.GuiSetup.mAddStyles(SugarElement.fromDom(document), [
        '.tox-dialog { background: white; border: 2px solid black; padding: 1em; margin: 1em; }'
      ]),
      sTestDialogLabelled({ inline: 'toolbar' }),
      sTestDialogLabelled({ inline: 'not-inline!!' }),
      TestHelpers.GuiSetup.mRemoveStyles
    ], onSuccess, onFailure);
  },
  {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
