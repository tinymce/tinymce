import { ApproxStructure, Log, Pipeline, RealKeys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import theme from 'tinymce/themes/silver/Theme';
import Env from 'tinymce/core/api/Env';
import VisualCharsPlugin from 'tinymce/plugins/visualchars/Plugin';

UnitTest.asynctest('webdriver.tinymce.plugins.nonbreaking.NonbreakingVisualCharsTypingTest', (success, failure) => {
  // Note: Uses RealKeys, so needs a browser. Headless won't work.

  theme();
  NonbreakingPlugin();
  VisualCharsPlugin();

  const isIE = Env.ie && Env.ie <= 11;

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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(isIE ? 'test' : '\uFEFF' + 'test'))
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(Env.gecko ? '\uFEFF' + ' ' : (isIE ? ' ' : '\uFEFF' + '\u00a0')))
                ].concat(Env.gecko ? [ s.element('br', {})] : [])
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(Env.gecko ? '\uFEFF' + 'test ' : (isIE ? 'test ' : '\uFEFF' + 'test\u00a0')))
                ].concat(Env.gecko ? [ s.element('br', {})] : [])
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(Env.gecko ? '\uFEFF' + 'test ' : (isIE ? 'test ' : '\uFEFF' + 'test\u00a0')))
                ].concat(Env.gecko ? [ s.element('br', {})] : [])
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
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                    children: [
                      s.text(str.is('\u00a0'))
                    ]
                  }),
                  s.text(str.is(Env.gecko ? '\uFEFF' + 'test test ' : (isIE ? 'test test ' : '\uFEFF' + 'test test\u00a0')))
                ].concat(Env.gecko ? [ s.element('br', {})] : [])
              })
            ]
          });
        })),
      ]),

    ], onSuccess, onFailure);
  }, {
    plugins: 'nonbreaking visualchars',
    toolbar: 'nonbreaking visualchars',
    visualchars_default_state: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
