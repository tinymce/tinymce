import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { assertInputValue, generalTabLabels, pSetListBoxItem, pWaitForDialogMeasurements, setInputValue } from '../module/Helpers';

describe('browser.tinymce.plugins.image.ImageListTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: click image list, check that source changes, change source and check that image list changes', async () => {
    const editor = hook.editor();
    editor.options.set('image_list', [
      { title: 'Dog', value: 'mydog.jpg' },
      { title: 'Cat', value: 'mycat.jpg' }
    ]);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    await pSetListBoxItem(generalTabLabels.images, 'Dog');
    await pWaitForDialogMeasurements('mydog.jpg');
    assertInputValue(generalTabLabels.src, 'mydog.jpg');
    setInputValue(generalTabLabels.src, 'mycat.jpg');
    await pWaitForDialogMeasurements('mycat.jpg');
    assertInputValue(generalTabLabels.src, 'mycat.jpg');
  });
});
