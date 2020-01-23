import { Chain, GeneralSteps, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attr, Body } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { cFillActiveDialog, generalTabSelectors, ImageDialogData } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.A11yImageTest', (success, failure) => {
  SilverTheme();
  Plugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    const sInitAndOpenDialog = (content: string, cursorPos: any) => {
      return GeneralSteps.sequence([
        api.sSetSetting('image_advtab', true),
        api.sSetSetting('image_dimensions', false),
        api.sSetContent(content),
        api.sSetCursor(cursorPos.elementPath, cursorPos.offset),
        api.sExecCommand('mceImage', true),
        ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ]);
    };

    const createTestOnEmptyEditor = (name: string, data: Partial<ImageDialogData>, expectedContent: string) => {
      return Log.stepsAsStep('TBA', 'Image: ' + name, [
        sInitAndOpenDialog('', { elementPath: [0], offset: 0 }),
        Chain.asStep({}, [
          cFillActiveDialog(data, true)
        ]),
        ui.sClickOnUi('click save', 'div[role="dialog"] button:contains("Save")'),
        api.sAssertContent(expectedContent)
      ]);
    };

    const suiteArr = [
      Log.stepsAsStep('TBA', 'Check the decorative checkbox toggles the alt text input', [
        sInitAndOpenDialog('', { elementPath: [0], offset: 0 }),
        Chain.asStep({}, [
          Chain.inject(Body.body()),
          UiFinder.cWaitForState('Check alt text input is enabled', generalTabSelectors.alt, (e) => !Attr.has(e, 'disabled'))
        ]),
        ui.sClickOnUi('Click on decorative checkbox', generalTabSelectors.decorative),
        Chain.asStep({}, [
          Chain.inject(Body.body()),
          UiFinder.cWaitForState('Check alt text input is enabled', generalTabSelectors.alt, (e) => Attr.has(e, 'disabled') && Attr.get(e, 'disabled') === 'disabled')
        ]),
        ui.sClickOnUi('Click on decorative checkbox', generalTabSelectors.decorative),
        Chain.asStep({}, [
          Chain.inject(Body.body()),
          UiFinder.cWaitForState('Check alt text input is enabled', generalTabSelectors.alt, (e) => !Attr.has(e, 'disabled'))
        ]),
      ]),
      createTestOnEmptyEditor(
        'Image with alt text',
        {
          alt: 'alt',
          src: {
            value: 'src',
          },
        },
        '<p><img src="src" alt="alt" /></p>'
      ),
      createTestOnEmptyEditor(
        'Decorative image',
        {
          src: {
            value: 'src',
          },
          decorative: true
        },
        '<p><img role="presentation" src="src" alt="" /></p>'
      ),
      createTestOnEmptyEditor(
        'Decorative image (should ignore alt text value)',
        {
          alt: 'alt',
          src: {
            value: 'src',
          },
          decorative: true
        },
        '<p><img role="presentation" src="src" alt="" /></p>'
      ),
    ];
    Pipeline.async({}, suiteArr, onSuccess, onFailure);
  }, {
      theme: 'silver',
      plugins: 'image',
      indent: false,
      base_url: '/project/tinymce/js/tinymce',
      a11y_advanced_options: true
    }, success, failure);
});
