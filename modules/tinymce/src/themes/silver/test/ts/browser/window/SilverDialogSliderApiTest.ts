import { FocusTools, Keys, TestStore } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogSliderApiTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const dialogSpec: Dialog.DialogSpec<{ sliderField: number }> = {
    title: 'Silver Dialog Test Slider Api',
    body: {
      type: 'panel',
      items: [
        {
          type: 'slider',
          name: 'sliderField',
          label: 'Slider label',
          min: 0,
          max: 100
        }
      ]
    },
    initialData: {
      sliderField: 50
    },
    onChange: () => {
      store.add('logOnChangeEvent');
    }
  };

  Arr.each([
    { label: 'Modal', params: { }},
    { label: 'Inline', params: { inline: 'toolbar' as 'toolbar' }}
  ], (test) => {
    context(test.label, () => {
      it('TINY-10428: dialog onChange handler should fire when using arrow key on slider', async () => {
        store.clear();
        const editor = hook.editor();
        DialogUtils.open(editor, dialogSpec, test.params);
        await TinyUiActions.pWaitForDialog(editor);

        await FocusTools.pTryOnSelector('Focus should be on slider rail', SugarDocument.getDocument(), '.tox-slider__rail');
        TinyUiActions.keydown(editor, Keys.left());

        store.assertEq('Check if on change event is logged after using arrow key', [ 'logOnChangeEvent' ]);
      });
    });
  });
});
