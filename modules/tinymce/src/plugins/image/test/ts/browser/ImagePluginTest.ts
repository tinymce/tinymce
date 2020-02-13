import { Chain, GeneralSteps, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { advancedTabSelectors, cAssertInputValue, cFillActiveDialog, cSetInputValue, ImageDialogData } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.ImagePluginTest', (success, failure) => {
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
        // api.sSetCursor([0], 1),
        api.sSetCursor(cursorPos.elementPath, cursorPos.offset),
        api.sExecCommand('mceImage', true),
        ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
      ]);
    };

    const createTestWithContent = (name: string, content: string, cursorPos: any, data: Partial<ImageDialogData>, expectedContent: string) => {
      return Log.stepsAsStep('TBA', 'Image: ' + name, [
        sInitAndOpenDialog(content, cursorPos),
        Chain.asStep({}, [
          cFillActiveDialog(data, true)
        ]),
        ui.sClickOnUi('click save', 'div[role="dialog"] button:contains("Save")'),
        api.sAssertContent(expectedContent)
      ]);
    };

    const createTestOnEmptyEditor = (name: string, data: Partial<ImageDialogData>, expectedContent: string) => {
      return createTestWithContent(name, '', { elementPath: [0], offset: 0 }, data, expectedContent);
    };

    const createTestUpdatedStyle = (name: string, style: string, assertion: Step<any, any>) => {
      return Log.stepsAsStep('TBA', 'Image: ' + name, [
        sInitAndOpenDialog('', { elementPath: [0], offset: 0 }),
        ui.sClickOnUi('Switch to Advanced tab', '.tox-tab:contains("Advanced")'),
        Chain.asStep(Body.body(), [
          cSetInputValue(advancedTabSelectors.style, style)
        ]),
        assertion,
        ui.sClickOnUi('click save', 'div[role="dialog"] button:contains("Save")'),
      ]);
    };

    const suiteArr = [
      createTestOnEmptyEditor(
        'Advanced image dialog margin space options on empty editor',
        {
          alt: 'alt',
          hspace: '10',
          src: {
            value: 'src',
          },
          vspace: '10'
        },
        '<p><img style="margin: 10px;" src="src" alt="alt" /></p>'
      ),
      createTestOnEmptyEditor(
        'Advanced image dialog border style only options on empty editor',
        {
          alt: 'alt',
          src: {
            value: 'src'
          },
          style: 'border-width: 10px; border-style: solid;'
        },
        '<p><img style="border-width: 10px; border-style: solid;" src="src" alt="alt" /></p>'
      ),
      createTestOnEmptyEditor(
        'Advanced image dialog margin style only options on empty editor',
        {
          alt: 'alt',
          src: {
            value: 'src'
          },
          style: 'margin: 10px;'
        },
        '<p><img style="margin: 10px;" src="src" alt="alt" /></p>'
      ),
      createTestOnEmptyEditor(
        'Advanced image dialog overriden border style options on empty editor',
        {
          alt: 'alt',
          border: '10',
          src: {
            value: 'src'
          },
          style: 'border-width: 15px;'
        },
        '<p><img style="border-width: 10px;" src="src" alt="alt" /></p>'
      ),
      createTestOnEmptyEditor(
        'Advanced image dialog overriden margin style options on empty editor',
        {
          alt: 'alt',
          hspace: '10',
          src: {
            value: 'src'
          },
          style: 'margin-left: 15px; margin-top: 20px;',
          vspace: '10'
        },
        '<p><img style="margin: 10px;" src="src" alt="alt" /></p>'
      ),
      createTestWithContent(
        'Advanced image dialog border option on editor with content',
        '<p>a</p>',
        {
          elementPath: [0],
          offset: 1
        },
        {
          alt: 'alt',
          border: '10',
          borderstyle: 'dashed',
          src: {
            value: 'src'
          }
        },
        '<p>a<img style="border-width: 10px; border-style: dashed;" src="src" alt="alt" /></p>'),
      createTestUpdatedStyle(
        'Advanced image dialog non-shorthand horizontal margin style change test',
        'margin-left: 15px; margin-right: 15px;',
        Chain.asStep({}, [
          cAssertInputValue(advancedTabSelectors.vspace, ''),
          cAssertInputValue(advancedTabSelectors.hspace, '15'),
          cAssertInputValue(advancedTabSelectors.style, 'margin-left: 15px; margin-right: 15px;')
        ])
      ),
      createTestUpdatedStyle(
        'Advanced image dialog non-shorthand vertical margin style change test',
        'margin-top: 15px; margin-bottom: 15px;',
        Chain.asStep({}, [
          cAssertInputValue(advancedTabSelectors.vspace, '15'),
          cAssertInputValue(advancedTabSelectors.hspace, ''),
          cAssertInputValue(advancedTabSelectors.style, 'margin-top: 15px; margin-bottom: 15px;')
        ])
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 1 value style change test',
        'margin: 5px;',
        Chain.asStep({}, [
          cAssertInputValue(advancedTabSelectors.vspace, '5'),
          cAssertInputValue(advancedTabSelectors.hspace, '5'),
          cAssertInputValue(advancedTabSelectors.style, 'margin: 5px;')
        ])
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 2 value style change test',
        'margin: 5px 10px;',
        Chain.asStep({}, [
          cAssertInputValue(advancedTabSelectors.vspace, '5'),
          cAssertInputValue(advancedTabSelectors.hspace, '10'),
          cAssertInputValue(advancedTabSelectors.style, 'margin: 5px 10px 5px 10px;')
        ])
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 3 value style change test',
        'margin: 5px 10px 15px;',
        Chain.asStep({}, [
          cAssertInputValue(advancedTabSelectors.vspace, ''),
          cAssertInputValue(advancedTabSelectors.hspace, '10'),
          cAssertInputValue(advancedTabSelectors.style, 'margin: 5px 10px 15px 10px;')
        ])
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 4 value style change test',
        'margin: 5px 10px 15px 20px;',
        Chain.asStep({}, [
          cAssertInputValue(advancedTabSelectors.vspace, ''),
          cAssertInputValue(advancedTabSelectors.hspace, ''),
          cAssertInputValue(advancedTabSelectors.style, 'margin: 5px 10px 15px 20px;')
        ])
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 4 value style change test',
        'margin: 5px 10px 15px 20px; margin-top: 15px;',
        Chain.asStep({}, [
          cAssertInputValue(advancedTabSelectors.vspace, '15'),
          cAssertInputValue(advancedTabSelectors.hspace, ''),
          cAssertInputValue(advancedTabSelectors.style, 'margin: 15px 10px 15px 20px;')
        ])
      )
    ];
    Pipeline.async({}, suiteArr, onSuccess, onFailure);
  }, {
      theme: 'silver',
      plugins: 'image',
      indent: false,
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure);
});
