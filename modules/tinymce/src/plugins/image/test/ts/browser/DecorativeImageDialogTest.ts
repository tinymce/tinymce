import { FocusTools, Keyboard, Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.image.DescriptiveImageDialogTest', (success, failure) => {

  SilverTheme();
  Plugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const doc = Element.fromDom(document);

    const sPressTab = Keyboard.sKeydown(doc, Keys.tab(), {});
    const sPressEsc = Keyboard.sKeydown(doc, Keys.escape(), {});

    const sAssertFocused = (name, selector) => {
      return FocusTools.sTryOnSelector(name, doc, selector);
    };

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Insert Image Dialog basic keyboard navigation cycle ', [
        api.sExecCommand('mceImage'),
        sAssertFocused('Source', '.tox-textfield'),
        sPressTab,
        sAssertFocused('Descriptive', '.tox-checkbox__input'),
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
        sPressEsc,
      ]),
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    a11y_advanced_options: true
  }, success, failure);
});
