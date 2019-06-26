import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import Env from 'tinymce/core/api/Env';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('TextcolorSanityTest', (success, failure) => {
  SilverTheme();

  const browser = PlatformDetection.detect().browser;

  const forecolorStruct = ApproxStructure.build(function (s, str) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                color: str.is(Env.ie && Env.ie <= 11 ? '#236FA1' : 'rgb(35, 111, 161)')
              }
            }),
            s.text(str.is(' test'))
          ]
        })
      ]
    });
  });

  const backcolorStruct = ApproxStructure.build(function (s, str) {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                'background-color': str.is('rgb(35, 111, 161)')
              }
            }),
            s.text(str.is(' test'))
          ]
        })
      ]
    });
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, browser.isIE() ? [] : [
      Log.stepsAsStep('TBA', 'TextColor: forecolor', [
        tinyApis.sFocus,
        tinyApis.sSetContent('hello test'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 5),
        tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click green color', 'div[data-mce-color="#2DC26B"]'),
        tinyUi.sClickOnToolbar('click forecolor again', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click on dark blue color', 'div[data-mce-color="#236FA1"]'),
        tinyApis.sAssertContentStructure(forecolorStruct)
      ]),
      Log.stepsAsStep('TBA', 'TextColor: backcolor', [
        tinyApis.sFocus,
        tinyApis.sSetContent('hello test'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 5),
        tinyUi.sClickOnToolbar('click backcolor', '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click green color', 'div[data-mce-color="#2DC26B"]'),
        tinyUi.sClickOnToolbar('click backcolor again', '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click on dark blue color', 'div[data-mce-color="#236FA1"]'),
        tinyApis.sAssertContentStructure(backcolorStruct)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: 'forecolor backcolor fontsizeselect',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
