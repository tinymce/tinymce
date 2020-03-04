import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { Unicode } from '@ephox/katamari/src/main/ts/ephox/katamari/api/Main';
import Env from 'tinymce/core/api/Env';

UnitTest.asynctest('TextColorFormattingTest', (success, failure) => {
  if (Env.browser.isIE()) {
    return success();
  }
  SilverTheme();

  const backcolorTitleStruct = ApproxStructure.build((s, str) => {
    return s.element('body' , {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                'background-color': str.is('rgb(224, 62, 45)')
              },
              children: [
                s.text(str.is('𢫕')),
              ]
            })
          ]
        })
      ]
    });
  });

  const forecolorTitleStruct = ApproxStructure.build((s, str) => {
    return s.element('body' , {
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
    });
  });

  const forecolorStruct = ApproxStructure.build((s, str) => {
    return s.element('body', {
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
    });

}
);
  const backcolorStruct = ApproxStructure.build((s, str) => {
    return s.element('body', {
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
   });
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({} , [
      Log.stepsAsStep('TBA', 'TextColor: Forecolor on non breaking space', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(`Hello${Unicode.nbsp}world`),
        tinyApis.sSetSelection([0, 0], 5, [0, 0], 6),
        tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('select blue color', 'div[data-mce-color="#3598DB"]'),
        tinyApis.sAssertContentStructure(forecolorStruct),
      ]),
      Log.stepsAsStep('TBA', 'TextColor: Backcolor on non breaking space', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(`Hello${Unicode.nbsp}world`),
        tinyApis.sSetSelection([0, 0], 5, [0, 0], 6),
        tinyUi.sClickOnToolbar('click backcolor', '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('select blue color', 'div[data-mce-color="#3598DB"]'),
        tinyApis.sAssertContentStructure(backcolorStruct),
      ]),
      Log.stepsAsStep('TBA', 'TextColor: Forecolor for a special char', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('圓'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click red color', 'div[title="Red"]'),
        tinyApis.sAssertContentStructure(forecolorTitleStruct),

      ]),
      Log.stepsAsStep('TBA', 'TextColor: Backcolor for a special char that is 4-Byte UTF-8', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p>&#142037;</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 2),
        tinyUi.sClickOnToolbar('click backcolor', '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron'),
        tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
        tinyUi.sClickOnUi('click red color', 'div[title="Red"]'),
        tinyApis.sAssertContentStructure(backcolorTitleStruct),
      ]),

    ], onSuccess, onFailure );

  }, {
    plugins: '',
    toolbar: 'forecolor backcolor fontsizeselect',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
