import { Assertions, Chain, Logger, Mouse, Pipeline, UiControls, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cFakeEvent } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.ImagePluginTest', (success, failure) => {

  SilverTheme();
  Plugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    const getFrontmostWindow = function () {
      return editor.windowManager.windows[editor.windowManager.windows.length - 1];
    };

    const getDialogData = function () {
      return getFrontmostWindow().getData();
    };

    const setDialogData = function (data) {
      const win = getFrontmostWindow();
      win.setData(data);
    };

    const sAssertDataInApi = function (msg, data) {
      return Logger.t('Assert data in API', Chain.asStep({}, [
        Chain.mapper(function () {
          const oc = getDialogData();
          for (const k in data) {
            Assertions.assertEq(msg + ': Value in [' + k + ']', oc[k], data[k]);
          }
        })
      ]));
    };

    const createTestWithContent = (name: string, content: string, cursorPos: any, data: any, expectedContent: string) => {
      return Log.stepsAsStep('TBA', 'Image: ' + name, [
        api.sSetSetting('image_advtab', true),
        api.sSetSetting('image_dimensions', false),
        api.sSetContent(content),
        api.sExecCommand('mceImage', true),
        ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),

        // api.sSetCursor([0], 1),
        api.sSetCursor(cursorPos.elementPath, cursorPos.offset),
        //
        Chain.asStep({}, [
          ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          Chain.mapper(function (v) {
            setDialogData(data);
          }),
        ]),
        Chain.asStep({}, [
          ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          Mouse.cClickOn('button:contains("Save")')

        ]),
        api.sAssertContent(expectedContent)
      ]);
    };

    const createTestOnEmptyEditor = (name: string, data: any, expectedContent: string) => {
      return Log.stepsAsStep('TBA', 'Image: ' + name, [
        api.sSetSetting('image_advtab', true),
        api.sSetSetting('image_dimensions', false),
        api.sSetContent(''),
        api.sExecCommand('mceImage', true),
        ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
        //
        Chain.asStep({}, [
          ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          Chain.mapper(function (v) {
            setDialogData(data);
          }),
        ]),
        Chain.asStep({}, [
          ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          Mouse.cClickOn('button:contains("Save")')

        ]),
        api.sAssertContent(expectedContent)
      ]);
    };

    const createTestUpdatedStyle = (name: string, style: string, expectedData: any) => {
      return Log.stepsAsStep('TBA', 'Image: ' + name, [
        api.sSetSetting('image_advtab', true),
        api.sSetSetting('image_dimensions', false),
        api.sSetContent(''),
        api.sExecCommand('mceImage', true),
        ui.sWaitForPopup('Wait for Image dialog', 'div[role="dialog"]'),
        ui.sClickOnUi('Switch to Upload tab', '.tox-tab:contains("Advanced")'),
        Chain.asStep({}, [
          ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          UiFinder.cFindIn('label:contains("Style")'),
          Chain.mapper(function (val) {
            const inputElm = document.getElementById(val.dom().htmlFor);
            return TinyDom.fromDom(inputElm);
          }),
          UiControls.cSetValue(style),
          cFakeEvent('input'),
        ]),
        sAssertDataInApi(name, expectedData),
        Chain.asStep({}, [
          ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          Mouse.cClickOn('button:contains("Save")')

        ])
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
            meta: {}
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
            value: 'src',
            meta: {}
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
            value: 'src',
            meta: {}
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
            value: 'src',
            meta: {}
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
            value: 'src',
            meta: {}
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
        {
          alt: '',
          border: '',
          hspace: '15',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin-left: 15px; margin-right: 15px;',
          vspace: '',
          borderstyle: ''
        }
      ),
      createTestUpdatedStyle(
        'Advanced image dialog non-shorthand vertical margin style change test',
        'margin-top: 15px; margin-bottom: 15px;',
        {
          alt: '',
          border: '',
          hspace: '',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin-top: 15px; margin-bottom: 15px;',
          vspace: '15',
          borderstyle: ''
        }
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 1 value style change test',
        'margin: 5px;',
        {
          alt: '',
          border: '',
          hspace: '5',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin: 5px;',
          vspace: '5',
          borderstyle: ''
        }
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 2 value style change test',
        'margin: 5px 10px;',
        {
          alt: '',
          border: '',
          hspace: '10',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin: 5px 10px 5px 10px;',
          vspace: '5',
          borderstyle: ''
        }
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 2 value style change test',
        'margin: 5px 10px;',
        {
          alt: '',
          border: '',
          hspace: '10',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin: 5px 10px 5px 10px;',
          vspace: '5',
          borderstyle: ''
        }
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 3 value style change test',
        'margin: 5px 10px 15px;',
        {
          alt: '',
          border: '',
          hspace: '10',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin: 5px 10px 15px 10px;',
          vspace: '',
          borderstyle: ''
        }
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 4 value style change test',
        'margin: 5px 10px 15px 20px;',
        {
          alt: '',
          border: '',
          hspace: '',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin: 5px 10px 15px 20px;',
          vspace: '',
          borderstyle: ''
        }
      ),
      createTestUpdatedStyle(
        'Advanced image dialog shorthand margin 4 value style change test',
        'margin: 5px 10px 15px 20px; margin-top: 15px;',
        {
          alt: '',
          border: '',
          hspace: '',
          src: {
            value: '',
            meta: {}
          },
          style: 'margin: 15px 10px 15px 20px;',
          vspace: '15',
          borderstyle: ''
        }
      )
    ];
    Pipeline.async({}, suiteArr, onSuccess, onFailure);
  }, {
      theme: 'silver',
      plugins: 'image',
      indent: false,
      skin_url: '/project/js/tinymce/skins/oxide/'
    }, success, failure);
});
