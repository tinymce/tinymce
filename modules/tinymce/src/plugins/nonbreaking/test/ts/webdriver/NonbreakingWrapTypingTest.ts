import { ApproxStructure, Log, Pipeline, RealKeys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import theme from 'tinymce/themes/silver/Theme';
import Env from 'tinymce/core/api/Env';

UnitTest.asynctest('webdriver.tinymce.plugins.nonbreaking.NonbreakingWrapTypingTest', (success, failure) => {
  // Note: Uses RealKeys, so needs a browser. Headless won't work.

  theme();
  NonbreakingPlugin();

  const isGecko = Env.browser.isFirefox();
  const isGeckoOrIE = isGecko || Env.browser.isIE();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-3647', '1. NonBreaking: Click on the nbsp button then type some text, and assert content is correct', [
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is('\uFEFF' + 'test'))
                ]
              })
            ]
          });
        }))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '2. NonBreaking: Add text to editor, click on the nbsp button, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([0, 0], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test')),
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is('\uFEFF'))
                ]
              })
            ]
          });
        }))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '3. NonBreaking: Add content to editor, click on the nbsp button then type some text, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([0, 0], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test')),
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is('\uFEFF' + 'test'))
                ]
              })
            ]
          });
        }))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '4. NonBreaking: Click on the nbsp button then type a space, and assert content is correct', [
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text(' ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(isGeckoOrIE ? '\uFEFF' + ' ' : '\uFEFF' + '\u00a0'))
                ].concat(isGecko ? [ s.element('br', {})] : [])
              })
            ]
          });
        }))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '5. NonBreaking: Add text to editor, click on the nbsp button and add content plus a space, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([0, 0], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test')),
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is('\uFEFF'))
                ]
              })
            ]
          });
        })),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test')),
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(isGeckoOrIE ? '\uFEFF' + 'test ' : '\uFEFF' + 'test\u00a0'))
                ].concat(isGecko ? [ s.element('br', {})] : [])
              })
            ]
          });
        })),
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '6. NonBreaking: Add text to editor, click on the nbsp button and add content plus a space, repeat, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([0, 0], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test')),
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is('\uFEFF'))
                ]
              })
            ]
          });
        })),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test')),
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(isGeckoOrIE ? '\uFEFF' + 'test ' : '\uFEFF' + 'test\u00a0'))
                ].concat(isGecko ? [ s.element('br', {})] : [])
              })
            ]
          });
        })),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('test')),
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(isGeckoOrIE ? '\uFEFF' + 'test test ' : '\uFEFF' + 'test test\u00a0'))
                ].concat(isGecko ? [ s.element('br', {})] : [])
              })
            ]
          });
        })),
      ]),

    ], onSuccess, onFailure);
  }, {
    plugins: 'nonbreaking',
    toolbar: 'nonbreaking',
    nonbreaking_wrap: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
