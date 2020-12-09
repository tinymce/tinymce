import { FocusTools, Keyboard, Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.image.DialogTest', (success, failure) => {

  SilverTheme();
  Plugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const doc = SugarElement.fromDom(document);

    const sPressTab = Keyboard.sKeydown(doc, Keys.tab(), {});
    const sPressEsc = Keyboard.sKeydown(doc, Keys.escape(), {});
    const sPressDown = Keyboard.sKeydown(doc, Keys.down(), {});

    const sAssertFocused = (name, selector) => FocusTools.sTryOnSelector(name, doc, selector);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Insert Image Dialog basic cycle ', [
        api.sExecCommand('mceImage'),
        sAssertFocused('Source', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Description', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Width', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Height', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Constraint proportions', 'button.tox-lock'),
        sPressTab,
        sAssertFocused('Cancel', 'button.tox-button:contains("Cancel")'),
        sPressTab,
        sAssertFocused('Save', 'button.tox-button:contains("Save")'),
        sPressEsc
      ]),

      Log.stepsAsStep('TBA', 'Insert Image Dialog with filepicker cycle', [
        api.sSetSetting('image_advtab', true),
        api.sExecCommand('mceImage'),
        sAssertFocused('Tab', '.tox-dialog__body-nav-item:contains("General")'),
        sPressTab,
        sAssertFocused('Source', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Description', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Width', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Height', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Constraint proportions', 'button.tox-lock'),
        sPressTab,
        sAssertFocused('Cancel', 'button.tox-button:contains("Cancel")'),
        sPressTab,
        sAssertFocused('Save', 'button.tox-button:contains("Save")'),
        sPressEsc
      ]),

      Log.stepsAsStep('TBA', 'Insert Image Dialog with all options', [
        api.sSetSetting('file_picker_callback', Fun.noop),
        api.sSetSetting('image_class_list', [{ title: 'sample', value: 'sample' }]),
        api.sSetSetting('image_list', [{ title: 'sample', value: 'sample' }]),
        api.sSetSetting('image_caption', true),
        api.sExecCommand('mceImage'),
        sAssertFocused('Tab', '.tox-dialog__body-nav-item:contains("General")'),
        sPressTab,
        sAssertFocused('Source', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Source button', '.tox-browse-url'),
        sPressTab,
        sAssertFocused('Image list', '.tox-listbox'),
        sPressTab,
        sAssertFocused('Description', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Width', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Height', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Constraint proportions', 'button.tox-lock'),
        sPressTab,
        sAssertFocused('Class', '.tox-listbox'),
        sPressTab,
        sAssertFocused('Caption', 'input.tox-checkbox__input'),
        sPressTab,
        sAssertFocused('Cancel', 'button.tox-button:contains("Cancel")'),
        sPressTab,
        sAssertFocused('Save', 'button.tox-button:contains("Save")'),
        sPressEsc
      ]),

      Log.stepsAsStep('TBA', 'Insert Image Dialog with advanced tab', [
        api.sExecCommand('mceImage'),
        sAssertFocused('Tab', '.tox-dialog__body-nav-item:contains("General")'),
        sPressDown,
        sAssertFocused('Tab', '.tox-dialog__body-nav-item:contains("Advanced")'),
        sPressTab,
        sAssertFocused('Style', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Vertical space', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Horizontal space', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Border width', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Border style', '.tox-listbox'),
        sPressTab,
        sAssertFocused('Cancel', 'button.tox-button:contains("Cancel")'),
        sPressTab,
        sAssertFocused('Save', 'button.tox-button:contains("Save")'),
        sPressEsc
      ]),

      Log.stepsAsStep('TBA', 'Insert Image Dialog with upload tab', [
        api.sSetSetting('images_upload_url', '/custom/imageUpload'),
        api.sExecCommand('mceImage'),
        sAssertFocused('General tab', '.tox-dialog__body-nav-item:contains("General")'),
        sPressDown,
        sAssertFocused('Advanced tab', '.tox-dialog__body-nav-item:contains("Advanced")'),
        sPressDown,
        sAssertFocused('Upload tab', '.tox-dialog__body-nav-item:contains("Upload")'),
        sPressTab,
        sAssertFocused('Browse for an image', '.tox-dropzone button.tox-button'),
        sPressTab,
        sAssertFocused('Cancel', 'button.tox-button:contains("Cancel")'),
        sPressTab,
        sAssertFocused('Save', 'button.tox-button:contains("Save")'),
        sPressEsc
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
