import { Assertions, Chain, GeneralSteps, Log, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attr, Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { cFillActiveDialog, generalTabSelectors, ImageDialogData } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.A11yImageTest', (success, failure) => {
  SilverTheme();
  Plugin();

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    const sInitAndOpenDialog = (content: string, cursorPos: any) => GeneralSteps.sequence([
      api.sSetSetting('image_advtab', true),
      api.sSetSetting('image_dimensions', false),
      api.sSetContent(content),
      api.sSetSelection(cursorPos.elementPath, cursorPos.startOffset, cursorPos.elementPath, cursorPos.endOffset),
      api.sExecCommand('mceImage', true),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]')
    ]);

    const createTestOnContent = (name: string, data: Partial<ImageDialogData>, cursorPos: Record<string, number | Array<number>>, initialContent: string, expectedContent: string) => Log.stepsAsStep('TBA', 'Image: ' + name, [
      sInitAndOpenDialog(initialContent, cursorPos),
      Chain.asStep({}, [
        cFillActiveDialog(data, true)
      ]),
      ui.sClickOnUi('click save', 'div[role="dialog"] button:contains("Save")'),
      api.sAssertContent(expectedContent)
    ]);

    const createTestOnEmptyEditor = (name: string, data: Partial<ImageDialogData>, expectedContent: string) => createTestOnContent(name, data, { elementPath: [ 0 ], startOffset: 0, endOffset: 0 }, '', expectedContent);

    const testUiStateDisabled = Log.stepsAsStep('FOAM-11', 'Test image UI state', [
      api.sExecCommand('mceImage', true),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      UiFinder.sExists(Body.body(), generalTabSelectors.alt + ':disabled'),
      ui.sClickOnUi('click save', 'div[role="dialog"] button:contains("Save")'),
      UiFinder.sNotExists(Body.body(), 'div[role="dialog"]')
    ]);

    const testUiStateEnabled = (alt: string) => Log.stepsAsStep('FOAM-11', 'Test image UI state', [
      api.sExecCommand('mceImage', true),
      ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      Chain.asStep(Body.body(), [
        UiFinder.cFindIn(generalTabSelectors.alt),
        UiControls.cGetValue,
        Assertions.cAssertEq('Assert input value', alt)
      ]),
      ui.sClickOnUi('click save', 'div[role="dialog"] button:contains("Save")'),
      UiFinder.sNotExists(Body.body(), 'div[role="dialog"]')
    ]);

    const suiteArr = [
      Log.stepsAsStep('TBA', 'Check the decorative checkbox toggles the alt text input', [
        sInitAndOpenDialog('', { elementPath: [ 0 ], offset: 0 }),
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
        ui.sClickOnUi('click save', 'div[role="dialog"] button:contains("Save")'),
        UiFinder.sNotExists(Body.body(), 'div[role="dialog"]')
      ]),
      createTestOnEmptyEditor(
        'Image with alt text',
        {
          alt: 'alt',
          src: {
            value: 'src'
          }
        },
        '<p><img src="src" alt="alt" /></p>'
      ),
      testUiStateEnabled('alt'),
      createTestOnEmptyEditor(
        'Decorative image',
        {
          src: {
            value: 'src'
          },
          decorative: true
        },
        '<p><img role="presentation" src="src" alt="" /></p>'
      ),
      testUiStateDisabled,
      createTestOnEmptyEditor(
        'Decorative image (should ignore alt text value)',
        {
          alt: 'alt',
          src: {
            value: 'src'
          },
          decorative: true
        },
        '<p><img role="presentation" src="src" alt="" /></p>'
      ),
      testUiStateDisabled,
      createTestOnContent(
        'Decorative image to informative image',
        {
          alt: 'alt',
          src: {
            value: 'src'
          },
          decorative: false
        },
        { elementPath: [ 0 ], startOffset: 0, endOffset: 1 },
        '<p><img role="presentation" src="src" alt="" /></p>',
        '<p><img src="src" alt="alt" /></p>'
      ),
      testUiStateEnabled('alt'),
      createTestOnContent(
        'Informative image to decorative image',
        {
          alt: 'alt',
          src: {
            value: 'src'
          },
          decorative: true
        },
        { elementPath: [ 0 ], startOffset: 0, endOffset: 1 },
        '<p><img src="src" alt="alt" /></p>',
        '<p><img role="presentation" src="src" alt="" /></p>',
      ),
      testUiStateDisabled
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
