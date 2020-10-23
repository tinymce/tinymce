import { ApproxStructure, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('TextColorFormattingTest', (success, failure) => {
  if (Env.browser.isIE()) {
    return success();
  }
  SilverTheme();

  const backcolorTitleStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                'background-color': str.is('rgb(224, 62, 45)')
              },
              children: [
                s.text(str.is('𢫕'))
              ]
            })
          ]
        })
      ]
    }));

  const forecolorTitleStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                color: str.is('rgb(224, 62, 45)')
              },
              children: [
                s.text(str.is('圓'))
              ]
            })
          ]
        })
      ]
    }));

  const forecolorStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('Hello')),
            s.element('span', {
              styles: {
                color: str.is('rgb(53, 152, 219)')
              },
              children: [
                s.text(str.is(Unicode.nbsp))
              ]
            }),
            s.text(str.is('world'))
          ]
        })
      ]
    }));

  const forecolorTextStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                color: str.is('rgb(53, 152, 219)')
              },
              children: [
                s.text(str.is('Hello'))
              ]
            }),
            s.text(str.is(Unicode.nbsp + 'world'))
          ]
        })
      ]
    }));

  const backcolorStruct = ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('Hello')),
            s.element('span', {
              styles: {
                'background-color': str.is('rgb(53, 152, 219)')
              },
              children: [
                s.text(str.is(Unicode.nbsp))
              ]
            }),
            s.text(str.is('world'))
          ]
        })
      ]
    }));

  TinyLoader.setupInBodyAndShadowRoot((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'TextColor: Forecolor on non breaking space', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(`Hello${Unicode.nbsp}world`),
        tinyApis.sSetSelection([ 0, 0 ], 5, [ 0, 0 ], 6),
        tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('select blue color', 'div[data-mce-color="#3598DB"]'),
        tinyApis.sAssertContentStructure(forecolorStruct)
      ]),
      Log.stepsAsStep('TBA', 'TextColor: Backcolor on non breaking space', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(`Hello${Unicode.nbsp}world`),
        tinyApis.sSetSelection([ 0, 0 ], 5, [ 0, 0 ], 6),
        tinyUi.sClickOnToolbar('click backcolor', '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('select blue color', 'div[data-mce-color="#3598DB"]'),
        tinyApis.sAssertContentStructure(backcolorStruct)
      ]),
      Log.stepsAsStep('TBA', 'TextColor: Forecolor for a special char', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('圓'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click red color', 'div[title="Red"]'),
        tinyApis.sAssertContentStructure(forecolorTitleStruct)

      ]),
      Log.stepsAsStep('TBA', 'TextColor: Backcolor for a special char that is 4-Byte UTF-8', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p>&#142037;</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 2),
        tinyUi.sClickOnToolbar('click backcolor', '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click red color', 'div[title="Red"]'),
        tinyApis.sAssertContentStructure(backcolorTitleStruct)
      ]),
      Log.stepsAsStep('TINY-4838', 'TextColor: Remove forecolor with collapsed selection', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(`Hello${Unicode.nbsp}world`),
        tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 2),
        tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('select blue color', 'div[data-mce-color="#3598DB"]'),
        tinyApis.sAssertContentStructure(forecolorTextStruct),
        tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('select remove color', 'div[title="Remove color"]'),
        tinyApis.sAssertContent('<p>Hello&nbsp;world</p>')
      ])
    ], onSuccess, onFailure);

  }, {
    plugins: '',
    toolbar: 'forecolor backcolor fontsizeselect',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
