import { Chain, FocusTools, Keyboard, Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { ApiChains, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import {
  cAssertCleanHtml, cAssertInputCheckbox, cAssertInputValue, cFillActiveDialog, cSubmitDialog, cWaitForDialog, generalTabSelectors
} from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.DescriptiveImageDialogTest', (success, failure) => {

  SilverTheme();
  Plugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const doc = Element.fromDom(document);

    const sPressTab = Keyboard.sKeydown(doc, Keys.tab(), {});
    const sPressEsc = Keyboard.sKeydown(doc, Keys.escape(), {});

    const sAssertFocused = (name, selector) => FocusTools.sTryOnSelector(name, doc, selector);

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
        sPressEsc
      ]),
      Log.chainsAsStep('TBA', 'Image update with empty alt should remove the existing alt attribute', [
        Chain.inject(editor),
        ApiChains.cSetContent('<p><img src="#1" alt="alt1" /></p>'),
        ApiChains.cSetSelection([ 0 ], 0, [ 0 ], 1),
        ApiChains.cExecCommand('mceImage', true),
        cWaitForDialog(),
        Chain.fromParent(Chain.identity, [
          cAssertInputValue(generalTabSelectors.src, '#1'),
          cAssertInputValue(generalTabSelectors.alt, 'alt1')
        ]),
        cFillActiveDialog({
          src: {
            value: 'src'
          },
          alt: ''
        }),
        cSubmitDialog(),
        cAssertCleanHtml('Checking output', '<p><img src="src" /></p>')
      ]),
      Log.chainsAsStep('TBA', 'Image update with decorative toggled on should produce empty alt and role=presentation', [
        Chain.inject(editor),
        ApiChains.cSetContent('<p><img src="#1" alt="alt1" /></p>'),
        ApiChains.cSetSelection([ 0 ], 0, [ 0 ], 1),
        ApiChains.cExecCommand('mceImage', true),
        cWaitForDialog(),
        Chain.fromParent(Chain.identity, [
          cAssertInputValue(generalTabSelectors.src, '#1'),
          cAssertInputValue(generalTabSelectors.alt, 'alt1'),
          cAssertInputCheckbox(generalTabSelectors.decorative, false)
        ]),
        cFillActiveDialog({
          decorative: true
        }),
        cSubmitDialog(),
        cAssertCleanHtml('Checking output', '<p><img role="presentation" src="#1" alt="" /></p>')
      ]),
      Log.chainsAsStep('TBA', 'Image update with decorative toggled off should produce empty alt and role=presentation', [
        Chain.inject(editor),
        ApiChains.cSetContent('<p><img role="presentation" src="#1" alt="" /></p>'),
        ApiChains.cSetSelection([ 0 ], 0, [ 0 ], 1),
        ApiChains.cExecCommand('mceImage', true),
        cWaitForDialog(),
        Chain.fromParent(Chain.identity, [
          cAssertInputValue(generalTabSelectors.src, '#1'),
          cAssertInputValue(generalTabSelectors.alt, ''),
          cAssertInputCheckbox(generalTabSelectors.decorative, true)
        ]),
        cFillActiveDialog({
          decorative: false
        }),
        cSubmitDialog(),
        cAssertCleanHtml('Checking output', '<p><img src="#1" /></p>')
      ])
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
